// noinspection ES6UnusedImports

import { expect, Page, test } from '@playwright/test';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { preload, useUnminifiedFlex } from '../flex-in-a-box/local-resources';
import hrmCases from '../aselo-service-mocks/hrm/cases';
import { caseList, Filter } from '../../caseList';
import AxeBuilder from '@axe-core/playwright';
import { aseloPage } from '../aselo-service-mocks/aselo-page';
import type { AxeResults } from 'axe-core';

test.describe.serial('Case List', () => {
  let page: Page;
  const cases = hrmCases();

  test.beforeAll(async ({ browser }) => {
    await mockServer.start();
    page = await aseloPage(browser);
    await cases.mockCaseEndpoints(page);
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
      await caseListPage.openFilter(filter);

      const filterAccessibilityScanResults = await new AxeBuilder({ page })
        .include(`div[data-testid='CaseList-Filters-Panel']`)
        .analyze();
      // expect(filterAccessibilityScanResults.violations).toEqual([]);
      warnViolations(filterAccessibilityScanResults, `the '${filter}' filter dialog`);
      await caseListPage.openFilter(filter);
    };

    await scanFilterDialogue('Status');
    await scanFilterDialogue('Categories');
    await scanFilterDialogue('Counselor');
    await scanFilterDialogue('createdAtFilter');
    await scanFilterDialogue('updatedAtFilter');
    await scanFilterDialogue('followUpDateFilter');
    await caseListPage.openFirstCaseButton();
    const caseHomeAccessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    //expect(caseHomeAccessibilityScanResults.violations).toEqual([]);
    warnViolations(caseHomeAccessibilityScanResults, `the case home page`);
    await caseListPage.editCase();
    const caseEditAccessibilityScanResults = await new AxeBuilder({ page })
      .include('div.Twilio-View-case-list')
      .analyze();
    //expect(caseHomeAccessibilityScanResults.violations).toEqual([]);
    warnViolations(caseEditAccessibilityScanResults, `the case summary edit page`);
    await caseListPage.closeEditCase();
  });
});
