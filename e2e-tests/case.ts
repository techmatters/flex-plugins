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
import { Page } from '@playwright/test';
import { delay } from './okta/sso-login';

export type CaseSectionForm<T = Record<string, string>> = {
  sectionTypeId: 'note' | 'referral' | 'household' | 'perpetrator' | 'incident' | 'document';
  items: T;
};

export const caseHome = (page: Page) => {
  const caseHomeArea = page.locator('div.Twilio-CRMContainer');
  const selectors = {
    addSectionButton: (sectionTypeId: string) =>
      caseHomeArea.locator(
        `//button[@data-testid='Case-${
          sectionTypeId.charAt(0).toUpperCase() + sectionTypeId.slice(1)
        }-AddButton']`,
      ),
    formInput: (itemId: string) => caseHomeArea.locator(`input#${itemId}`),
    formSelect: (itemId: string) => caseHomeArea.locator(`select#${itemId}`),
    formTextarea: (itemId: string) => caseHomeArea.locator(`textarea#${itemId}`),
    saveCaseItemButton: caseHomeArea.locator(
      `//button[@data-testid='Case-AddEditItemScreen-SaveItem']`,
    ),
    saveCaseAndEndButton: caseHomeArea.locator(`//button[@data-testid='BottomBar-SaveCaseAndEnd']`),
    getNewCaseId: caseHomeArea.locator(`//p[@data-testid='Case-DetailsHeaderCaseId']`),
  };

  async function fillSectionForm({ items }: CaseSectionForm) {
    for (let [itemId, value] of Object.entries(items)) {
      if (await selectors.formInput(itemId).count()) {
        await selectors.formInput(itemId).fill(value);
      } else if (await selectors.formSelect(itemId).count()) {
        await selectors.formSelect(itemId).selectOption(value);
      } else if (await selectors.formTextarea(itemId).count()) {
        await selectors.formTextarea(itemId).fill(value);
      } else throw new Error(`Control ${itemId} not found`);
    }
  }

  async function addCaseSection(sectionForm: CaseSectionForm) {
    const addButton = selectors.addSectionButton(sectionForm.sectionTypeId);
    await addButton.click();

    await fillSectionForm(sectionForm);

    const saveButton = selectors.saveCaseItemButton;
    await saveButton.click();

    /**
     * Fix to addOfflineContact tests flakiness
     * TODO: investigate root cause
     */
    await delay(300);
  }

  async function saveCaseAndEnd() {
    await selectors.saveCaseAndEndButton.click();
    await page.waitForResponse('**/connectToCase');
  }

  const { getNewCaseId } = selectors;

  return {
    getNewCaseId,
    addCaseSection,
    saveCaseAndEnd,
  };
};
