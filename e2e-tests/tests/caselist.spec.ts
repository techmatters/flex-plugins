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

  test('Filter Cases and Update a Case', async () => {
    const filterStatus = pluginPage.locator(`//button[@data-testid='FilterBy-Status-Button']`);
    await filterStatus.waitFor({ state: 'visible' });
    await expect(filterStatus).toContainText('Status');
    await filterStatus.click();

    const selectOpenStatus = pluginPage.locator(`//li[@data-testid='statusOpen']`);
    await expect(selectOpenStatus).toContainText('Open');
    await selectOpenStatus.click();

    const filterStatusApplyButton = pluginPage.locator(
      `//button[@data-testid='Filter-Apply-Button']`,
    );
    await filterStatusApplyButton.waitFor({ state: 'visible' });
    await expect(filterStatusApplyButton).toContainText('Apply');
    await filterStatusApplyButton.click();
    console.log('Filtered Status for Open cases');

    const filterCounselor = pluginPage.locator(
      `//button[@data-testid='FilterBy-Counselor-Button']`,
    );
    await filterCounselor.waitFor({ state: 'visible' });
    await expect(filterCounselor).toContainText('Counselor');
    await filterCounselor.click();

    const selectCounselor = pluginPage.locator(`//li[@data-testid='counselorAseloAlerts']`);
    await expect(selectCounselor).toContainText('Aselo Alerts');
    await selectCounselor.click();

    const filterApplyButton = pluginPage.locator(`//button[@data-testid='Filter-Apply-Button']`);
    await filterApplyButton.waitFor({ state: 'visible' });
    await expect(filterApplyButton).toContainText('Apply');
    await filterApplyButton.click();
    console.log('Filtered cases by "Aselo Alerts" - Counselor filter');

    const openCaseButton = pluginPage
      .locator(`//button[@data-testid='CaseList-CaseID-Button']`)
      .first();
    await openCaseButton.waitFor({ state: 'visible' });
    // Button should have four digits ex. '1845' prepended by OpenCase
    await expect(openCaseButton).toContainText(/^OpenCase[0-9]{4}$/);
    await openCaseButton.click();

    console.log('Opened the first case in the results');

    const caseSummaryArea = pluginPage.locator(
      `//textarea[@data-testid='Case-CaseSummary-TextArea']`,
    );
    await caseSummaryArea.waitFor({ state: 'visible' });
    await caseSummaryArea.fill(`E2E Case Summary Test Edited on ${new Date().getDate} ${new Date().getHours}`);

    const updateCaseButton = pluginPage.locator(`//button[@data-testid='CaseHome-Update-Button']`);
    await updateCaseButton.waitFor({ state: 'visible' });
    await expect(updateCaseButton).toContainText('Update');
    await updateCaseButton.click();
    const editedSummaryArea = pluginPage.locator(
      `//textarea[@data-testid='Case-CaseSummary-TextArea']`,
    );
    await expect(editedSummaryArea).toContainText(`E2E Case Summary Test Edited on ${new Date().getDate} ${new Date().getHours}`);
    console.log('Updated Case Summary');

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

    const addNoteButton = pluginPage.locator(`//button[@data-testid='Case-Note-AddButton']`);
    await addNoteButton.waitFor({ state: 'visible' });
    await expect(addNoteButton).toContainText('Note');
    await addNoteButton.click();

    const addNoteSection = pluginPage.locator(`//textarea[@data-testid='note']`);
    await addNoteSection.waitFor({ state: 'visible' });
    await addNoteSection.fill(`E2E Note Added on ${new Date()}`);

    const saveItemButton = pluginPage.locator(
      `//button[@data-testid='Case-AddEditItemScreen-SaveItem']`,
    );
    await saveItemButton.waitFor({ state: 'visible' });
    await expect(saveItemButton).toContainText('Save Note');
    await saveItemButton.click();

    const closeNoteButton = pluginPage.locator(`//button[@data-testid='Case-CloseButton']`);
    await closeNoteButton.waitFor({ state: 'visible' });
    await expect(closeNoteButton).toContainText('Cancel');
    await closeNoteButton.click();
    console.log('Case Note Added');

    const caseCloseButton = pluginPage.locator(`//button[@data-testid='CaseHome-CloseButton']`);
    await caseCloseButton.waitFor({ state: 'visible' });
    // await expect(caseCloseButton).toContainText('Close');
    await caseCloseButton.click();
    console.log('Close Case');
  });
});
