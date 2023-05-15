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
