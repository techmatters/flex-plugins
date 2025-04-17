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
    saveCaseAndEndButton: page.locator(`//button[@data-testid='BottomBar-SaveCaseAndEnd']`),
    getNewCaseId: page.locator(`//p[@data-testid='Case-DetailsHeaderCaseId']`),
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
    await newSectionButton.waitFor({ state: 'visible' });
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

  return {
    getNewCaseId,
    addCaseSection,
    saveCaseAndEnd,
  };
};

// Add utility functions moved from caseList.ts
export async function viewClosePrintView(page: Page) {
  const openPrintButton = page.locator('[data-testid="CasePrint-Button"]');
  await openPrintButton.waitFor({ state: 'visible' });
  await openPrintButton.click();
  console.log('Opened Case Print');
  const closePrintButton = page.locator('[data-testid="NavigableContainer-CloseCross"]');
  await closePrintButton.waitFor({ state: 'visible' });
  await closePrintButton.click();
  console.log('Close Case Print');
}

export async function editCase(page: Page) {
  const editButton = page.locator('[data-testid="Case-EditButton"]');
  await editButton.waitFor({ state: 'visible' });
  await editButton.click();
}

export async function updateCaseSummary(page: Page) {
  const summaryInput = page.locator('[data-testid="CaseSummary-Input"]');
  await summaryInput.waitFor({ state: 'visible' });
  await summaryInput.fill('Updated summary');
  const saveButton = page.locator('[data-testid="CaseSummary-SaveButton"]');
  await saveButton.waitFor({ state: 'visible' });
  await saveButton.click();
}

export async function verifyCaseSummaryUpdated(page: Page) {
  const summaryContent = page.locator('[data-testid="CaseSummary-Content"]');
  await summaryContent.waitFor({ state: 'visible' });
  expect(await summaryContent.textContent()).toContain('Updated summary');
}

export async function verifyCasePrintButtonIsVisible(page: Page) {
  const printButton = page.locator('[data-testid="CasePrint-Button"]');
  await printButton.waitFor({ state: 'visible' });
  expect(await printButton.isVisible()).toBe(true);
}

export async function verifyCategoryTooltipIsVisible(page: Page) {
  const tooltip = page.locator('[data-testid="Category-Tooltip"]');
  await tooltip.waitFor({ state: 'visible' });
  expect(await tooltip.isVisible()).toBe(true);
}

export async function closeModal(page: Page) {
  const closeCaseButton = page.locator('[data-testid="NavigableContainer-CloseCross"]');
  await closeCaseButton.waitFor({ state: 'visible' });
  await closeCaseButton.click();
}
