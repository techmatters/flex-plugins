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
import * as aseloWebchat from '../aseloWebchat';
import { AseloWebChatPage } from '../aseloWebchat';
import { statusIndicator } from '../workerStatus';
import { ChatStatement, ChatStatementOrigin } from '../chatModel';
import { getWebchatScript } from '../chatScripts';
import { flexChat } from '../flexChat';
import { skipTestIfNotTargeted } from '../skipTest';
import { tasks } from '../tasks';
import { Categories, contactForm, ContactFormTab } from '../contactForm';
import { deleteAllTasksInQueue } from '../twilio/tasks';
import { notificationBar } from '../notificationBar';
import { clickThroughTwilioPasteModals } from '../agent-desktop';
import { setupContextAndPage, closePage } from '../browser';
import { clearOfflineTask } from '../hrm/clearOfflineTask';
import { apiHrmRequest } from '../hrm/hrmRequest';
import { formContentsByHelpline } from '../formContentsByHelpline';
import { getConfigValue } from '../config';

test.describe.serial('Aselo web chat caller', () => {
  skipTestIfNotTargeted();

  let chatPage: AseloWebChatPage, pluginPage: Page, context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180000);
    ({ context, page: pluginPage } = await setupContextAndPage(browser));

    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN!),
      process.env.LOGGED_IN_WORKER_SID!,
    );
    chatPage = await aseloWebchat.open(context);
    console.info('Aselo webchat browser session launched.');

    await clickThroughTwilioPasteModals(pluginPage);
    console.info('Plugin page visited.');
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

  test('Chat', async () => {
    test.setTimeout(180000);
    await chatPage.openChat();
    await chatPage.fillPreEngagementForm();

    const chatScript = getWebchatScript();

    const webchatProgress = chatPage.chat(chatScript);
    const flexChatProgress: AsyncIterator<ChatStatement> = flexChat(pluginPage).chat(chatScript);

    // Currently this loop handles the handing back and forth of control between the caller & counselor sides of the chat.
    // Each time round the loop it allows the webchat to process statements until it yields control back to this loop
    // And each time flexChatProgress.next(), the flex chat processes statements until it yields
    // Should be moved out to its own function in time, and a cleaner way of injecting actions to be taken partway through the chat should be implemented.
    for await (const expectedCounselorStatement of webchatProgress) {
      console.info('Statement for flex chat to process', expectedCounselorStatement);
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

    console.info('Starting filling form');
    const helpline = getConfigValue('helplineShortCode') as keyof typeof formContentsByHelpline;
    const formContent = formContentsByHelpline[helpline];
    if (!formContent) {
      throw new Error(`No form contents configured for helplineShortCode="${String(helpline)}"`);
    }
    const form = contactForm(pluginPage);
    await form.fill([
      <ContactFormTab>{
        id: 'childInformation',
        label: 'TabbedForms-AddChildInfoTab',
        fill: form.fillStandardTab,
        items: formContent.childInformation,
      },
      <ContactFormTab<Categories>>{
        id: 'categories',
        label: 'TabbedForms-CategoriesTab',
        fill: form.fillCategoriesTab,
        items: formContent.categories,
      },
      <ContactFormTab>{
        id: 'caseInformation',
        label: 'TabbedForms-AddCaseInfoTab',
        fill: form.fillStandardTab,
        items: formContent.caseInformation,
      },
    ]);

    console.info('Saving form');
    await form.save();
  });
});
