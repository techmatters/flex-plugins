import { Page, test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';
import { caseList } from '../caseList';
import { notificationBar } from '../notificationBar';

test.describe.serial('Open and Edit a Case in Case List page', () => {
  let pluginPage: Page;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(600000);
    pluginPage = await browser.newPage();
    logPageTelemetry(pluginPage);
    console.log('Plugin page browser session launched');

    // Open Case List
    await pluginPage.goto('/case-list', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('Case List plugin page visited.');
  });

  test.afterAll(async () => {
    await pluginPage?.close();
  });

  test('Filter Cases and Update a Case', async () => {
    console.log('Open Case List page');
    let page = caseList(pluginPage);

    await page.filterCases('Status', 'Open');
    await page.filterCases('Counselor', 'Aselo Alerts');

    //for Categories filter, 2 valid options are required
    await page.filterCases('Categories', 'Accessibility', 'Education');

    await page.openFirstCaseButton();

    // Open notifications cover up the print icon :facepalm
    await notificationBar(pluginPage).dismissAllNotifications();

    await page.viewClosePrintView();

    await page.addCaseSection({
      sectionTypeId: 'note',
      items: {
        note: 'TEST NOTE',
      },
    });

    await page.addCaseSection({
      sectionTypeId: 'household',
      items: {
        firstName: 'FIRST NAME',
        lastName: 'LAST NAME',
        relationshipToChild: 'Unknown',
        province: 'Northern',
        district: 'District A',
        gender: 'Unknown',
        age: 'Unknown',
      },
    });

    await page.editCase();

    await page.updateCaseSummary();

    await page.verifyCaseSummaryUpdated();

    await page.closeCase();
  });
});
