import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { StepFunctionsAuthFlow } from './step-function-auth';
import { LMKNFrontendStack } from './frontend';

interface LMKStackProps extends cdk.StackProps {
  aws_env: {
    AWS_ALB_LISTENER_ARN: string;
    AWS_CLUSTER_ARN: string;
    AWS_DEFAULT_SG: string;
    AWS_VPC_ID: string;
  };
  svc_env: {
    AUTH_ENDPOINT: string;
    SALT: string;
  };
}
export class LMKStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LMKStackProps) {
    super(scope, id, props);

    const userTable = new dynamodb.Table(this, 'lmk-user-table', {
      tableName: 'lmk-user-table',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Add Global Secondary Index (GSI)
    userTable.addGlobalSecondaryIndex({
      indexName: 'userPhoneGSI',
      partitionKey: {
        name: 'userPhone',
        type: dynamodb.AttributeType.STRING,
      },
    });

    new iam.Role(this, 'lmkn-send-msg-role', {
      assumedBy: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
      inlinePolicies: {
        SendMessagePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:CreateLogGroup',
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['mobiletargeting:SendMessages'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'mobiletargeting:GetEndpoint',
                'mobiletargeting:UpdateEndpoint',
                'mobiletargeting:PutEvents',
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['mobiletargeting:SendOTPMessage'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['mobiletargeting:PhoneNumberValidate'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'pinpoint:SendMessages',
                'pinpoint:UpdateDestination',
                'pinpoint:SendDestinationVerificationCode',
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'sms-voice:SendTextMessage',
                'sms-voice:CreateVerifiedDestinationNumber',
                'sms-voice:SendDestinationNumberVerificationCode',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    new LMKNFrontendStack(this, 'lmkn-frontend-stack', {
      aws_env: props.aws_env,
      svc_env: props.svc_env,
    });
    new StepFunctionsAuthFlow(this, 'lmk-auth-flow', { userTable });
  }
}
