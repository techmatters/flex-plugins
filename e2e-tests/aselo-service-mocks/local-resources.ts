// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import fs from 'fs';
import context from './global-context';

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
