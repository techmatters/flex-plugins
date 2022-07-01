import { expect, Page, test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';

test.describe.serial('Open and Edit a Case in Case List page', () => {
  let pluginPage: Page;

  test.beforeAll(async ({ browser }) => {
    pluginPage = await browser.newPage();
    logPageTelemetry(pluginPage);
    console.log('Plugin page browser session launched');

    // Open Case List
    await pluginPage.goto('/case-list', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('Case List plugin page visited.');
  });

  test.afterAll(async () => {
    await pluginPage.close();
  });

  test('Filter for cases', async () => {
    console.log('Filter Cases');

    const filterStatusButton = pluginPage.locator(
      `//button[@data-testid='FilterBy-Status-Button']`,
    );
    await filterStatusButton.waitFor({ state: 'visible' });
    await expect(filterStatusButton).toContainText('Status');
    await filterStatusButton.click();

    /**  (create selectors function object)
     *  Filter by Status - Checkbox 'Open' and Apply
     *  Filter by Counselor - Search for 'Aselo', checkbox 'Aselo Alerts', and Apply
     */

    const filterApplyButton = pluginPage.locator(`//button[@data-testid='Filter-Apply-Button']`);
    await filterApplyButton.waitFor({ state: 'visible' });
    await expect(filterApplyButton).toContainText('Apply');
    await filterApplyButton.click();
    console.log('Status Filter Set');

    await pluginPage.waitForTimeout(3000);

    const openCaseButton = pluginPage.locator(
      `//button[@data-testid='CaseList-CaseID-1845-Button']`,
    );
    await openCaseButton.waitFor({ state: 'visible' });
    await expect(openCaseButton).toContainText('1845');
    await openCaseButton.click();
    console.log('Opened CaseID 1845');

    /**  Edit summary
     * find data-testid="CaseHome-CaseDetailsComponent"
     * data-testid="Case-CaseSummary-TextArea"
     *  -- E2E Case Summary Test--
     */

    const updateCaseButton = pluginPage.locator(`//button[@data-testid='CaseHome-Update-Button']`);
    await updateCaseButton.waitFor({ state: 'visible' });
    await expect(updateCaseButton).toContainText('Update');
    // await updateCaseButton.click();
    console.log('Update button found');

    /**  Add a section
     * Add a note "Case-Note-AddButton"
     * Type -- ADDING E2E TEST
     * "Case-AddEditItemScreen-SaveItem"
     */

    /**  Edit a section
     * Edit a note "Case-EditButton"
     * Type -- EDITING E2E TEST
     * "Case-AddEditItemScreen-SaveItem"
     */

    const casePrintButton = pluginPage.locator(`//button[@data-testid='CasePrint-Button']`);
    await casePrintButton.waitFor({ state: 'visible' });
    // await expect(casePrintButton).toHaveClass('Twilio-IconButton');
    await casePrintButton.click();
    console.log('Opened Case Print');

    const casePrintCloseButton = pluginPage.locator(
      `//button[@data-testid='CasePrint-CloseCross']`,
    );
    await casePrintCloseButton.waitFor({ state: 'visible' });
    await casePrintCloseButton.click();
    console.log('Close Case Print');

    const caseCloseButton = pluginPage.locator(`//button[@data-testid='CaseHome-CloseButton']`);
    await caseCloseButton.waitFor({ state: 'visible' });
    await expect(caseCloseButton).toContainText('Close');
    await caseCloseButton.click();
    console.log('Close Case');
    await pluginPage.waitForTimeout(3000);
  });
});
