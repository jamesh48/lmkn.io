import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

export default router
  .clone()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const userPassword = req.body.userPassword;
    const userId = req.body.userId;

    // Database Lookup - does user already exist
    const queryCommand = new QueryCommand({
      TableName: 'lmk-user-table',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    });

    const userResult = await client.send(queryCommand);
    if (userResult.Items && userResult.Items.length) {
      const hashedPassword = userResult.Items[0].userPassword.S;
      if (hashedPassword) {
        const result = await bcrypt.compare(userPassword, hashedPassword);
        if (result) {
          const session = await getIronSession<{ userId: string }>(req, res, {
            cookieName: 'userId',
            password: process.env.IRON_SESSION_PWD!,
          });
          session.userId = userId;
          await session.save();

          return res.status(200).send({ result });
        }
        return res.status(403).send({ result });
      }
    }

    return res.status(500).send({ error: 'internal server error' });
  })
  .handler();
