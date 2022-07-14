import { expect, Page, test } from '@playwright/test';
import { Categories, contactForm, ContactFormTab } from '../contactForm';
import { caseHome } from '../case';
import { agentDesktop } from '../agent-desktop';
import { logPageTelemetry } from '../browser-logs';

test.describe.serial('Offline Contact (with Case)', () => {
  let pluginPage: Page;

  test.beforeAll(async ({ browser }) => {
    pluginPage = await browser.newPage();
    logPageTelemetry(pluginPage);
    console.log('Plugin page browser session launched.');
    await Promise.all([
      // Wait for this to be sure counsellors dropdown is populated
      pluginPage.waitForResponse('**/populateCounselors'),
      pluginPage.goto('/', { waitUntil: 'networkidle', timeout: 120000 }),
    ]);
    console.log('Plugin page visited.');
  });

  test.afterAll(async () => {
    await pluginPage?.close();
  });

  test('Offline Contact', async () => {
    console.log('Open a new offline contact');
    const agentDesktopPage = agentDesktop(pluginPage);
    await agentDesktopPage.addOfflineContact();

    console.log('Starting filling form');

    const form = contactForm(pluginPage);
    await form.selectChildCallType();
    await form.fill([
      <ContactFormTab>{
        id: 'contactlessTask',
        label: 'Contact',
        fill: form.fillStandardTab,
        items: {
          // Fill only the inputs that does not initializes with "current" initial values
          channel: 'web',
          helpline: 'Childline',
        },
      },
      <ContactFormTab>{
        id: 'childInformation',
        label: 'Child',
        fill: form.fillStandardTab,
        items: {
          firstName: 'E2E',
          lastName: 'OFFLINE CONTACT',
          gender: 'Unknown',
          age: 'Unknown',
          phone1: '1234512345',
          province: 'Northern',
          district: 'District A',
        },
      },
      <ContactFormTab<Categories>>{
        id: 'categories',
        label: 'Categories',
        fill: form.fillCategoriesTab,
        items: {
          Accessibility: ['Education'],
        },
      },
      <ContactFormTab>{
        id: 'caseInformation',
        label: 'Summary',
        fill: form.fillStandardTab,
        items: {
          callSummary: 'E2E OFFLINE CONTACT',
        },
      },
    ]);

    const beforeDate = new Date(); // Capture date here since we'll create case inmediately after saving contact

    console.log('Saving form');
    await form.save({ saveAndAddToCase: true });

    const casePage = caseHome(pluginPage);
    await casePage.getNewCaseId.waitFor({ state: 'visible' });
    const caseIdText = await casePage.getNewCaseId.textContent();
    const caseId = parseInt(caseIdText!.slice(caseIdText!.indexOf('#') + 1), 10);
    expect(caseId).not.toBeNaN();

    await casePage.addCaseSection({
      sectionTypeId: 'note',
      items: {
        note: 'E2E TEST NOTE',
      },
    });

    await casePage.addCaseSection({
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

    await casePage.saveCaseAndEnd();

    // Check if the case got properly saved in HRM
    const resultCase = await pluginPage.evaluate(
      async ([caseIdArg]) => {
        const manager = (window as any).Twilio.Flex.Manager.getInstance();
        const token = manager.user.token;
        const hrmBaseUrl = `${manager.serviceConfiguration.attributes.hrm_base_url}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}`;

        const url = `${hrmBaseUrl}/cases/${caseIdArg}`;
        const options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await window.fetch(url, options);
        return response.json();
      },
      [caseId],
    );

    expect(new Date(resultCase.createdAt).getTime()).toBeGreaterThan(beforeDate.getTime());
    expect(resultCase.info.counsellorNotes).toMatchObject([
      {
        note: 'E2E TEST NOTE',
      },
    ]);
    expect(resultCase.info.households).toMatchObject([
      {
        household: {
          firstName: 'FIRST NAME',
          lastName: 'LAST NAME',
          relationshipToChild: 'Unknown',
          province: 'Northern',
          district: 'District A',
          gender: 'Unknown',
          age: 'Unknown',
        },
      },
    ]);
  });
});
