// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import * as fs from 'fs';

let flexJsContent: Buffer;

export const preload = async () => {
  flexJsContent = await fs.promises.readFile(
    './unminified/flex-ui/2.0.2/twilio-flex.unbundled-react.unmin.js',
  );
};

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
