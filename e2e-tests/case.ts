// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

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
