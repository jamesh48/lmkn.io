import {
  DynamoDB,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { Handler } from 'aws-lambda';
const client = new DynamoDB({ region: 'us-east-1' });

const authenticateUser = async (userId: string) => {
  const params: UpdateItemCommandInput = {
    TableName: 'lmk-user-table',
    Key: {
      userId: { S: userId },
    },
    UpdateExpression:
      'SET #authenticatedAttr = :authenticatedValue REMOVE taskToken, code',
    ExpressionAttributeNames: { '#authenticatedAttr': 'authenticated' },
    ExpressionAttributeValues: { ':authenticatedValue': { BOOL: true } },
    ReturnValues: 'ALL_NEW',
  };

  const updateItemCommand = new UpdateItemCommand(params);
  await client.send(updateItemCommand);
};

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event));
  await authenticateUser(event.userId);
  return 'ok';
};
