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

import { Page, request, test } from '@playwright/test';
import { statusIndicator } from '../workerStatus';
import { ChatStatement, ChatStatementOrigin } from '../chatModel';
import { getSmsScript } from '../chatScripts';
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
import { smsChat } from '../twilio/sms';
import { deleteSmsConversations } from '../twilio/channels';

test.describe.serial('SMS caller', () => {
  skipTestIfNotTargeted();

  let pluginPage: Page;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180000);
    await deleteSmsConversations();
    ({ page: pluginPage } = await setupContextAndPage(browser));

    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN!),
      process.env.LOGGED_IN_WORKER_SID!,
    );
    console.info('SMS E2E test - plugin page launched.');

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

    const chatScript = getSmsScript();

    // smsChat handles the client (caller) side via the Twilio Messages API.
    // flexChat handles the counselor side via the Flex browser UI.
    // Both iterate the same shared script, yielding control when they hit a
    // statement the other side needs to handle — the same pattern used by the
    // Aselo webchat test.
    const smsChatProgress = smsChat(chatScript);
    const flexChatProgress: AsyncIterator<ChatStatement> = flexChat(pluginPage).chat(chatScript);

    for await (const expectedCounselorStatement of smsChatProgress) {
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
    await form.fillWithContent(formContent);

    console.info('Saving form');
    await form.save();
  });
});
