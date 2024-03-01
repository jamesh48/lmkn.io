import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import router from '../../api-libs/base';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({ region: 'us-east-1' });

export default router
  .clone()
  .get(async (req, res) => {
    const userId = req.query.userId as string;

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
      const pinHash = userResult.Items[0].pin.S;
      if (pinHash) {
        const result = await bcrypt.compare(req.query.pin as string, pinHash);
        return res.send({ result });
      }
    }
    return res.status(500).send({ error: 'Internal server error' });
  })
  .handler();
