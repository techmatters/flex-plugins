// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

export const useUnminifiedFlex = async (page: Page) => {
  await page.route(
    'https://assets.flex.twilio.com/releases/flex-ui/2.0.0/twilio-flex.unbundled-react.min.js',
    (route) => {
      route.fulfill({ path: './unminified/flex-ui/2.0.2/twilio-flex.unbundled-react.unmin.js' });
    },
  );
};
