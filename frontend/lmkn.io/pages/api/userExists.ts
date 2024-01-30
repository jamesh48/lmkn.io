import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

const client = new DynamoDBClient({ region: 'us-east-1' });
const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const user = req.query.userId as string;

  // Database Lookup - does user already exist
  const queryCommand = new QueryCommand({
    TableName: 'lmk-user-table',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: user },
    },
  });

  const data = await client.send(queryCommand);

  if (data.Items && data.Items.length) {
    return res.send({ data: data.Items, success: true });
  }
  return res.send({ success: false, message: 'User Does not Exist!' });
});

export default handler;