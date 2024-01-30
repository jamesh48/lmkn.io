import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import nextConnect from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

const client = new DynamoDBClient({ region: 'us-east-1' });
const handler = nextConnect();

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string;
  const userPhone = req.query.userPhone as string;
  // ToDo Validate Inputs
  // Database Lookup - does user already exist
  const command = new QueryCommand({
    TableName: 'lmk-user-table',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId },
    },
  });
  const data = await client.send(command);
  if (data.Items?.length) {
    // If so, return error
    return res
      .status(400)
      .json({ error: 'User Already Exists', success: false });
  } else {
    // If not, create user
    const putItemCommand = new PutItemCommand({
      TableName: 'lmk-user-table',
      Item: {
        userId: { S: userId },
        userPhone: { S: userPhone },
      },
    });

    await client.send(putItemCommand);
    // Then set cookie on browser for persistence.
    const futureDate = new Date(
      new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000
    ); // 10 years from now
    res.setHeader(
      'Set-Cookie',
      `userId=${userId}; HttpOnly;Expires=${futureDate.toUTCString()}`
    );

    res.send({ success: true });
  }
});

export default handler;
