import * as cdk from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
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
    props: {
      userTable: dynamodb.Table;
      iamRole: iam.Role;
      env: {
        SMS_APPLICATION_ID: string;
        SMS_REGISTRATION_KEYWORD: string;
        SMS_ORIGINATION_NUMBER: string;
      };
    }
  ) {
    super(scope, id);

    this.sendCodeLambda = new lambda.Function(this, 'lmk-send-code-lambda', {
      functionName: 'lmk-send-code-lambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/sendCode'),
      role: props.iamRole,
      environment: {
        SMS_APPLICATION_ID: props.env.SMS_APPLICATION_ID,
        SMS_REGISTRATION_KEYWORD: props.env.SMS_REGISTRATION_KEYWORD,
        SMS_ORIGINATION_NUMBER: props.env.SMS_ORIGINATION_NUMBER,
      },
    });

    this.validCodeLambda = new lambda.Function(this, 'lmk-valid-code-lambda', {
      functionName: 'lmk-valid-code-lambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/validCode'),
    });

    this.invalidCodeLambda = new lambda.Function(
      this,
      'lmk-invalid-code-lambda',
      {
        functionName: 'lmk-invalid-code-lambda',
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('../backend/dist/invalidCode'),
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
