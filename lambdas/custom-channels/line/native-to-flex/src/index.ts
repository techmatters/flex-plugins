import { ALBEvent } from 'aws-lambda';

export const handler = async (event: ALBEvent): Promise<void> => {
  console.debug(
    'line/native-to-flex: Triggered by event:',
    JSON.stringify(event),
  );
};
