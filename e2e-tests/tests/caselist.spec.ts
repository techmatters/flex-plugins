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
import { caseList } from '../caseList';
import { skipTestIfNotTargeted, skipTestIfDataUpdateDisabled } from '../skipTest';
import { notificationBar } from '../notificationBar';
import { setupContextAndPage, closePage } from '../browser';
import { clearOfflineTask } from '../hrm/clearOfflineTask';
import { apiHrmRequest } from '../hrm/hrmRequest';

test.describe.serial('Open and Edit a Case in Case List page', () => {
  skipTestIfNotTargeted();
  skipTestIfDataUpdateDisabled();

  let pluginPage: Page;
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(600000);
    ({ page: pluginPage } = await setupContextAndPage(browser));

    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN!),
      process.env.LOGGED_IN_WORKER_SID!,
    );

    // Open Case List
    await pluginPage.goto('/case-list', { waitUntil: 'load', timeout: 20000 });
    await pluginPage.waitForSelector('div.Twilio-ViewCollection', { timeout: 20000 });
    console.log('Case List table is visible.');
  });

  test.afterAll(async () => {
    await closePage(pluginPage);
  });

  test('Filter Cases and Update a Case', async () => {
    console.log('Open Case List page');
    let page = caseList(pluginPage);

    // Wait for the case list to be fully loaded before applying filters
    await pluginPage.waitForSelector('tr[data-testid="CaseList-TableRow"]', { timeout: 30000 });
    console.log('Case list rows are visible, proceeding with filtering');

    try {
      await page.filterCases('status', 'Open');
      console.log('Successfully filtered by Open status');

      // Add a short delay to ensure the first filter is fully applied
      await pluginPage.waitForTimeout(1000);

      await page.filterCases('counselor', 'Aselo Alerts');
      console.log('Successfully filtered by counselor Aselo Alerts');
    } catch (error) {
      console.error('Error during filtering:', error);
      throw error;
    }

    const caseHomePage = await page.openFirstCaseButton();

    // Open notifications cover up the print icon :facepalm
    await notificationBar(pluginPage).dismissAllNotifications();

    await caseHomePage.viewClosePrintView();

    await caseHomePage.addCaseSection({
      sectionTypeId: 'note',
      items: {
        note: 'TEST NOTE',
      },
    });

    await caseHomePage.addCaseSection({
      sectionTypeId: 'household',
      items: {
        firstName: 'FIRST NAME',
        lastName: 'LAST NAME',
        relationshipToChild: 'Unknown',
        province: 'Northern',
        district: 'District A',
        gender: 'Unknown',
        age: 'Unknown',
      },
    });

    await caseHomePage.clickEditCase();

    await caseHomePage.updateCaseSummary();

    await caseHomePage.verifyCaseSummaryUpdated();

    await caseHomePage.verifyCasePrintButtonIsVisible();
    await caseHomePage.verifyCategoryTooltipIsVisible();

    await caseHomePage.closeModal();
    console.debug('Closed Case');
  });
});
