import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class ApiGwStepFunctionsIntegration extends Construct {
  invokeStateMachineLambda: lambda.Function;
  processTaskTokenLambda: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    props: { stateMachineArn: string }
  ) {
    super(scope, id);
    this.invokeStateMachineLambda = new lambda.Function(
      this,
      'lmk-invoke-state-machine',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromInline(`
          const { SFNClient, StartExecutionCommand } = require('@aws-sdk/client-sfn');

          const stepFunctionsClient = new SFNClient({ region: 'us-east-1' });

          exports.handler = async (event) => {
            try {
                const params = {
                    stateMachineArn: process.env.STATE_MACHINE_ARN,
                    input: event.body
                };

                // Start the execution of the state machine
                const startExecutionCommand = new StartExecutionCommand(params);
                const response = await stepFunctionsClient.send(startExecutionCommand);

                // Return the execution ARN or any other response
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        executionArn: response.executionArn
                    })
                };
            } catch (error) {
                console.error('Error invoking state machine:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        error: 'Error invoking state machine'
                    })
                };
            }
        };

      `),
        environment: {
          STATE_MACHINE_ARN: props.stateMachineArn,
        },
      }
    );

    this.processTaskTokenLambda = new lambda.Function(
      this,
      'lmkn-check-resp-lambda',
      {
        functionName: 'lmkn-check-resp-lambda',
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
            if (response.Items[0].authenticated.BOOL === true) {
              return { valid: false, authenticated: true }
            }
            return { taskToken: response.Items[0].taskToken.S, valid: true, userId: response.Items[0].userId.S };
          } else {
            return { valid: false }
          }
        }

        const sendTaskSuccess = async (taskToken, userId) => {
          const sfnCommand = new SendTaskSuccessCommand({
            taskToken,
            output: JSON.stringify({ "userId": userId })
          });
          await sfnClient.send(sfnCommand);

          return "OK"
        }

        exports.handler = async (event) => {
          const parsed = JSON.parse(event.body);
          const code = parsed.code;
          const userPhone = parsed.userPhone;
          const result = await queryDynamoForTaskToken(code, userPhone);
          if (!result.valid) {
            if (result.authenticated) {
              return {
                statusCode: 400,
                body: JSON.stringify({ error: "Already Authenticated" })
              }
            }
            return {
              statusCode: 403,
              body: JSON.stringify({ error: "Invalid Code!" })
            }
          }
          await sendTaskSuccess(result.taskToken, result.userId);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success!" })
          }
        }`),
      }
    );
    const api = new apigw.RestApi(this, 'lmkn-lambda-api');

    // Create auth-code Lambda
    const resource1 = api.root.addResource('auth-code');
    const integration1 = new apigw.LambdaIntegration(
      this.invokeStateMachineLambda
    );
    resource1.addMethod('POST', integration1);

    // Validate taskToken/code lambda
    const resource2 = api.root.addResource('validate');
    const integration2 = new apigw.LambdaIntegration(
      this.processTaskTokenLambda
    );
    resource2.addMethod('POST', integration2);
  }
}
