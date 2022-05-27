import { Page } from '@playwright/test';

export type Categories = Record<string, string[]>

export type ContactFormTab<T = Record<string, string>> = {
  label: string,
  id: string,
  items: T
  fill: (tab: ContactFormTab<T>)=> Promise<void>
}

export function contactForm(page: Page) {
  const formArea = page.locator('div.Twilio-CRMContainer');
  const selectors = {
    tabButton: (tab: ContactFormTab<unknown>) => formArea.locator(`button :text-is("${tab.label}")`),
    formInput: (tabId, itemId) => formArea.locator(`input#${tabId}\\.${itemId}`),
    formSelect: (tabId, itemId) => formArea.locator(`select#${tabId}\\.${itemId}`),
    formTextarea: (tabId, itemId) => formArea.locator(`textarea#${tabId}\\.${itemId}`),
    topCategorySelector: (category) => formArea.locator(`button:has-text("${category}")`),
    subCategoryCheckbox: (tabId, topCategory, subCategory) => formArea.locator(`//input[@value='${tabId}.${topCategory}.${subCategory}']`),
    saveContactButton: formArea.locator(`button.Twilio-Button:has-text("Save Contact")`),
  }

  async function selectTab(tab: ContactFormTab<unknown>) {
    const button = selectors.tabButton(tab)
    if ((await button.getAttribute('aria-selected')) !== 'true') {
      await button.click()
    }
  }

  async function fillStandardTab({id, items}: ContactFormTab) {
    for (let [itemId, value] of Object.entries(items)) {
      if (await selectors.formInput(id, itemId).count()) {
        await selectors.formInput(id, itemId).fill(value);
      } else if (await selectors.formSelect(id, itemId).count()) {
        await selectors.formSelect(id, itemId).selectOption(value);
      } else if (await selectors.formTextarea(id, itemId).count()) {
        await selectors.formTextarea(id, itemId).fill(value);
      }
      else throw new Error(`Control ${id}.${itemId} not found`);
    }
  }

  async function fillCategoriesTab({id, items}: ContactFormTab<Categories>) {
    for (const [topCategory, subCategories] of Object.entries(items)) {
      await selectors.topCategorySelector(topCategory).click();
      for(const subCategory of subCategories) {
        await selectors.subCategoryCheckbox(id, topCategory, subCategory).check()
      }
    }
  }

  return {
    fill: async (tabs: ContactFormTab<unknown>[]) => {
      for (const tab of tabs) {
        await selectTab(tab);
        await tab.fill(tab);
      }
    },
    save: async () => {
      const tab = {
        id: 'caseInformation',
        label: 'Summary',
        fill: async ()=>{},
        items: {}
      }
      await selectTab(tab);
      await selectors.saveContactButton.click();
      await selectors.tabButton(tab).waitFor({ state: 'detached'})
    },
    fillCategoriesTab, fillStandardTab
  }
}