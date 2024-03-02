import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { dynamoClient, router } from '../../api-libs';

export default router
  .clone()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getIronSession<{ userId: string }>(req, res, {
      password: process.env.IRON_SESSION_PWD!,
      cookieName: 'userId',
    });

    if (!session.userId) {
      return res.status(404).send({ error: 'User not Found' });
    }
    // Database Lookup - does user already exist
    const queryCommand = new QueryCommand({
      TableName: 'lmk-user-table',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: session.userId },
      },
    });

    const data = await dynamoClient.send(queryCommand);

    if (data.Items && data.Items.length) {
      const returnData = unmarshall(data.Items[0]);
      const { pin, ...rest } = returnData;

      return res.send({ data: rest, success: true });
    }
    return res.send({ success: false, message: 'User Does not Exist!' });
  })
  .handler();
