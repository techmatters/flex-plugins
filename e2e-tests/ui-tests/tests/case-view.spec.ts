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
});
