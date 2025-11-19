type ExpectedMessage = {
  sender: 'flex' | 'service-user';
  text: string;
};

export const verifyMessageExchange =
  (
    send: (text: string) => Promise<void>,
    expectToRecieve: (text: string) => Promise<void>,
  ) =>
  async (expectedExchange: ExpectedMessage[]) => {
    for (const { sender, text } of expectedExchange) {
      if (sender === 'service-user') {
        await send(text);
      } else {
        await expectToRecieve(text);
      }
    }
  };
