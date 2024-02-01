import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import router from '../../api-libs/base';

const client = new DynamoDBClient({ region: 'us-east-1' });

export default router
  .clone()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.query.userId as string;
    console.log(userId);
    // Database Lookup - does user already exist
    const queryCommand = new QueryCommand({
      TableName: 'lmk-user-table',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    });

    const data = await client.send(queryCommand);
    console.log(data);
    if (data.Items && data.Items.length) {
      return res.send({ data: unmarshall(data.Items[0]), success: true });
    }
    return res.send({
      success: false,
      message: 'User Phone Number Does not Exist!',
    });
  })
  .handler();
