import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class LMKStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
  }
}
