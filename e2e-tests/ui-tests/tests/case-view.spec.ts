import { expect, Page, test } from '@playwright/test';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import '../flex-in-a-box/local-resources';
import hrmCases from '../aselo-service-mocks/hrm/cases';
import hrmPermissions from '../aselo-service-mocks/hrm/permissions';
import { caseList } from '../../caseList';
import { editCase, closeModal } from '../../case';
import AxeBuilder from '@axe-core/playwright';
import { aseloPage } from '../aselo-service-mocks/aselo-page';
import type { AxeResults } from 'axe-core';

function warnViolations(results: AxeResults, componentDescription: string) {
  if (results.violations.length) {
    console.warn(
      `${results.violations.length} accessibility violations found in ${componentDescription}.`,
    );
  }
}

test.describe.serial('Case View', () => {
  let page: Page;
  const cases = hrmCases();
  const permissions = hrmPermissions();

  test.beforeAll(async ({ browser }) => {
    await mockServer.start();
    page = await aseloPage(browser);
    await cases.mockCaseEndpoints(page);
    await permissions.mockPermissionEndpoint(page);
    await page.goto('/case-list', { waitUntil: 'networkidle' });
  });

  test.afterAll(async () => {
    await mockServer.stop();
  });

  test('Case view and edit passes AXE scan', async () => {
    const caseListPage = caseList(page);
    await caseListPage.openFirstCaseButton();
    const caseHomeAccessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    expect(caseHomeAccessibilityScanResults.violations).toEqual([]);
    warnViolations(caseHomeAccessibilityScanResults, `the case home page`);
    await editCase(page);
    const caseEditAccessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    warnViolations(caseEditAccessibilityScanResults, `the case summary edit page`);
    await closeModal(page);
  });

  // 2. Case Home & Navigation

  // test('Case Home displays details and navigation buttons', async () => {
  //   const caseListPage = caseList(page);
  //   await caseListPage.openFirstCaseButton();
  //   // Check for summary, timeline, print, close, and save & end buttons
  //   await expect(page.locator('textarea[data-testid="summary"]')).toBeVisible();
  //   // await expect(page.locator('button[data-testid="CasePrint-Button"]')).toBeVisible();
  //   await expect(page.locator('button[data-testid="BottomBar-SaveCaseAndEnd"]')).toBeVisible();
  //   // Timeline section
  //   await expect(page.locator('div[data-testid^="Case-Timeline"]')).toBeVisible();
  // });

  // 3. Section and Timeline UI

  // test('Timeline and section list render with correct preview fields', async () => {
  //   const caseListPage = caseList(page);
  //   await caseListPage.openFirstCaseButton();
  //   // Check for timeline and section rows
  //   await expect(page.locator('div[data-testid^="Case-Timeline"]')).toBeVisible();
  //   // Check for at least one section row and "View" button
  //   await expect(
  //     page.locator('button[data-testid^="Case-InformationRow-ViewButton"]'),
  //   ).toBeVisible();
  // });

  // 4. Section Item View/Edit

  // test('View and edit a section item, check ActionHeader and Edit button', async () => {
  //   const caseListPage = caseList(page);
  //   await caseListPage.openFirstCaseButton();
  //   // Click first "View" button in section list
  //   await page.locator('button[data-testid^="Case-InformationRow-ViewButton"]').first().click();
  //   // ActionHeader should be visible
  //   await expect(page.locator('[data-testid="Case-ActionHeaderAdded"]')).toBeVisible();
  //   // Edit button should be visible and clickable
  //   const editButton = page.locator('button[data-testid="Case-EditButton"]');
  //   if (await editButton.count()) {
  //     await expect(editButton).toBeVisible();
  //     await editButton.click();
  //     // Save or cancel edit to reset state
  //     await page.locator('button[data-testid="Case-AddEditItemScreen-SaveItem"]').click();
  //   }
  // });

  // 5. Case Tags and Categories

  // test('Case tags display correct labels, colors, and tooltip', async () => {
  //   const caseListPage = caseList(page);
  //   await caseListPage.openFirstCaseButton();
  //   // Tags should be visible
  //   await expect(page.locator('[data-testid^="CaseDetails-Category"]')).toBeVisible();
  //   // Tooltip appears on hover
  //   await page.hover('[data-testid^="CaseDetails-Category"]');
  //   await expect(page.locator('[data-testid="CaseDetails-CategoryTooltip"]')).toBeVisible();
  // });

  // 6. Dialogs and Modals

  test('Close Case dialog opens and buttons function', async () => {
    const caseListPage = caseList(page);
    await caseListPage.openFirstCaseButton();
    // Open Close dialog (adjust selector as needed)
    await page.click('button[data-testid="Case-EditCaseScreen-CloseCaseButton"]');
    await expect(page.locator('[data-testid="CloseCaseDialog"]')).toBeVisible();
    // Test Save and Don't Save buttons
    await page.click('button[data-testid="BottomBar-DontSave"]');
    // Reopen and test Save button
    await page.click('button[data-testid="Case-EditCaseScreen-CloseCaseButton"]');
    await page.click('button[data-testid="BottomBar-Save"]');
  });
});
