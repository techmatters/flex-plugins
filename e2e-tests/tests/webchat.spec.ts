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

import { BrowserContext, Page, request, test } from '@playwright/test';
import * as webchat from '../webchat';
import { WebChatPage } from '../webchat';
import { statusIndicator } from '../workerStatus';
import { ChatStatement, ChatStatementOrigin } from '../chatModel';
import { getWebchatScript } from '../chatScripts';
import { flexChat } from '../flexChat';
import { getConfigValue } from '../config';
import { skipTestIfNotTargeted } from '../skipTest';
import { tasks } from '../tasks';
import { Categories, contactForm, ContactFormTab } from '../contactForm';
import { deleteAllTasksInQueue } from '../twilio/tasks';
import { notificationBar } from '../notificationBar';
import { navigateToAgentDesktop } from '../agent-desktop';
import { setupContextAndPage, closePage } from '../browser';
import { clearOfflineTask } from '../hrm/clearOfflineTask';
import { apiHrmRequest } from '../hrm/hrmRequest';

test.describe.serial('Web chat caller', () => {
  skipTestIfNotTargeted();

  let chatPage: WebChatPage, pluginPage: Page, context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    ({ context, page: pluginPage } = await setupContextAndPage(browser));

    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN!),
      process.env.LOGGED_IN_WORKER_SID!,
    );

    await navigateToAgentDesktop(pluginPage);
    console.log('Plugin page visited.');
    chatPage = await webchat.open(context);
    console.log('Webchat browser session launched.');
  });

  test.afterAll(async () => {
    await statusIndicator(pluginPage)?.setStatus('OFFLINE');
    if (pluginPage) {
      await notificationBar(pluginPage).dismissAllNotifications();
    }
    await closePage(pluginPage);
    await deleteAllTasksInQueue();
  });

  test.afterEach(async () => {
    await deleteAllTasksInQueue();
  });

  test('Chat ', async () => {
    test.setTimeout(180000);
    await chatPage.openChat();
    await chatPage.fillPreEngagementForm();

    const chatScript = getWebchatScript();

    const webchatProgress = chatPage.chat(chatScript);
    const flexChatProgress: AsyncIterator<ChatStatement> = flexChat(pluginPage).chat(chatScript);

    // Currently this loop handles the handing back and forth of control between the caller & counselor sides of the chat.
    // Each time round the loop it allows the webchat to process statements until it yields control back to this loop
    // And each time flexChatProgress.next(), the flex chat processes statements until it yields
    // Should be moved out to it's own function in time, and a cleaner was of injecting actions to be taken partway through the chat should be implemented.
    for await (const expectedCounselorStatement of webchatProgress) {
      console.log('Statement for flex chat to process', expectedCounselorStatement);
      if (expectedCounselorStatement) {
        switch (expectedCounselorStatement.origin) {
          case ChatStatementOrigin.COUNSELOR_AUTO:
            await statusIndicator(pluginPage).setStatus('AVAILABLE');
            await tasks(pluginPage).acceptNextTask();
            await flexChatProgress.next();
            break;
          default:
            await flexChatProgress.next();
            break;
        }
      }
    }

    if (getConfigValue('skipDataUpdate') as boolean) {
      console.log('Skipping saving form');
      return;
    }

    console.log('Starting filling form');
    const form = contactForm(pluginPage);
    await form.fill([
      <ContactFormTab>{
        id: 'childInformation',
        label: 'Child',
        fill: form.fillStandardTab,
        items: {
          firstName: 'E2E',
          lastName: 'TEST',
          phone1: '1234512345',
          province: 'Northern',
          district: 'District A',
        },
      },
      <ContactFormTab<Categories>>{
        id: 'categories',
        label: 'Categories',
        fill: form.fillCategoriesTab,
        items: {
          Accessibility: ['Education'],
        },
      },
      <ContactFormTab>{
        id: 'caseInformation',
        label: 'Summary',
        fill: form.fillStandardTab,
        items: {
          callSummary: 'E2E TEST CALL',
        },
      },
    ]);

    console.log('Saving form');
    await form.save();
  });
});
