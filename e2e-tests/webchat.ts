// eslint-disable-next-line import/no-extraneous-dependencies
import { Browser, expect } from '@playwright/test';
import { ChatStatement, ChatStatementOrigin } from './chatModel';

// const ASELO_DEV_CHAT_URL = 'https://tl-public-chat-staging.s3.amazonaws.com/chat-staging.html';
const E2E_CHAT_URL = 'https://tl-public-chat-e2e-dev.s3.amazonaws.com/e2e-chat-development.html';

export type WebChatPage = {
  openChat: () => Promise<void>;
  selectHelpline: (helpline: string) => Promise<void>;
  chat: (statements: ChatStatement[]) => AsyncIterable<ChatStatement>;
  close: () => Promise<void>;
};

export async function open(browser: Browser): Promise<WebChatPage> {
  const page = await browser.newPage();
  const chatPanelWindow = page.locator('div.Twilio-MainContainer');
  const selectors = {
    chatPanelWindow,
    toggleChatOpenButton: page.locator('button.Twilio-EntryPoint'),

    //Pre engagement
    preEngagementWindow: page.locator('div.Twilio-PreEngagementCanvas'),
    helplineDropdown: page.locator('div#select-helpline'),
    helplineOptions: page.locator('div#menu-helpline ul'),
    startChatButton: page.locator(
      'div.Twilio-PreEngagementCanvas button.Twilio-DynamicForm-submit',
    ),

    //Chatting
    chatMessageArea: page.locator('div.Twilio-MessagingCanvas'),
    chatInput: page.locator('.Twilio-MessageInputArea-TextArea textarea'),
    chatSendButton: page.locator('button.Twilio-MessageInput-SendButton'),
    messageBubbles: page.locator('div.Twilio-MessageListItem div.Twilio-MessageBubble'),
    chatAvatars: page.locator('div.Twilio-MessageListItem div.Twilio-ChatItem-Avatar'),
    messageWithText: (text: string) =>
      chatPanelWindow.locator(
        `div.Twilio-MessageListItem div.Twilio-MessageBubble-Body:text-is("${text}")`,
      ),
  };
  await page.goto(E2E_CHAT_URL);
  console.log('Waiting for start chat button to render.');
  await selectors.toggleChatOpenButton.waitFor();
  console.log('Found start chat button.');

  return {
    openChat: async () => {
      await expect(selectors.chatPanelWindow).toHaveCount(0, { timeout: 500 });
      await selectors.toggleChatOpenButton.click();
      await expect(selectors.chatPanelWindow).toBeVisible();
    },
    selectHelpline: async (helpline: string) => {
      await selectors.preEngagementWindow.waitFor();
      await expect(selectors.helplineOptions).toHaveCount(0);
      await selectors.helplineDropdown.click();
      await expect(selectors.helplineOptions).toBeVisible();
      await selectors.helplineOptions.locator(`li[data-value='${helpline}']`).click();
      await expect(selectors.helplineOptions).toHaveCount(0);
    },

    /**
     * This function runs the 'caller side' of a webchat conversation.
     * It will loop through a list of chat statements, typing and sending caller statements in the webchat client
     * As soon as it hits a caller statement in the list, it will yield execution back to the calling code, so it can action the caller statement(s)
     *
     * A similar function exists in flexChat.ts to handle actioning the counselor side of the conversation.
     * This means that they can both be looping through the same conversation, yielding control when they hit a statement the other chat function needs to handle
     * @param statements - a unified list of all the chat statements in a conversation, for caller and counselor
     */
    chat: async function* (statements: ChatStatement[]): AsyncIterable<ChatStatement> {
      await selectors.startChatButton.click();
      await selectors.chatInput.waitFor();

      for (const statementItem of statements) {
        const { text, origin }: ChatStatement = statementItem;
        switch (origin) {
          case ChatStatementOrigin.CALLER:
            await selectors.chatInput.fill(text);
            await selectors.chatSendButton.click();
            break;
          case ChatStatementOrigin.BOT:
            await selectors.messageWithText(text).waitFor({ timeout: 60000, state: 'attached' });
            break;
          default:
            yield statementItem;
            await selectors.messageWithText(text).waitFor({ timeout: 60000, state: 'attached' });
        }
      }
    },
    close: async () => {
      await page.close();
    },
  };
}
