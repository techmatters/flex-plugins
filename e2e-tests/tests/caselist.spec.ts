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

import { Page, test } from '@playwright/test';
import { caseList } from '../caseList';
import { shouldSkipDataUpdate } from '../config';
import { notificationBar } from '../notificationBar';
import { setupContextAndPage, closePage } from '../browser';

test.describe.serial('Open and Edit a Case in Case List page', () => {
  test.skip(shouldSkipDataUpdate(), 'Data update disabled. Skipping test.');

  let pluginPage: Page;
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(600000);
    ({ page: pluginPage } = await setupContextAndPage(browser));

    // Open Case List
    await pluginPage.goto('/case-list', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('Case List plugin page visited.');
  });

  test.afterAll(async () => {
    await closePage(pluginPage);
  });

  test('Filter Cases and Update a Case', async () => {
    console.log('Open Case List page');
    let page = caseList(pluginPage);

    await page.filterCases('Status', 'Open');
    await page.filterCases('Counselor', 'Aselo Alerts');

    //for Categories filter, 2 valid options are required
    await page.filterCases('Categories', 'Accessibility', 'Education');

    await page.openFirstCaseButton();

    // Open notifications cover up the print icon :facepalm
    await notificationBar(pluginPage).dismissAllNotifications();

    await page.viewClosePrintView();

    await page.addCaseSection({
      sectionTypeId: 'note',
      items: {
        note: 'TEST NOTE',
      },
    });

    await page.addCaseSection({
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

    await page.editCase();

    await page.updateCaseSummary();

    await page.verifyCaseSummaryUpdated();

    await page.closeCase();
  });
});
