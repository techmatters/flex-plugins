// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from './global-context';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Mocks out the form definitions endpoint
 * @param page
 */
export const mockFormDefinitions = async (page: Page) => {
  await page.route(new RegExp(`${context.FORM_DEFINITIONS_BASE_URL}(.+)`), async (route) => {
    const definitionFile = route
      .request()
      .url()
      .substring(context.FORM_DEFINITIONS_BASE_URL.toString().length);
    const definitionFilePath = path.join(
      '../hrm-form-definitions/form-definitions/as/v1',
      definitionFile,
    );
    console.log('Loading form def file:', definitionFilePath);
    try {
      const definitionFileContent = await fs.readFile(definitionFilePath);
      console.log(
        'Loaded form def file:',
        definitionFilePath,
        'length:',
        definitionFileContent.length,
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: definitionFileContent,
      });
    } catch (err) {
      console.error(definitionFilePath, err);
      await route.fulfill({
        status: 500,
      });
    }
  });
};
