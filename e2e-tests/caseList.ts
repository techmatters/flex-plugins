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
import { Page, expect } from '@playwright/test';
import { caseHome } from './case';

export type Filter =
  | 'status'
  | 'counselor'
  | 'createdAtFilter'
  | 'updatedAtFilter'
  | 'followUpDateFilter';

export type CaseSectionForm<T = Record<string, string>> = {
  sectionTypeId: 'note' | 'referral' | 'household' | 'perpetrator' | 'incident' | 'document';
  items: T;
};

export const caseList = (page: Page) => {
  const caseListPage = page.locator('div.Twilio-ViewCollection');
  console.debug('Case List table is visible.');

  const selectors = {
    caseListRowIdButton: caseListPage.locator(
      `tr[data-testid='CaseList-TableRow'] button[data-testid='CaseList-CaseID-Button']`,
    ),
    // Case List view
    filterButton: (filter: Filter) =>
      caseListPage.locator(`//button[@data-testid='FilterBy-${filter}-Button']`),
    filterOptionCheckbox: (filter: Filter, option: string) =>
      caseListPage.locator(`//li[@data-testid='${filter}-${option}']`),
    filterApplyButton: caseListPage.locator(`//button[@data-testid='Filter-Apply-Button']`),

    openFirstCaseButton: caseListPage
      .locator(`//button[@data-testid='CaseList-CaseID-Button']`)
      .first(),
  };

  async function openFilter(filter: Filter): Promise<void> {
    const openFilterButton = selectors.filterButton(filter);
    const exists = (await openFilterButton.count()) > 0;
    if (!exists) {
      throw new Error(`Filter button for ${filter} not found in DOM`);
    }
    await openFilterButton.waitFor({ state: 'visible' });
    await openFilterButton.click();
  }

  const closeFilter = openFilter;

  /** Filter cases (excluding Date filters)
   *
   */
  async function filterCases(filter: Filter, option: string): Promise<void> {
    await openFilter(filter);

    const selectOption = selectors.filterOptionCheckbox(filter, option).first();
    await selectOption.click();

    const applyFilterButton = selectors.filterApplyButton;
    await applyFilterButton.waitFor({ state: 'visible' });
    await applyFilterButton.click();
    console.log(`Filtered cases by: ${filter} filter with selection of: ${option}`);
  }

  async function verifyCaseIdsAreInListInOrder(expectedIds: string[]) {
    const rows = await page.locator('tr[data-testid^="CaseList-TableRow"]').all();

    const ids = await Promise.all(
      rows.map(async (row) => {
        const button = row.locator('[data-testid="CaseList-CaseID-Button"]');
        const buttonText = (await button.textContent())?.trim() || '';
        return buttonText.replace(/OpenCase/, '').trim(); //extract case id
      }),
    );

    expect(ids).toEqual(expectedIds);
  }

  //Open Case
  async function openFirstCaseButton() {
    const openCaseButton = selectors.openFirstCaseButton;
    await openCaseButton.waitFor({ state: 'visible' });
    // Button should have four digits ex. '1845' prepended by OpenCase
    await expect(openCaseButton).toContainText(/^OpenCase[0-9]+$/);
    await openCaseButton.click();
    console.log('Opened first case in the results');
    return caseHome(page);
  }

  return {
    openFilter,
    closeFilter,
    filterCases,
    verifyCaseIdsAreInListInOrder,
    openFirstCaseButton,
  };
};

export const navigateToCaseListUsingButton = async (page: Page) => {
  const sideLinkLocator = page.locator(`//button[@data-testid='case-list-side-link']`);
  await sideLinkLocator.click();
  await page.waitForSelector('div[data-testid="CaseList-Filters-Panel"]', {
    timeout: 20000,
  });
};
