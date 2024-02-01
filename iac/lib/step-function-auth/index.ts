import * as cdk from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class StepFunctionsAuthFlow extends Construct {
  sendCodeLambda: lambda.Function;
  processTaskTokenLambda: lambda.Function;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.sendCodeLambda = new lambda.Function(this, 'lmk-send-code-lambda', {
      functionName: 'lmk-send-code-lambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
      const { DynamoDB, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
      const client = new DynamoDB({ region: 'us-east-1' })
      exports.handler = async (event) => {
        try {
          const userId =  event.userId;
          const taskToken = event.taskToken;

          const tempAccessCode = await storeCodeForUserInDynamo(userId, taskToken);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Code stored successfully', tempAccessCode })
          }
        } catch(error) {
          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error storing taskToken: ' + error.message })
          }
        }

      }

      function generateRandom5DigitNumber() {
        return Math.floor(10000 + Math.random() * 90000);
      }

      const storeCodeForUserInDynamo = async (userId, taskToken) => {
        const random5DigitNumber = generateRandom5DigitNumber().toString();

        const params = {
          TableName: 'lmk-user-table',
          Key: {
            'userId': { S: userId }
          },
          UpdateExpression: 'SET #taskToken = :taskToken, #c = :c',
          ExpressionAttributeNames: { '#taskToken': 'taskToken', '#c': 'code' },
          ExpressionAttributeValues: { ':taskToken': { S: taskToken }, ':c': { S: random5DigitNumber } },
          ReturnValues: 'ALL_NEW'
        };

        await client.send(new UpdateItemCommand(params));
        return random5DigitNumber;
      }
      `),
    });

    this.processTaskTokenLambda = new lambda.Function(
      this,
      'lmk-check-resp-lambda',
      {
        functionName: 'lmk-check-resp-lambda',
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(`
        const { DynamoDB, QueryCommand } = require('@aws-sdk/client-dynamodb');
        const { SFNClient, SendTaskSuccessCommand } = require('@aws-sdk/client-sfn');

        const client = new DynamoDB({ region: 'us-east-1' });
        const sfnClient = new SFNClient({ region: 'us-east-1' });

        const queryDynamoForTaskToken = async (tempCode, userPhone) => {
          const queryCommand = new QueryCommand({
            TableName: 'lmk-user-table',
            IndexName: 'userPhoneGSI',
            KeyConditionExpression: 'userPhone = :userPhone',
            ExpressionAttributeValues: {
              ':userPhone': { S: userPhone },
            },
          })
          const response = await client.send(queryCommand)

          if (response.Items && response.Items.length) {
            return { taskToken: response.Items[0].taskToken.S, valid: true };
          } else {
            return { valid: false }
          }
        }

        const sendTaskSuccess = async (taskToken, valid) => {
          if (valid === true) {
            const sfnCommand = new SendTaskSuccessCommand({
              taskToken,
              output: '{ "valid": true }'
            });
            await sfnClient.send(sfnCommand);
          }
          return "OK"
        }

        exports.handler = async (event) => {
          const code = event.code;
          const phone = event.phone;
          const result = await queryDynamoForTaskToken(code, phone);
          if (!result.valid) {
            return {
              statusCode: 403,
              body: JSON.stringify({ error: "Invalid Code!" })
            }
          }
          await sendTaskSuccess(result.taskToken, result.valid);
        }`),
      }
    );

    const validCodeLambda = new lambda.Function(this, 'lmk-valid-code-lambda', {
      functionName: 'lmk-valid-code-lambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`exports.handler = async () => {}`),
    });

    const invalidCodeLambda = new lambda.Function(
      this,
      'lmk-invalid-code-lambda',
      {
        functionName: 'lmk-invalid-code-lambda',
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(`exports.handler = async () => {}`),
      }
    );

    const processResult = new stepfunctions.Choice(this, 'ProcessResult').when(
      stepfunctions.Condition.booleanEquals('$.valid', true),
      new tasks.LambdaInvoke(this, 'ValidCode', {
        lambdaFunction: validCodeLambda,
      })
    );

    const definitionWithTasks = new tasks.LambdaInvoke(this, 'SendCode', {
      lambdaFunction: this.sendCodeLambda,
      integrationPattern: stepfunctions.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      payload: stepfunctions.TaskInput.fromObject({
        taskToken: stepfunctions.JsonPath.taskToken,
      }),
      taskTimeout: stepfunctions.Timeout.duration(cdk.Duration.minutes(10)),
    })
      .addCatch(
        new tasks.LambdaInvoke(this, 'InvalidCode', {
          lambdaFunction: invalidCodeLambda,
        })
      )
      .next(processResult);

    const stateMachine = new stepfunctions.StateMachine(
      this,
      'lmk-StateMachine',
      {
        definition: definitionWithTasks,
        timeout: cdk.Duration.minutes(5),
      }
    );
    this.sendCodeLambda.grantInvoke(stateMachine);
    stateMachine.grantTaskResponse(this.processTaskTokenLambda);
    validCodeLambda.grantInvoke(stateMachine);
    invalidCodeLambda.grantInvoke(stateMachine);
  }
}
