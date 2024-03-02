import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoClient, router } from '../../api-libs';

export default router
  .clone()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.query.userId as string;
    // Database Lookup - does user already exist
    const queryCommand = new QueryCommand({
      TableName: 'lmk-user-table',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    });

    const data = await dynamoClient.send(queryCommand);
    if (data.Items && data.Items.length) {
      return res.send({ data: unmarshall(data.Items[0]), success: true });
    }
    return res.send({
      success: false,
      message: 'User Phone Number Does not Exist!',
    });
  })
  .handler();
