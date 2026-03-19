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

const E2E_ASELO_CHAT_URL = getConfigValue('aseloWebchatUrl') as string;

export type AseloWebChatPage = {
  fillPreEngagementForm: () => Promise<void>;
  openChat: () => Promise<void>;
  selectHelpline: (helpline: string) => Promise<void>;
  chat: (statements: ChatStatement[]) => AsyncIterable<ChatStatement>;
  close: () => Promise<void>;
};

export async function open(browser: Browser | BrowserContext): Promise<AseloWebChatPage> {
  const page = await browser.newPage();
  const selectors = {
    entryPointButton: page.locator('[data-testid="entry-point-button"]'),
    rootContainer: page.locator('[data-test="root-container"]'),

    // Pre-engagement
    preEngagementForm: page.locator('[data-test="pre-engagement-chat-form"]'),
    helplineSelect: page.locator('select#helpline'),
    startChatButton: page.locator('[data-test="pre-engagement-start-chat-button"]'),
    firstNameInput: page.locator('input#firstName'),
    contactIdentifierInput: page.locator('input#contactIdentifier'),
    ageSelect: page.locator('select#age'),
    genderSelect: page.locator('select#gender'),
    termsAndConditionsCheckbox: page.locator('input#termsAndConditions'),

    // Chatting
    chatInput: page.locator('[data-test="message-input-textarea"]'),
    chatSendButton: page.locator('[data-test="message-send-button"]'),
    messageBubbles: page.locator('[data-testid="message-bubble"]'),
    messageWithText: (text: string) =>
      page.locator(`[data-testid="message-bubble"] p:text-is("${text}")`),
  };

  await page.goto(E2E_ASELO_CHAT_URL);
  console.log('Waiting for entry point button to render.');
  await selectors.entryPointButton.waitFor();
  console.log('Found entry point button.');

  return {
    fillPreEngagementForm: async () => {
      await selectors.preEngagementForm.waitFor();
      if (await selectors.firstNameInput.isVisible()) {
        await selectors.firstNameInput.fill('Test');
        await selectors.firstNameInput.blur();
      }
      if (await selectors.contactIdentifierInput.isVisible()) {
        await selectors.contactIdentifierInput.fill('test@example.com');
        await selectors.contactIdentifierInput.blur();
      }
      if (await selectors.ageSelect.isVisible()) {
        await selectors.ageSelect.selectOption('10');
        await selectors.ageSelect.blur();
      }
      if (await selectors.genderSelect.isVisible()) {
        await selectors.genderSelect.selectOption('Girl');
        await selectors.genderSelect.blur();
      }
      if (await selectors.termsAndConditionsCheckbox.isVisible()) {
        await selectors.termsAndConditionsCheckbox.check();
        await selectors.termsAndConditionsCheckbox.blur();
      }
    },

    openChat: async () => {
      await expect(selectors.rootContainer).toHaveCount(0, { timeout: 500 });
      await selectors.entryPointButton.click();
      await expect(selectors.rootContainer).toBeVisible();
    },

    selectHelpline: async (helpline: string) => {
      await selectors.preEngagementForm.waitFor();
      await selectors.helplineSelect.selectOption(helpline);
      await selectors.helplineSelect.blur();
    },

    /**
     * This function runs the 'caller side' of an aselo webchat conversation.
     * It will loop through a list of chat statements, typing and sending caller statements in the webchat client
     * As soon as it hits a non-caller statement in the list (e.g. counselor-side), it will yield execution back to the calling code, so it can action those statement(s)
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
