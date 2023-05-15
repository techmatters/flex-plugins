// eslint-disable-next-line import/no-extraneous-dependencies
import { Browser, Page } from '@playwright/test';
import { preload, useUnminifiedFlex } from '../flex-in-a-box/local-resources';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import { logPageTelemetry } from '../../browser-logs';
import { fakeAuthenticatedBrowser } from '../flex-in-a-box/flex-auth';
import flexContext from '../flex-in-a-box/global-context';
import aseloContext from './global-context';
import { mockStartup } from './startup-mocks';
import { usePrebuiltPlugin } from './local-resources';

/**
 * Opens an Aselo page with enough backend mocked out for it to load & render without errors
 * @param browser
 */
export const aseloPage = async (browser: Browser): Promise<Page> => {
  await preload();
  const newContext = await browser.newContext({
    proxy: { server: `http://localhost:${mockServer.port()}`, bypass: 'localhost:3100' },
  });
  const page = await newContext.newPage();

  if (aseloContext.CACHE_PREBUILT_PLUGIN) {
    await usePrebuiltPlugin(page);
  }
  await useUnminifiedFlex(page);
  logPageTelemetry(page);
  await fakeAuthenticatedBrowser(page, flexContext.ACCOUNT_SID);
  await mockStartup(page);
  return page;
};
