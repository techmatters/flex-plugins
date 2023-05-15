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
import * as fs from 'fs';

let flexJsContent: Buffer;

/**
 * Optimises the loading of the unminified flex library by buffering it locally
 */
export const preload = async () => {
  flexJsContent = await fs.promises.readFile(
    './unminified/flex-ui/2.0.2/twilio-flex.unbundled-react.unmin.js',
  );
};

/**
 * If you use an unminifier on the flex libraries, you can use this to swap it for the default version flex pulls from Twilio
 * If we need to debug the bowels of Flex, this is a vaguely humane option.
 * You need to call preload() before using this to buffer the unminified contents locally (or change the below function to read it directly from the local file system)
 * @param page
 */
export const useUnminifiedFlex = async (page: Page) => {
  await page.route('https://**', (route) => {
    route.fulfill({ status: 404 });
  });
  await page.route('https://**/*.css**', (route) => {
    route.continue();
  });
  await page.route('https://**/*.js**', (route) => {
    route.continue();
  });
  await page.route('https://**/*.woff**', (route) => {
    route.continue();
  });
  await page.route('https://fonts.googleapis.com/css**', (route) => {
    route.continue();
  });
  await page.route(
    'https://assets.flex.twilio.com/releases/flex-ui/2.0.0/twilio-flex.unbundled-react.min.js',
    (route) => {
      route.fulfill({ body: flexJsContent, contentType: 'application/javascript' });
    },
  );
  /*await page.route('https://media.twiliocdn.com/**', (route) => {
    route.fulfill({ status: 404 });
  });*/
};
