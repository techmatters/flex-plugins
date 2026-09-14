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
import { skipTestIfNotTargeted } from '../skipTest';
import { contactForm } from '../contactForm';
import { deleteAllTasksInQueue } from '../twilio/tasks';
import { notificationBar } from '../notificationBar';
import { clickThroughTwilioPasteModals } from '../agent-desktop';
import { setupContextAndPage, closePage } from '../browser';
import { clearOfflineTask } from '../hrm/clearOfflineTask';
import { apiHrmRequest } from '../hrm/hrmRequest';
import {
  formContentsByHelpline,
  formContentsByHelplineForEmptyForm,
} from '../formContentsByHelpline';
import { getConfigValue } from '../config';
import { makeCallToService } from '../twilio/voice';
import { tasks } from '../tasks';

test.describe.serial('Voice caller', () => {
  skipTestIfNotTargeted();

  let pluginPage: Page;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180000);
    ({ page: pluginPage } = await setupContextAndPage(browser));

    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN!),
      process.env.LOGGED_IN_WORKER_SID!,
    );
    console.info('Voice E2E test - plugin page launched.');

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

  test('Call', async () => {
    test.setTimeout(180000);
    await makeCallToService();
    await statusIndicator(pluginPage).setStatus('AVAILABLE');
    await tasks(pluginPage).acceptNextTask();

    console.info('Starting filling form');
    const helpline = getConfigValue('helplineShortCode') as keyof typeof formContentsByHelpline;
    const formContent = formContentsByHelplineForEmptyForm[helpline];
    if (!formContent) {
      throw new Error(`No form contents configured for helplineShortCode="${String(helpline)}"`);
    }
    const form = contactForm(pluginPage);

    await form.selectChildCallType();
    await form.fillWithContent(formContent);

    console.info('Saving form');
    await form.save();
  });
});
