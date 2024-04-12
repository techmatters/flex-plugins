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

import { expect, Page, request, test } from '@playwright/test';
import { Categories, contactForm, ContactFormTab } from '../contactForm';
import { caseHome } from '../case';
import { agentDesktop, navigateToAgentDesktop } from '../agent-desktop';
import { skipTestIfDataUpdateDisabled, skipTestIfNotTargeted } from '../skipTest';
import { notificationBar } from '../notificationBar';
import { closePage, setupContextAndPage } from '../browser';
import { apiHrmRequest } from '../hrm/hrmRequest';
import { clearOfflineTask } from '../hrm/clearOfflineTask';

test.describe.serial('Offline Contact (with Case)', () => {
  skipTestIfNotTargeted();
  skipTestIfDataUpdateDisabled();

  let pluginPage: Page;

  test.beforeAll(async ({ browser }) => {
    ({ page: pluginPage } = await setupContextAndPage(browser));

    await clearOfflineTask(
      apiHrmRequest(await request.newContext(), process.env.FLEX_TOKEN!),
      process.env.LOGGED_IN_WORKER_SID!,
    );
    await Promise.all([
      // Wait for this to be sure counsellors dropdown is populated
      pluginPage.waitForResponse('**/populateCounselors'),
      navigateToAgentDesktop(pluginPage),
    ]);
    console.log('Plugin page visited.');
  });

  test.afterAll(async () => {
    await notificationBar(pluginPage).dismissAllNotifications();
    await closePage(pluginPage);
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

    // if (getConfigValue('skipDataUpdate') as boolean) {
    //   console.log('Skipping saving form');
    //   return;
    // }

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
        const hrmBaseUrl = `${manager.serviceConfiguration.attributes.hrm_base_url}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}-aselo_test`;

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
