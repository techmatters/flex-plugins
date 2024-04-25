import { ALBEvent } from 'aws-lambda';

export const handler = async (event: ALBEvent): Promise<void> => {
  console.debug(
    'line/flex-message-to-native-message: Triggered by event:',
    JSON.stringify(event),
  );
};
