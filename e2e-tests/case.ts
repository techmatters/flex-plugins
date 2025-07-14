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
import { expect, Page } from '@playwright/test';

export type CaseSectionForm<T = Record<string, string>> = {
  sectionTypeId: 'note' | 'referral' | 'household' | 'perpetrator' | 'incident' | 'document';
  items: T;
};

export const caseHome = (page: Page) => {
  // const caseHomeArea = page.locator('div.Twilio-CRMContainer');
  const selectors = {
    addSectionButton: (sectionTypeId: string) =>
      page.locator(`//button[@data-testid='Case-SectionList-Add/${sectionTypeId}-AddButton']`),
    formItem: (itemId: string) => page.locator(`#${itemId}`),
    formInput: (itemId: string) => page.locator(`input#${itemId}`),
    formSelect: (itemId: string) => page.locator(`select#${itemId}`),
    formTextarea: (itemId: string) => page.locator(`textarea#${itemId}`),
    saveCaseItemButton: page.locator(`//button[@data-testid='Case-AddEditItemScreen-SaveItem']`),
    saveCaseOverviewButton: page.locator('//button[@data-testid="Case-EditCaseScreen-SaveItem"]'),
    saveCaseAndEndButton: page.locator(`//button[@data-testid='BottomBar-SaveCaseAndEnd']`),
    getNewCaseId: page.locator(`//p[@data-testid='Case-DetailsHeaderCaseId']`),
    printButton: page.locator('[data-testid="CasePrint-Button"]'),
    modalCloseButton: page.locator('[data-testid="NavigableContainer-CloseCross"]'),

    caseSummaryText: page.locator(`//textarea[@data-testid='Case-summary-TextArea']`),
    caseSummaryTextArea: page.locator(`//textarea[@data-testid='summary']`),
    updateCaseButton: page.locator(`//button[@data-testid='Case-EditCaseScreen-SaveItem']`),
    caseEditButton: page.locator(`//button[@data-testid='Case-EditButton']`),
    //Case Section view
    categoryTooltip: page.locator(`//div[@data-testid='CaseDetails-CategoryTooltip']`),
  };

  async function fillSectionForm({ items }: CaseSectionForm) {
    for (let [itemId, value] of Object.entries(items)) {
      await expect(selectors.formItem(itemId)).toBeVisible();
      await expect(selectors.formItem(itemId)).toBeEnabled();
      if (await selectors.formInput(itemId).count()) {
        await selectors.formInput(itemId).fill(value);
      } else if (await selectors.formSelect(itemId).count()) {
        await selectors.formSelect(itemId).selectOption(value);
      } else if (await selectors.formTextarea(itemId).count()) {
        await selectors.formTextarea(itemId).fill(value);
      } else throw new Error(`Control ${itemId} not found`);
    }
  }

  async function addCaseSection(section: CaseSectionForm) {
    const newSectionButton = selectors.addSectionButton(section.sectionTypeId);
    await expect(newSectionButton).toBeEnabled();
    await newSectionButton.click();
    await fillSectionForm(section);

    const saveItemButton = selectors.saveCaseItemButton;
    await expect(saveItemButton).toBeVisible();
    await expect(saveItemButton).toBeEnabled();
    const responsePromise = page.waitForResponse('**/cases/**');
    await saveItemButton.click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }

  async function saveCaseAndEnd() {
    const responsesPromise = page.waitForResponse('**/contacts/**');
    await selectors.saveCaseAndEndButton.click();
    const response = await responsesPromise;
    expect(response.ok()).toBeTruthy();
  }

  const { getNewCaseId } = selectors;

  // Add utility functions moved from caseList.ts
  async function viewClosePrintView() {
    await expect(selectors.printButton).toBeVisible();
    await selectors.printButton.click();
    console.debug('Opened Case Print');
    await expect(selectors.modalCloseButton).toBeVisible();
    await selectors.modalCloseButton.click();
    console.debug('Close Case Print');
  }

  async function clickEditCase() {
    await expect(selectors.caseEditButton).toBeVisible();
    await selectors.caseEditButton.click();
  }

  async function updateCaseSummary() {
    const summaryInput = selectors.formTextarea('summary');
    await expect(summaryInput).toBeVisible();
    await summaryInput.fill('Updated summary');
    await expect(selectors.saveCaseOverviewButton).toBeVisible();
    await selectors.saveCaseOverviewButton.click();
  }

  async function verifyCaseSummaryUpdated() {
    await expect(selectors.caseSummaryText).toBeVisible();
    await expect(selectors.caseSummaryText).toContainText('Updated summary');
  }

  async function verifyCasePrintButtonIsVisible() {
    await expect(selectors.printButton).toBeVisible();
  }

  async function verifyCategoryTooltipIsVisible() {
    await expect(selectors.categoryTooltip).toBeVisible({ timeout: 10000 });
  }

  async function closeModal() {
    await expect(selectors.modalCloseButton).toBeVisible();
    await selectors.modalCloseButton.click();
  }

  return {
    getNewCaseId,
    addCaseSection,
    saveCaseAndEnd,
    viewClosePrintView,
    clickEditCase,
    updateCaseSummary,
    verifyCaseSummaryUpdated,
    verifyCasePrintButtonIsVisible,
    verifyCategoryTooltipIsVisible,
    closeModal,
  };
};
