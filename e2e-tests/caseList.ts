// eslint-disable-next-line import/no-extraneous-dependencies
import { Page, expect } from '@playwright/test';

export type Filter = 'Status' | 'Counselor' | 'Categories';

export type CaseSectionForm<T = Record<string, string>> = {
  sectionTypeId: 'note' | 'referral' | 'household' | 'perpetrator' | 'incident' | 'document';
  items: T;
};

export const caseList = (page: Page) => {
  const caseListPage = page.locator('div.Twilio-ViewCollection');

  const selectors = {
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
    caseSummaryTextarea: caseListPage.locator(
      `//textarea[@data-testid='Case-CaseSummary-TextArea']`,
    ),
    casePrintButton: caseListPage.locator(`//button[@data-testid='CasePrint-Button']`),
    casePrintCloseButton: caseListPage.locator(`//button[@data-testid='CasePrint-CloseCross']`),
    caseCloseButton: caseListPage.locator(`//button[@data-testid='CaseHome-CloseButton']`),
    updateCaseButton: caseListPage.locator(`//button[@data-testid='CaseHome-Update-Button']`),

    //Case Section view
    formInput: (itemId: string) => caseListPage.locator(`input#${itemId}`),
    formSelect: (itemId: string) => caseListPage.locator(`select#${itemId}`),
    formTextarea: (itemId: string) => caseListPage.locator(`textarea#${itemId}`),
    saveCaseItemButton: caseListPage.locator(
      `//button[@data-testid='Case-AddEditItemScreen-SaveItem']`,
    ),
  };

  /** Filter cases (excluding Date filters)
   * 
   * @param filter: Filter (status, counselor or categories)
   * @param option: string (required for all 3 filter)
   * @param option2: string (required only for Categories filter)
   */
  async function filterCases(filter: Filter, option: string, option2?: string): Promise<void> {
    const openFilterButton = selectors.filterButton(filter);
    await openFilterButton.waitFor({ state: 'visible' });
    await expect(openFilterButton).toContainText(filter);
    await openFilterButton.click();

    if (filter === 'Categories' && option2) {
    //for Categories filter, 2 valid options are required
      const selectOption = selectors.filterCategories(filter, option);
      selectOption.click();

      const selectSubCategoryOption = selectors.filterOptionCheckbox(filter, option2);
      console.log({ selectSubCategoryOption });
      await selectSubCategoryOption.click();
    } else {
      const selectOption = selectors.filterOptionCheckbox(filter, option).first();
      await expect(selectOption).toContainText(option);
      await selectOption.click();
    }

    const applyFilterButton = selectors.filterApplyButton;
    await applyFilterButton.waitFor({ state: 'visible' });
    await expect(applyFilterButton).toContainText('Apply');
    await applyFilterButton.click();
    console.log(`Filtered cases by: ${filter} filter with selection of: ${option}`);
  }

  //Open Case
  async function openFirstCaseButton() {
    const openCaseButton = selectors.openFirstCaseButton;
    await openCaseButton.waitFor({ state: 'visible' });
    // Button should have four digits ex. '1845' prepended by OpenCase
    await expect(openCaseButton).toContainText(/^OpenCase[0-9]{4}$/);
    await openCaseButton.click();
    console.log('Opened first case in the results');
  }

  //Check print view
  async function viewClosePrintView() {
    const openPrintButton = selectors.casePrintButton;
    await openPrintButton.waitFor({ state: 'visible' });
    await openPrintButton.click();
    console.log('Opened Case Print');

    const closePrintButton = selectors.casePrintCloseButton;
    await closePrintButton.waitFor({ state: 'visible' });
    await closePrintButton.click();
    console.log('Close Case Print');
  }

  // Add/Update Summary
  async function updateCaseSummary() {
    const summaryTextArea = selectors.caseSummaryTextarea;
    await summaryTextArea.waitFor({ state: 'visible' });

    const currentTime = new Date();

    await summaryTextArea.fill(`E2E Case Summary Test Edited on ${currentTime}`);
    const updateCaseButton = selectors.updateCaseButton;
    await updateCaseButton.waitFor({ state: 'visible' });
    await expect(updateCaseButton).toContainText('Update');
    await updateCaseButton.click();

    await expect(summaryTextArea).toContainText(`E2E Case Summary Test Edited on ${currentTime}`);

    console.log('Updated Case Summary');
  }

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

  //Add a section (and close)
  async function addCaseSection(section: CaseSectionForm) {
    const sectionId =
      section.sectionTypeId.charAt(0).toUpperCase() + section.sectionTypeId.slice(1);
    const newSectionButton = selectors.addSectionButton(sectionId);
    await newSectionButton.waitFor({ state: 'visible' });
    await expect(newSectionButton).toContainText(sectionId);
    await newSectionButton.click();

    await fillSectionForm(section);

    const saveItemButton = selectors.saveCaseItemButton;
    await saveItemButton.waitFor({ state: 'visible' });
    await saveItemButton.click();
  }

  //Close Case
  async function closeCase() {
    const closeCaseButton = selectors.caseCloseButton;
    await closeCaseButton.waitFor({ state: 'visible' });
    await expect(closeCaseButton).toContainText('Close');
    await closeCaseButton.click();
    console.log('Closed Case');
  }

  return {
    filterCases,
    openFirstCaseButton,
    viewClosePrintView,
    updateCaseSummary,
    addCaseSection,
    closeCase,
  };
};
