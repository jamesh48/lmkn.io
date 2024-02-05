const { DynamoDB, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
import { Handler } from 'aws-lambda';
const client = new DynamoDB({ region: 'us-east-1' });
export const handler: Handler = async (event) => {
  try {
    // input parameters
    const userId = event.userId;
    const userPhone = event.userPhone;
    const userPassword = event.userPassword;
    const taskToken = event.taskToken;

    const tempAccessCode = await storeCodeForUserInDynamo(
      userId,
      userPhone,
      userPassword,
      taskToken
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Code stored successfully',
        tempAccessCode,
        userId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error storing taskToken: ' + error.message,
      }),
    };
  }
};

function generateRandom5DigitNumber() {
  return Math.floor(10000 + Math.random() * 90000);
}

const storeCodeForUserInDynamo = async (
  userId: string,
  userPhone: string,
  userPassword: string,
  taskToken: string
) => {
  const random5DigitNumber = generateRandom5DigitNumber().toString();

  const params = {
    TableName: 'lmk-user-table',
    Key: {
      userId: { S: userId },
    },
    UpdateExpression:
      'SET #taskToken = :taskToken, #userPhone = :userPhone, #userPassword = :userPassword, #c = :c, #authenticated = :authenticated',
    ExpressionAttributeNames: {
      '#taskToken': 'taskToken',
      '#userPhone': 'userPhone',
      '#userPassword': 'userPassword',
      '#c': 'code',
      '#authenticated': 'authenticated',
    },
    ExpressionAttributeValues: {
      ':taskToken': { S: taskToken },
      ':c': { S: random5DigitNumber },
      ':userPassword': { S: userPassword },
      ':userPhone': { S: userPhone },
      ':authenticated': { BOOL: false },
    },
    ReturnValues: 'ALL_NEW',
  };

  await client.send(new UpdateItemCommand(params));
  return random5DigitNumber;
};
