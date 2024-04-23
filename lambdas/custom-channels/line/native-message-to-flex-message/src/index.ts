import { ALBEvent } from 'aws-lambda';

export const handler = async (event: ALBEvent): Promise<void> => {
  console.debug(
    'line/native-message-to-flex-message: Triggered by event:',
    JSON.stringify(event),
  );
};
