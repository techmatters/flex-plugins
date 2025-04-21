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
import { clickEditCase, closeModal } from '../../case';
import AxeBuilder from '@axe-core/playwright';
import { aseloPage } from '../aselo-service-mocks/aselo-page';

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

  test.beforeEach(async () => {
    await page.goto('/case-list', { waitUntil: 'networkidle' });
    await page.waitForSelector('div.Twilio-View-case-list', { state: 'visible', timeout: 10000 });
    await caseList(page).openFirstCaseButton();
    await page.waitForSelector('div[data-testid="CaseHome-CaseDetailsComponent"]', {
      state: 'visible',
      timeout: 10000,
    });
  });

  test('Case view page is loaded and passes AXE scan', async () => {
    const caseViewScanResults = await new AxeBuilder({ page })
      .include('div[data-testid="CaseHome-CaseDetailsComponent"]')
      .analyze();
    expect(caseViewScanResults.violations).toEqual([]);
  });

  test('Case view page is accessible and has case information and overview elements', async () => {
    const checkElementAccessibility = async (testId: string, attributeName: string) => {
      await expect(page.getByTestId(testId)).toBeVisible();
      const element = page.getByTestId(testId);
      expect(await element.getAttribute(attributeName)).toBeTruthy();
    };

    const checkElementHasVisibleLabel = async (testId: string) => {
      const input = page.getByTestId(testId);
      const labelId = await input.getAttribute('aria-labelledby');

      if (labelId) {
        const label = page.locator(`#${labelId}`);
        await expect(label).toBeVisible();
      }
    };

    await checkElementAccessibility('Case-DetailsHeaderCaseId', 'id');
    await expect(page.getByTestId('Case-DetailsHeaderCounselor')).toBeVisible();
    const caseOverviewIds = ['CaseDetailsStatusLabel', 'childIsAtRisk', 'createdAt', 'updatedAt'];

    for (const fieldId of caseOverviewIds) {
      await checkElementAccessibility(`Case-CaseOverview-${fieldId}`, 'aria-labelledby');
      await checkElementHasVisibleLabel(`Case-CaseOverview-${fieldId}`);
    }

    const caseViewScanResults = await new AxeBuilder({ page })
      .include('div[data-testid="CaseHome-CaseDetailsComponent"]')
      .analyze();
    expect(caseViewScanResults.violations).toEqual([]);

    await closeModal(page);
  });

  test('Case overview edit form opens and supports keyboard navigation', async () => {
    await clickEditCase(page);
    await expect(page.getByTestId('Case-EditCaseOverview')).toBeVisible();

    const getActiveElement = () => {
      return (
        document.activeElement?.getAttribute('id') ||
        document.activeElement?.getAttribute('data-testid')
      );
    };
    const activeElement = await page.evaluate(getActiveElement);
    expect(activeElement).toBeTruthy();

    const formControls = [
      { selector: '#status', type: 'select' },
      { selector: '#childIsAtRisk', type: 'checkbox' },
      { selector: '#followUpDate', type: 'date' },
      { selector: '#reportDate', type: 'date' },
      { selector: '#operatingArea', type: 'select' },
      { selector: '#priority', type: 'select' },
      { selector: '#summary', type: 'textarea' },
      { selector: '[data-testid="Case-EditCaseScreen-SaveItem"]', type: 'button' },
    ];

    await page.focus(formControls[0].selector);

    for (let i = 1; i < formControls.length; i++) {
      if (i > 0 && formControls[i - 1].type === 'date') {
        await page.keyboard.press('Tab'); // day
        await page.keyboard.press('Tab'); // year
        await page.keyboard.press('Tab'); // calendar icon/next field
      } else {
        await page.keyboard.press('Tab');
      }

      const focusedElement = await page.evaluate(getActiveElement);

      const expectedId = formControls[i].selector.startsWith('#')
        ? formControls[i].selector.substring(1)
        : formControls[i].selector.match(/data-testid="([^"]+)"/)?.[1];

      expect(focusedElement).toBe(expectedId);
    }

    await closeModal(page);
  });

  test('Case overview edit form meets accessibility requirements', async () => {
    await clickEditCase(page);
    await expect(page.getByTestId('Case-EditCaseOverview')).toBeVisible();

    const caseEditScanResults = await new AxeBuilder({ page })
      .include('div[data-testid="Case-EditCaseOverview"]')
      .analyze();
    expect(caseEditScanResults.violations).toEqual([]);
    await closeModal(page);
    await expect(page.getByTestId('Case-EditCaseOverview')).not.toBeVisible();
    await expect(page.getByTestId('CaseHome-CaseDetailsComponent')).toBeVisible();
  });
});
