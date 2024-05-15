import reverse from 'lodash/reverse';

const array = [1, 2, 3, 4, 5];
const reverseArray = reverse(array);

export const handler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Hello ${event.pathParameters.accountSid}!`,
        reverseArray,
        event,
      },
      null,
      2
    ),
  };
};
