import { NextApiRequest, NextApiResponse } from 'next';
import { router, dynamoClient } from '../../api-libs';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { QueryCommand } from '@aws-sdk/client-dynamodb';

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

    const userResult = await dynamoClient.send(queryCommand);
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
