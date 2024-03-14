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

export type Categories = Record<string, string[]>;

export type ContactFormTab<T = Record<string, string>> = {
  label: string;
  id: string;
  items: T;
  fill: (tab: ContactFormTab<T>) => Promise<void>;
};

export function contactForm(page: Page) {
  const formArea = page.locator('div.Twilio-CRMContainer');
  const selectors = {
    childCallTypeButton: () => page.locator(`//button[@data-testid='DataCallTypeButton-child']`),
    tabButton: (tab: ContactFormTab<unknown>) =>
      formArea.locator(`button :text-is("${tab.label}")`),
    formInput: (tabId: string, itemId: string) => formArea.locator(`input#${tabId}\\.${itemId}`),
    formSelect: (tabId: string, itemId: string) => formArea.locator(`select#${tabId}\\.${itemId}`),
    formTextarea: (tabId: string, itemId: string) =>
      formArea.locator(`textarea#${tabId}\\.${itemId}`),
    topCategorySelector: (category: string) =>
      formArea.locator(`//button[@data-testid='IssueCategorization-Section-${category}']`),
    subCategoryCheckbox: (tabId: string, topCategory: string, subCategory: string) =>
      formArea.locator(`//input[@data-testid='${tabId}.${topCategory}.${subCategory}']`),
    saveContactButton: formArea.locator(`//button[@data-testid='BottomBar-SaveContact-Button']`),
    saveAndAddToCaseButton: formArea.locator(
      `//button[@data-testid='BottomBar-SaveAndAddToCase-Button']`,
    ),
    addNewCaseButton: formArea.locator(`//button[@data-testid='TabbedForms-AddNewCase-Button']`),
  };

  async function selectTab(tab: ContactFormTab<unknown>) {
    const button = selectors.tabButton(tab);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    const responsePromise = page.waitForResponse('**/contacts/**');
    if ((await button.getAttribute('aria-selected')) !== 'true') {
      await button.click();
    }
    await responsePromise;
  }

  async function fillStandardTab({ id, items }: ContactFormTab) {
    for (let [itemId, value] of Object.entries(items)) {
      if (await selectors.formInput(id, itemId).count()) {
        await selectors.formInput(id, itemId).fill(value);
      } else if (await selectors.formSelect(id, itemId).count()) {
        await selectors.formSelect(id, itemId).selectOption(value);
      } else if (await selectors.formTextarea(id, itemId).count()) {
        await selectors.formTextarea(id, itemId).fill(value);
      } else throw new Error(`Control ${id}.${itemId} not found`);
    }
  }

  async function fillCategoriesTab({ id, items }: ContactFormTab<Categories>) {
    for (const [topCategory, subCategories] of Object.entries(items)) {
      await selectors.topCategorySelector(topCategory).click();
      for (const subCategory of subCategories) {
        await selectors.subCategoryCheckbox(id, topCategory, subCategory).check({ timeout: 5000 });
      }
    }
  }

  return {
    selectChildCallType: async () => {
      const childCallTypeButton = selectors.childCallTypeButton();
      const responsePromise = page.waitForResponse('**/contacts/**');
      await childCallTypeButton.click();
      await responsePromise;
    },
    fill: async (tabs: ContactFormTab<any>[]) => {
      for (const tab of tabs) {
        await selectTab(tab);
        await tab.fill(tab);
      }
    },
    save: async ({ saveAndAddToCase }: { saveAndAddToCase?: boolean } = {}) => {
      const tab = {
        id: 'caseInformation',
        label: 'Summary',
        fill: async () => {},
        items: {},
      };
      await selectTab(tab);

      if (saveAndAddToCase) {
        const responsePromise = page.waitForResponse('**/connectToCase');
        await selectors.saveAndAddToCaseButton.click();
        await selectors.addNewCaseButton.click();
        await responsePromise;
      } else {
        const responsePromise = page.waitForResponse('**/contacts/**');
        await selectors.saveContactButton.click();
        await responsePromise;
      }

      await selectors.tabButton(tab).waitFor({ state: 'hidden' });
    },
    fillCategoriesTab,
    fillStandardTab,
  };
}
