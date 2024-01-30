import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import nextConnect from 'next-connect';

const client = new DynamoDBClient({ region: 'us-east-1' });
const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const userPhone = req.query.userPhone as string;
  console.log(userPhone);
  // Database Lookup - does user already exist
  const queryCommand = new QueryCommand({
    TableName: 'lmk-user-table',
    IndexName: 'userPhoneGSI',
    KeyConditionExpression: 'userPhone = :userPhone',
    ExpressionAttributeValues: {
      ':userPhone': { S: userPhone },
    },
  });

  const data = await client.send(queryCommand);

  if (data.Items && data.Items.length) {
    return res.send({ data: unmarshall(data.Items[0]), success: true });
  }
  return res.send({
    success: false,
    message: 'User Phone Number Does not Exist!',
  });
});

export default handler;
