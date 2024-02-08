import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const userExists = async (userId: string) => {
  const command = new QueryCommand({
    TableName: 'lmk-user-table',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId },
    },
  });
  const data = await client.send(command);

  if (data.Items?.length) {
    return { success: true, data: unmarshall(data.Items[0]) };
  }
  return { success: false, message: 'User Does not Exist!' };
};
