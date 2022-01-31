import { Page } from '@playwright/test';
import { ChatStatement, ChatStatementOrigin } from './chatModel';


export function flexChat(page: Page) {
  const taskCanvas = page.locator('div.Twilio-TaskCanvas');

  const selectors = {
    //Chatting
    chatMessageArea: taskCanvas.locator('div.Twilio-MessagingCanvas'),
    chatInput: taskCanvas.locator('.Twilio-MessageInputArea-TextArea textarea'),
    chatSendButton: taskCanvas.locator('button.Twilio-MessageInput-SendButton'),
    messageBubbles: taskCanvas.locator('div.Twilio-MessageListItem div.Twilio-MessageBubble'),
    messageWithText: (text: string) => taskCanvas.locator(`div.Twilio-MessageListItem div.Twilio-MessageBubble-Body:text-is("${text}")`)
  }

  return {

    chat: async function* (statements: ChatStatement[] ): AsyncIterator<ChatStatement> {
      await selectors.chatInput.waitFor();

      for(const statementItem of statements) {
        const { text, origin }: ChatStatement = statementItem;
        switch (origin) {
          case ChatStatementOrigin.COUNSELOR:
            console.log('Typing message in flex:', text);
            await selectors.chatInput.fill(text);
            console.log('Sending message in flex:', text);
            await selectors.chatSendButton.click();
            console.log('Sent message in flex:', text);
            break;
          case ChatStatementOrigin.CALLER:
            if (!(await selectors.messageWithText(text).count())) {
              // Not already sent
              yield statementItem;
            }
            await selectors.messageWithText(text).waitFor({ timeout: 60000});
            break;
        }
      }
    },
  }
}