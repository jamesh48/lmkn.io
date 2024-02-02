import * as cdk from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ApiGwStepFunctionsIntegration } from './apigw';

export class StepFunctionsAuthFlow extends Construct {
  sendCodeLambda: lambda.Function;
  validCodeLambda: lambda.Function;
  invalidCodeLambda: lambda.Function;
  stateMachine: stepfunctions.StateMachine;
  constructor(
    scope: Construct,
    id: string,
    props: { userTable: dynamodb.Table }
  ) {
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
          // input parameters
          const userId =  event.userId;
          const userPhone = event.userPhone;
          const userPassword = event.userPassword;
          const taskToken = event.taskToken;

          const tempAccessCode = await storeCodeForUserInDynamo(userId, userPhone, userPassword, taskToken);

          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Code stored successfully', tempAccessCode, userId })
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

      const storeCodeForUserInDynamo = async (userId, userPhone, userPassword, taskToken) => {
        const random5DigitNumber = generateRandom5DigitNumber().toString();

        const params = {
          TableName: 'lmk-user-table',
          Key: {
            'userId': { S: userId }
          },
          UpdateExpression: 'SET #taskToken = :taskToken, #userPhone = :userPhone, #userPassword = :userPassword, #c = :c, #authenticated = :authenticated',
          ExpressionAttributeNames: {
            '#taskToken': 'taskToken',
            '#userPhone': 'userPhone',
            '#userPassword': 'userPassword',
            '#c': 'code',
            '#authenticated': 'authenticated'
          },
          ExpressionAttributeValues: {
            ':taskToken': { S: taskToken },
            ':c': { S: random5DigitNumber },
            ':userPassword': { S: userPassword },
            ':userPhone': { S: userPhone },
            ':authenticated': { BOOL: false }
          },
          ReturnValues: 'ALL_NEW'
        };

        await client.send(new UpdateItemCommand(params));
        return random5DigitNumber;
      }
      `),
    });

    this.validCodeLambda = new lambda.Function(this, 'lmk-valid-code-lambda', {
      functionName: 'lmk-valid-code-lambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
      const { DynamoDB, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
      const client = new DynamoDB({ region: 'us-east-1' });

      const authenticateUser = async (userId) => {
        const params = {
          TableName: 'lmk-user-table',
          Key: {
            'userId': { S: userId }
          },
          UpdateExpression: 'SET #authenticatedAttr = :authenticatedValue REMOVE taskToken, code',
          ExpressionAttributeNames: { '#authenticatedAttr': 'authenticated' },
          ExpressionAttributeValues: { ':authenticatedValue': { BOOL: true }},
          ReturnValues: 'ALL_NEW'
        };

        const updateItemCommand = new UpdateItemCommand(params)
        await client.send(updateItemCommand);
      }

      exports.handler = async (event) => {
        console.log(JSON.stringify(event));
        await authenticateUser(event.userId);
        return 'ok'
      }`),
    });

    this.invalidCodeLambda = new lambda.Function(
      this,
      'lmk-invalid-code-lambda',
      {
        functionName: 'lmk-invalid-code-lambda',
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(`
        const { DynamoDB, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

        const client = new DynamoDB({ region: 'us-east-1' });

        const deleteUser = async (userId) => {
          const params = {
            TableName: 'lmk-user-table',
            Key: {
              userId: { S: userId }
            }
          }

          const deleteUserCommand = new DeleteItemCommand(params);
          await client.send(deleteUserCommand)
          return 'ok';
        };

        exports.handler = async (event) => {
          console.log(JSON.stringify(event))

          await deleteUser(event.userId);

          return 'ok'
        }`),
      }
    );

    const definitionWithTasks = new tasks.LambdaInvoke(this, 'SendCode', {
      lambdaFunction: this.sendCodeLambda,
      integrationPattern: stepfunctions.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      payload: stepfunctions.TaskInput.fromObject({
        taskToken: stepfunctions.JsonPath.taskToken,
        userId: stepfunctions.JsonPath.stringAt('$.userId'),
        userPassword: stepfunctions.JsonPath.stringAt('$.userPassword'),
        userPhone: stepfunctions.JsonPath.stringAt('$.userPhone'),
      }),
      taskTimeout: stepfunctions.Timeout.duration(cdk.Duration.minutes(10)),
    })
      // on timeout
      .addCatch(
        new tasks.LambdaInvoke(this, 'InvalidCode', {
          lambdaFunction: this.invalidCodeLambda,
          inputPath: stepfunctions.JsonPath.stringAt('$$.Execution.Input'),
        })
      )
      .next(
        new tasks.LambdaInvoke(this, 'ValidCode', {
          lambdaFunction: this.validCodeLambda,
        })
      );

    this.stateMachine = new stepfunctions.StateMachine(
      this,
      'lmk-StateMachine',
      {
        definition: definitionWithTasks,
        timeout: cdk.Duration.minutes(11),
      }
    );

    this.sendCodeLambda.grantInvoke(this.stateMachine);
    this.validCodeLambda.grantInvoke(this.stateMachine);
    this.invalidCodeLambda.grantInvoke(this.stateMachine);
    const { invokeStateMachineLambda, processTaskTokenLambda } =
      new ApiGwStepFunctionsIntegration(this, 'lmk-api-gw', {
        stateMachineArn: this.stateMachine.stateMachineArn,
      });

    this.stateMachine.grantStartExecution(invokeStateMachineLambda);
    this.stateMachine.grantTaskResponse(processTaskTokenLambda);
    props.userTable.grantFullAccess(processTaskTokenLambda);
    props.userTable.grantFullAccess(this.sendCodeLambda);
    props.userTable.grantWriteData(this.validCodeLambda);
    props.userTable.grantWriteData(this.invalidCodeLambda);
  }
}
