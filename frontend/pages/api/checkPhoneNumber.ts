import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoClient, router } from '../../api-libs';

export default router
  .clone()
  .get(async (req, res) => {
    const userPhone = req.query.userPhone as string;
    // Database Lookup - does user already exist
    const queryCommand = new QueryCommand({
      TableName: 'lmk-user-table',
      IndexName: 'userPhoneGSI',
      KeyConditionExpression: 'userPhone = :userPhone',
      ExpressionAttributeValues: {
        ':userPhone': { S: userPhone },
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
