import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

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
        code: lambda.Code.fromAsset('../backend/dist/startExecution'),
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
        code: lambda.Code.fromAsset('../backend/dist/checkResponse'),
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
