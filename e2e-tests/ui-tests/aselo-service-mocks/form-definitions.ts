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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from './global-context';
import * as fs from 'fs/promises';
import { existsSync as fileExists } from 'fs';
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
      '../lambdas/packages/hrm-form-definitions/form-definitions',
      definitionFile,
    );
    console.log('Loading form def file:', definitionFilePath);
    try {
      if (!fileExists(definitionFilePath)) {
        await route.fulfill({
          status: 404,
        });
        return;
      }
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
