import { Handler } from 'aws-lambda';
import {
  SendMessagesCommand,
  SendMessagesCommandInput,
  PinpointClient,
} from '@aws-sdk/client-pinpoint';

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
};

export const handler: Handler = async (event) => {
  try {
  } catch (err) {}
};
