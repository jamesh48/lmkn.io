import { DynamoDB, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { Handler } from 'aws-lambda';
const client = new DynamoDB({ region: 'us-east-1' });

const deleteUser = async (userId: string) => {
  const params = {
    TableName: 'lmk-user-table',
    Key: {
      userId: { S: userId },
    },
  };

  const deleteUserCommand = new DeleteItemCommand(params);
  await client.send(deleteUserCommand);
  return 'ok';
};

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event));
  await deleteUser(event.userId);
  return 'ok';
};
