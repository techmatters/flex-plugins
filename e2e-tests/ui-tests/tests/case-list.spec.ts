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

// noinspection ES6UnusedImports

import { expect, Page, test } from '@playwright/test';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';

import '../flex-in-a-box/local-resources';
import hrmCases from '../aselo-service-mocks/hrm/cases';
import hrmPermissions from '../aselo-service-mocks/hrm/permissions';
import { caseList, Filter } from '../../caseList';
import AxeBuilder from '@axe-core/playwright';
import { aseloPage } from '../aselo-service-mocks/aselo-page';
import type { AxeResults } from 'axe-core';

test.describe.serial('Case List', () => {
  let page: Page;
  const cases = hrmCases();
  const permissions = hrmPermissions();

  test.beforeAll(async ({ browser }) => {
    await mockServer.start();
    page = await aseloPage(browser);
    await cases.mockCaseEndpoints(page);
    await permissions.mockPermissionEndpoint(page);
  });

  test.afterAll(async () => {
    await mockServer.stop();
  });

  test('Case list loads items', async () => {
    await page.goto('/case-list', { waitUntil: 'networkidle' });
    await caseList(page).verifyCaseIdsAreInListInOrder(
      cases
        .getMockCases()
        .slice(0, 10)
        .map((c) => c.id.toString()),
    );
  });

  test('Case list waiting passes AXE scan', async () => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    const caseListPage = caseList(page);

    const warnViolations = (results: AxeResults, componentDescription: string) => {
      if (results.violations.length) {
        console.warn(
          `${results.violations.length} accessibility violations found in ${componentDescription}.`,
        );
      }
    };

    const scanFilterDialogue = async (filter: Filter) => {
      console.debug(`Scanning the '${filter}' filter dialog...`);
      await caseListPage.openFilter(filter);
      const filterAccessibilityScanResults = await new AxeBuilder({ page })
        .include(`div[data-testid='CaseList-Filters-Panel']`)
        .analyze();
      // expect(filterAccessibilityScanResults.violations).toEqual([]);
      warnViolations(filterAccessibilityScanResults, `the '${filter}' filter dialog`);
      await caseListPage.openFilter(filter);
    };

    await scanFilterDialogue('Status');
    await scanFilterDialogue('Counselor');
    await scanFilterDialogue('createdAtFilter');
    await scanFilterDialogue('updatedAtFilter');
    await caseListPage.openFirstCaseButton();
    const caseHomeAccessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    expect(caseHomeAccessibilityScanResults.violations).toEqual([]);
    warnViolations(caseHomeAccessibilityScanResults, `the case home page`);
    await caseListPage.editCase();
    const caseEditAccessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    //expect(caseHomeAccessibilityScanResults.violations).toEqual([]);
    warnViolations(caseEditAccessibilityScanResults, `the case summary edit page`);
    await caseListPage.closeModal();
  });
});
