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
import { Page } from '@playwright/test';
import { ChatStatement, ChatStatementOrigin } from './chatModel';

export function flexChat(page: Page) {
  const taskCanvas = page.locator('div.Twilio-TaskCanvas');

  const selectors = {
    //Chatting
    chatMessageArea: taskCanvas.locator('div.Twilio-MessagingCanvas'),
    chatInput: taskCanvas.locator("//textarea[@data-test='message-input']"),
    chatSendButton: taskCanvas.locator('button.Twilio-MessageInput-SendButton'),
    messageBubbles: taskCanvas.locator('div.Twilio-MessageListItem div.Twilio-MessageBubble'),
    messageWithText: (text: string) =>
      taskCanvas.locator(
        `div.Twilio-MessageListItem div.Twilio-MessageBubble-Body :text-is("${text}")`,
      ),
  };

  return {
    /**
     * This function runs the 'counselor side' of a webchat conversation.
     * It will loop through a list of chat statements, typing and sending counselor statements in flex
     * As soon as it hits a caller statement in the list, it will yield execution back to the calling code, so it can action the caller statement(s)
     *
     * A similar function exists in webchat.ts to handle actioning the caller side of the conversation.
     * This means that they can both be looping through the same conversation, yielding control when they hit a statement the other chat function needs to handle
     * @param statements - a unified list of all the chat statements in a conversation, for caller and counselor
     */
    chat: async function* (statements: ChatStatement[]): AsyncIterator<ChatStatement> {
      await selectors.chatInput.waitFor();

      for (const statementItem of statements) {
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
            try {
              await selectors.messageWithText(text).waitFor({ timeout: 2000, state: 'attached' });
            } catch (err) {
              console.log(
                `Caller statement '${text}' not found after 2 seconds. Assuming action is required to send it so the flex chat processor is yielding control.`,
              );
              yield statementItem;
            }
            await selectors.messageWithText(text).waitFor({ timeout: 60000 });
            break;
        }
      }
    },
  };
}
