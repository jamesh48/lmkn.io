import * as cdk from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiGwStepFunctionsIntegration } from './apigw';

interface StepFunctionsAuthFlowProps {
  userTable: dynamodb.Table;
  env: {
    SMS_APPLICATION_ID: string;
    SMS_REGISTRATION_KEYWORD: string;
    SMS_ORIGINATION_NUMBER: string;
  };
}
export class StepFunctionsAuthFlow extends Construct {
  sendCodeLambda: lambda.Function;
  validCodeLambda: lambda.Function;
  invalidCodeLambda: lambda.Function;
  stateMachine: stepfunctions.StateMachine;
  iamRole: iam.Role;
  constructor(scope: Construct, id: string, props: StepFunctionsAuthFlowProps) {
    super(scope, id);

    this.iamRole = new iam.Role(this, 'lmkn-send-msg-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        SendMessagePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'mobiletargeting:SendMessages',
                'mobiletargeting:SendOTPMessage',
                'mobiletargeting:PhoneNumberValidate',
              ],
              resources: [
                'arn:aws:mobiletargeting:us-east-1:471507967541:apps/29260de985144481a4145de51995eaab/messages',
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:CreateLogGroup',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    this.sendCodeLambda = new lambda.Function(this, 'lmk-send-code-lambda', {
      functionName: 'lmk-send-code-lambda',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/sendCode'),
      role: this.iamRole,
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
        iamRole: this.iamRole,
        env: props.env,
      });

    this.stateMachine.grantStartExecution(invokeStateMachineLambda);
    this.stateMachine.grantTaskResponse(processTaskTokenLambda);
    props.userTable.grantFullAccess(processTaskTokenLambda);
    props.userTable.grantFullAccess(this.sendCodeLambda);
    props.userTable.grantWriteData(this.validCodeLambda);
    props.userTable.grantWriteData(this.invalidCodeLambda);
  }
}
