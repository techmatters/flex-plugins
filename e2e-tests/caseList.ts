// eslint-disable-next-line import/no-extraneous-dependencies
import { Page, expect } from '@playwright/test';

export type Filter = 'Status' | 'Counselor' | 'Categories' | 'Opened' | 'Updated' | 'Follow Up';

export type CaseSectionForm<T = Record<string, string>> = {
  sectionTypeId: 'note' | 'referral' | 'household' | 'perpetrator' | 'incident' | 'document';
  items: T;
};

export const caseList = (page: Page) => {
  const caseListPage = page.locator('/case-list');

  const selectors = {
    // Case List view
    filterButton: (filter: Filter) =>
      caseListPage.locator(`//button[@data-testid='FilterBy-${filter}-Button']`),
    filterOptionCheckbox: (filter: Filter, option: string) =>
      caseListPage.locator(`//li[@data-testid='${filter}${option}']`),
    filterApplyButton: caseListPage.locator(`//button[@data-testid='Filter-Apply-Button']`),
    openFirstCaseButton: caseListPage
      .locator(`//button[@data-testid='CaseList-CaseID-Button']`)
      .first(),
    //Case Home view
    addSectionButton: (sectionTypeId: string) =>
      caseListPage.locator(
        `//button[@data-testid='Case-${
          sectionTypeId.charAt(0).toUpperCase() + sectionTypeId.slice(1)
        }-AddButton']`,
      ),
    caseSummaryTextarea: () =>
      caseListPage.locator(`//textarea[@data-testid='Case-CaseSummary-TextArea']`),
    casePrintButton: caseListPage.locator(`//button[@data-testid='CasePrint-Button']`),
    casePrintCloseButton: caseListPage.locator(`//button[@data-testid='CasePrint-CloseCross']`),
    caseCloseButton: caseListPage.locator(`//button[@data-testid='CaseHome-CloseButton']`),
    updateCaseButton: caseListPage.locator(`//button[@data-testid='CaseHome-Update-Button']`),
    //Case Section view
    saveCaseItemButton: caseListPage.locator(
      `//button[@data-testid='Case-AddEditItemScreen-SaveItem']`,
    ),
  };

  //Filter
  async function filterCases(filter: Filter, option: string) {
    const openFilterButton = selectors.filterButton(filter);
    await openFilterButton.waitFor({ state: 'visible' });
    await expect(openFilterButton).toContainText(filter);
    await openFilterButton.click();

    const selectOption = selectors.filterOptionCheckbox(filter, option);
    await expect(selectOption).toContainText(option);
    await selectOption.click();

    const applyFilterButton = selectors.filterApplyButton;
    await applyFilterButton.click();
  }
  //Open Case

  //Check print view

  //Add a section

  //Edit a section

  //Close Case

};
