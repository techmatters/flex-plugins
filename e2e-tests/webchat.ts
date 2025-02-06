/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { Browser, BrowserContext, expect } from '@playwright/test';
import { ChatStatement, ChatStatementOrigin } from './chatModel';
import { getConfigValue } from './config';

const E2E_CHAT_URL = getConfigValue('webchatUrl') as string;

export type WebChatPage = {
  fillPreEngagementForm: () => Promise<void>;
  openChat: () => Promise<void>;
  selectHelpline: (helpline: string) => Promise<void>;
  chat: (statements: ChatStatement[]) => AsyncIterable<ChatStatement>;
  close: () => Promise<void>;
};

export async function open(browser: Browser | BrowserContext): Promise<WebChatPage> {
  const page = await browser.newPage();
  const chatPanelWindow = page.locator('div.Twilio-MainContainer');
  const selectors = {
    chatPanelWindow,
    toggleChatOpenButton: page.locator('button.Twilio-EntryPoint'),

    //Pre engagement
    preEngagementWindow: page.locator('div.Twilio-PreEngagementCanvas'),
    helplineDropdown: page.locator('div#select-helpline'),
    helplineOptions: page.locator('div#menu-helpline ul'),
    startChatButton: page.locator('div.Twilio-PreEngagementCanvas button[type="submit"]'),
    nameInput: page.locator("//input[@id='name' or @id='nickname']"),
    termsAndConditionsCheckbox: page.locator('input#termsAndConditions'),

    //Chatting
    chatMessageArea: page.locator('div.Twilio-MessagingCanvas'),
    chatInput: page.locator('.Twilio-MessageInputArea-TextArea textarea'),
    chatSendButton: page.locator('button.Twilio-MessageInput-SendButton'),
    messageBubbles: page.locator('div.Twilio-MessageListItem div.Twilio-MessageBubble'),
    chatAvatars: page.locator('div.Twilio-MessageListItem div.Twilio-ChatItem-Avatar'),
    messageWithText: (text: string) =>
      chatPanelWindow.locator(`div.Twilio-MessageListItem div:text-is("${text}")`),
  };
  await page.goto(E2E_CHAT_URL);
  console.log('Waiting for start chat button to render.');
  await selectors.toggleChatOpenButton.waitFor();
  console.log('Found start chat button.');

  return {
    fillPreEngagementForm: async () => {
      await selectors.preEngagementWindow.waitFor();
      if (await selectors.nameInput.isVisible()) {
        await selectors.nameInput.fill('name');
      }
      if (await selectors.termsAndConditionsCheckbox.isVisible()) {
        await selectors.termsAndConditionsCheckbox.check();
      }
    },

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
            console.log('Waiting for bot message:', text);
            await selectors.messageWithText(text).waitFor({ timeout: 60000, state: 'attached' });
            console.log('Found bot message:', text);
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
