
export const handler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Goodbye ${event.pathParameters.accountSid}!`,
        foo: event.pathParameters.foo,
        event,
      },
      null,
      2
    ),
  };
};
