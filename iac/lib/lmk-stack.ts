import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { StepFunctionsAuthFlow } from './step-function-auth';
import { LMKNFrontendStack } from './frontend';

interface LMKStackProps extends cdk.StackProps {
  aws_env: {
    AWS_ALB_LISTENER_ARN: string;
    AWS_CLUSTER_ARN: string;
    AWS_DEFAULT_SG: string;
    AWS_VPC_ID: string;
    SMS_APPLICATION_ID: string;
    SMS_REGISTRATION_KEYWORD: string;
    SMS_ORIGINATION_NUMBER: string;
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

    new LMKNFrontendStack(this, 'lmkn-frontend-stack', {
      aws_env: props.aws_env,
      svc_env: props.svc_env,
    });

    new StepFunctionsAuthFlow(this, 'lmk-auth-flow', {
      userTable,
      env: {
        SMS_APPLICATION_ID: props.aws_env.SMS_APPLICATION_ID,
        SMS_REGISTRATION_KEYWORD: props.aws_env.SMS_REGISTRATION_KEYWORD,
        SMS_ORIGINATION_NUMBER: props.aws_env.SMS_ORIGINATION_NUMBER,
      },
    });
  }
}
