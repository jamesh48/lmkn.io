import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';

const client = new DynamoDBClient({ region: 'us-east-1' });

export default router
  .clone()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.query.userId as string;
    const userPhone = req.query.userPhone as string;
    const userPassword = req.query.userPassword as string;
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
      if (!process.env.SALT) {
        throw new Error('ENV SALT is not defined!');
      }
      const hashedPassword = await bcrypt.hash(userPassword, process.env.SALT);
      // If not, create user
      const putItemCommand = new PutItemCommand({
        TableName: 'lmk-user-table',
        Item: {
          userId: { S: userId },
          userPhone: { S: userPhone },
          userPassword: { S: hashedPassword },
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
  })
  .handler();
