import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';

const client = new DynamoDBClient({ region: 'us-east-1' });

export default router
  .clone()
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.body.updateField || !req.body.updateValue || !req.body.userId) {
      return res
        .status(400)
        .json({ error: 'Missing updateField or updateValue in request body' });
    }

    let { updateField, updateValue } = req.body;
    if (req.body.encrypt) {
      try {
        if (!process.env.SALT) {
          throw new Error('SALT is undefined');
        }
        // const salt = await bcrypt.genSalt(16);
        // console.log(salt);
        updateValue = await bcrypt.hash(req.body.updateValue, process.env.SALT);
      } catch (err) {
        console.error('Error hashing value:', err);
        return res.status(500).send({ error: 'Error hashing value' });
      }
    }

    try {
      const updateItemCommand = new UpdateItemCommand({
        TableName: 'lmk-user-table',
        Key: { userId: { S: req.body.userId } },
        UpdateExpression: `SET #attr = :value`,
        ExpressionAttributeNames: {
          '#attr': updateField,
        },
        ExpressionAttributeValues: {
          ':value': { S: updateValue },
        },
      });
      console.log(updateItemCommand.input);
      await client.send(updateItemCommand);
      return res.send({ message: 'ok' });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ error: 'Error!' });
    }
  })
  .handler();
