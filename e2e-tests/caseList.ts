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
  | 'Status'
  | 'Counselor'
  | 'Categories'
  | 'createdAtFilter'
  | 'updatedAtFilter'
  | 'followUpDateFilter';

export type CaseSectionForm<T = Record<string, string>> = {
  sectionTypeId: 'note' | 'referral' | 'household' | 'perpetrator' | 'incident' | 'document';
  items: T;
};

export const caseList = (page: Page) => {
  const caseListPage = page.locator('div.Twilio-ViewCollection');

  const selectors = {
    caseListRowIdButton: caseListPage.locator(
      `tr[data-testid='CaseList-TableRow'] button[data-testid='CaseList-CaseID-Button']`,
    ),
    // Case List view
    filterButton: (filter: Filter) =>
      caseListPage.locator(`//button[@data-testid='FilterBy-${filter}-Button']`),
    filterOptionCheckbox: (filter: Filter, option: string) =>
      caseListPage.locator(`//li[@data-testid='${filter}-${option}']`),
    filterCategories: (filter: Filter, option: string) =>
      caseListPage.locator(`//div[@data-testid='${filter}-${option}']`),
    filterApplyButton: caseListPage.locator(`//button[@data-testid='Filter-Apply-Button']`),

    openFirstCaseButton: caseListPage
      .locator(`//button[@data-testid='CaseList-CaseID-Button']`)
      .first(),

    //Case Home view
    addSectionButton: (sectionTypeId: string) =>
      caseListPage.locator(`//button[@data-testid='Case-${sectionTypeId}-AddButton']`),
    caseSummaryText: caseListPage.locator(`//textarea[@data-testid='Case-CaseSummary-TextArea']`),
    caseSummaryTextArea: caseListPage.locator(`//textarea[@data-testid='summary']`),
    casePrintButton: caseListPage.locator(`//button[@data-testid='CasePrint-Button']`),
    modalCloseButton: caseListPage.locator(
      `//button[@data-testid='NavigableContainer-CloseCross']`,
    ),
    updateCaseButton: caseListPage.locator(`//button[@data-testid='Case-EditCaseScreen-SaveItem']`),
    caseEditButton: caseListPage.locator(`//button[@data-testid='Case-EditButton']`),

    //Case Section view
    saveCaseItemButton: caseListPage.locator(
      `//button[@data-testid='Case-AddEditItemScreen-SaveItem']`,
    ),
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
   * @param filter: Filter (status, counselor or categories)
   * @param option: string (required for all 3 filter)
   * @param option2: string (required only for Categories filter)
   */
  async function filterCases(filter: Filter, option: string, option2?: string): Promise<void> {
    await openFilter(filter);

    if (filter === 'Categories' && option2) {
      //for Categories filter, 2 valid options are required
      const selectOption = selectors.filterCategories(filter, option);
      await selectOption.click();

      const selectSubCategoryOption = selectors.filterOptionCheckbox(filter, option2);
      console.log({ selectSubCategoryOption });
      await selectSubCategoryOption.click();
    } else {
      const selectOption = selectors.filterOptionCheckbox(filter, option).first();
      await selectOption.click();
    }

    const applyFilterButton = selectors.filterApplyButton;
    await applyFilterButton.waitFor({ state: 'visible' });
    await applyFilterButton.click();
    console.log(`Filtered cases by: ${filter} filter with selection of: ${option}`);
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

  //Check print view
  // TODO: Move to case.ts
  async function viewClosePrintView() {
    const openPrintButton = selectors.casePrintButton;
    await openPrintButton.waitFor({ state: 'visible' });
    await openPrintButton.click();
    console.log('Opened Case Print');

    const closePrintButton = selectors.modalCloseButton;
    await closePrintButton.waitFor({ state: 'visible' });
    await closePrintButton.click();
    console.log('Close Case Print');
  }

  //Edit Case
  // TODO: Move to case.ts
  async function editCase() {
    const editCaseButton = selectors.caseEditButton;
    await editCaseButton.waitFor({ state: 'visible' });
    await expect(editCaseButton).toContainText('Edit');
    await editCaseButton.click();
    console.log('Edit Case');
  }

  const currentTime = new Date();

  // Add/Update Summary
  // TODO: Move to case.ts
  async function updateCaseSummary() {
    const summaryTextArea = selectors.caseSummaryTextArea;
    await summaryTextArea.waitFor({ state: 'visible' });
    await summaryTextArea.fill(`E2E Case Summary Test Edited on ${currentTime}`);

    const updateCaseButton = selectors.updateCaseButton;
    await updateCaseButton.waitFor({ state: 'visible' });
    await expect(updateCaseButton).toContainText('Save');
    const responsePromise = page.waitForResponse('**/cases/**');
    await updateCaseButton.click();
    await responsePromise;

    console.log('Updated Case Summary');
  }

  // Verify case summary update
  async function verifyCaseSummaryUpdated() {
    const summaryText = selectors.caseSummaryText;
    await summaryText.waitFor({ state: 'visible' });
    await expect(summaryText).toContainText(`E2E Case Summary Test Edited on ${currentTime}`);
  }

  async function verifyCaseIdsAreInListInOrder(ids: string[]) {
    await selectors.caseListRowIdButton.first().waitFor({ state: 'visible' });
    const caseListIdButtons = await selectors.caseListRowIdButton.all();
    expect(caseListIdButtons.length).toBe(ids.length);
    await Promise.all(caseListIdButtons.map((l, idx) => expect(l).toContainText(ids[idx])));
  }

  //Close Modal (probably can move this to more generic navigation file now we have more standardised navigation)
  async function closeModal() {
    const closeCaseButton = selectors.modalCloseButton;
    await closeCaseButton.waitFor({ state: 'visible' });
    await closeCaseButton.click();
  }

  return {
    openFilter,
    closeFilter,
    filterCases,
    openFirstCaseButton,
    viewClosePrintView,
    editCase,
    updateCaseSummary,
    verifyCaseSummaryUpdated,
    closeModal,
    verifyCaseIdsAreInListInOrder,
  };
};
