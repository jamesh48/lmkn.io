import { Handler } from 'aws-lambda';
import {
  SendMessagesCommand,
  SendMessagesCommandInput,
  PinpointClient,
} from '@aws-sdk/client-pinpoint';

const pinClient = new PinpointClient({ region: 'us-east-1' });

const sendTextMessage = async (destinationNumber: string, message: string) => {
  const originationNumber = process.env.SMS_ORIGINATION_NUMBER;
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

  await pinClient.send(new SendMessagesCommand(params));
};

export const handler: Handler = async (event) => {
  const parsed = JSON.parse(event.body);
  const userPhone = parsed.userPhone;
  const message = parsed.message;
  try {
    await sendTextMessage(userPhone, message);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'message sent!',
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    };
  }
};
