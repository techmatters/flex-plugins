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
import fs from 'fs';
import context from './global-context';

/**
 * An option to prebuild the plugin and cache it in the test runner
 * This can speed things up but the plugin needs to e rebuilt if the plugin code changes
 */
export const usePrebuiltPlugin = async (page: Page) => {
  if (context.CACHE_PREBUILT_PLUGIN) {
    const pluginJsContent = await fs.promises.readFile(
      '../plugin-hrm-form/build/plugin-hrm-form.js',
    );
    await page.route('http://localhost:3000/plugins/plugin-hrm-form.js', (route) => {
      route.fulfill({ body: pluginJsContent, contentType: 'application/javascript' });
    });
  }
};
