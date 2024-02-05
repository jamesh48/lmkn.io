import { DynamoDB, QueryCommand } from '@aws-sdk/client-dynamodb';
import { SFNClient, SendTaskSuccessCommand } from '@aws-sdk/client-sfn';
import { Handler } from 'aws-lambda';

const client = new DynamoDB({ region: 'us-east-1' });
const sfnClient = new SFNClient({ region: 'us-east-1' });

const queryDynamoForTaskToken = async (tempCode: string, userPhone: string) => {
  const queryCommand = new QueryCommand({
    TableName: 'lmk-user-table',
    IndexName: 'userPhoneGSI',
    KeyConditionExpression: 'userPhone = :userPhone',
    ExpressionAttributeValues: {
      ':userPhone': { S: userPhone },
    },
  });

  const response = await client.send(queryCommand);

  // User with Phone Number Found
  if (response.Items && response.Items.length) {
    // User is Already Authenticated
    if (response.Items[0].authenticated.BOOL === true) {
      return { valid: false, authenticated: true };
    }
    // Invalid Code
    if (response.Items[0].code.S !== tempCode) {
      return {
        valid: false,
      };
    }
    // Valid Code, Success Case
    return {
      taskToken: response.Items[0].taskToken.S,
      valid: true,
      userId: response.Items[0].userId.S,
    };
  } else {
    // Phone Number not found
    return { valid: false };
  }
};

const sendTaskSuccess = async (taskToken: string, userId: string) => {
  const sfnCommand = new SendTaskSuccessCommand({
    taskToken,
    output: JSON.stringify({ userId: userId }),
  });
  await sfnClient.send(sfnCommand);

  return 'OK';
};

export const handler: Handler = async (event) => {
  const parsed = JSON.parse(event.body);
  const code = parsed.code;
  const userPhone = parsed.userPhone;
  const result = await queryDynamoForTaskToken(code, userPhone);
  if (!result.valid) {
    if (result.authenticated) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Already Authenticated' }),
      };
    }
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Invalid Code!' }),
    };
  }
  if (result.taskToken && result.userId) {
    await sendTaskSuccess(result.taskToken, result.userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success!' }),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Internal Server Error' }),
  };
};
