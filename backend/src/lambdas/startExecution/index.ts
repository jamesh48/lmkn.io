import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { Handler } from 'aws-lambda';

const stepFunctionsClient = new SFNClient({ region: 'us-east-1' });

export const handler: Handler = async (event) => {
  try {
    const params = {
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      input: event.body,
    };

    const startExecutionCommand = new StartExecutionCommand(params);
    const response = await stepFunctionsClient.send(startExecutionCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        executionArn: response.executionArn,
      }),
    };
  } catch (error) {
    console.error('Error invoking state machine:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error invoking state machine',
      }),
    };
  }
};
