import { DynamoDB, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { Handler } from 'aws-lambda';
import {
  SendMessagesCommand,
  SendMessagesCommandInput,
  PinpointClient,
} from '@aws-sdk/client-pinpoint';

const pinClient = new PinpointClient({ region: 'us-east-1' });
const client = new DynamoDB({ region: 'us-east-1' });

const sendTextMessage = async (userPhone: string, accessCode: string) => {
  const originationNumber = process.env.SMS_ORIGINATION_NUMBER;
  const destinationNumber = userPhone;
  const message = `Your lmkn.net one-time Passcode is ${accessCode}`;
  const messageType = 'TRANSACTIONAL';

  const params: SendMessagesCommandInput = {
    ApplicationId: process.env.SMS_APPLICATION_ID,
    MessageRequest: {
      Addresses: {
        [destinationNumber]: {
          ChannelType: 'SMS',
        },
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: message,
          MessageType: messageType,
          OriginationNumber: originationNumber,
          Keyword: process.env.SMS_REGISTRATION_KEYWORD,
        },
      },
    },
  };

  const data = await pinClient.send(new SendMessagesCommand(params));
  console.log(
    'Message sent! ' +
      data.MessageResponse?.Result?.[destinationNumber]['StatusMessage']
  );
  return data;
};

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

    await sendTextMessage(userPhone, tempAccessCode);

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
    // ReturnValues: 'ALL_NEW',
  };

  await client.send(new UpdateItemCommand(params));
  return random5DigitNumber;
};
