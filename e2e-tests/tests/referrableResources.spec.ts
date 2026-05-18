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

import { Page, request, test } from '@playwright/test';
import { Categories, contactForm, ContactFormTab } from '../contactForm';
import { agentDesktop, navigateToAgentDesktop } from '../agent-desktop';
import { skipTestIfNotTargeted, skipTestIfDataUpdateDisabled } from '../skipTest';
import { notificationBar } from '../notificationBar';
import { setupContextAndPage, closePage } from '../browser';
import { referableResources } from '../referrableResources';
import { clearOfflineTask } from '../hrm/clearOfflineTask';
import { apiHrmRequest } from '../hrm/hrmRequest';

test.describe.serial('Resource Search', () => {
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

  test('Search for a resource and refer it', async () => {
    console.info('Open a new offline contact');
    const agentDesktopPage = agentDesktop(pluginPage);
    await agentDesktopPage.addOfflineContact();

    console.info('Starting filling form');
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

    console.info('Search for a resource and add it to the contact');
    const referrableResourcesPage = referableResources(pluginPage);
    await referrableResourcesPage.openReferrableResources();
    await referrableResourcesPage.searchResources('faketon');
    await referrableResourcesPage.selectFirstResource();
    await referrableResourcesPage.verifyTitle(
      'Multicultural Association of the Faketon Area - Newcomer Settlement Services',
    );
    await referrableResourcesPage.verifyWebsite('https://place-holder.org/programs/');
    await referrableResourcesPage.copyId();
    await referrableResourcesPage.openAgentDesktop();
    await referrableResourcesPage.addResourceToContact();

    console.info('Saving form');
    await form.save();
  });
});
