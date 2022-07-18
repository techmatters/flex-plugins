// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

export const agentDesktop = (page: Page) => {
  const selectors = {
    addOfflineContactButton: () =>
      page.locator(`//button[@data-fs-id='Task-AddOfflineContact-Button']`),
  };

  const addOfflineContact = async () => {
    const addOfflineContactButton = selectors.addOfflineContactButton();
    await addOfflineContactButton.waitFor({ state: 'visible' });
    await addOfflineContactButton.click();
  };

  return {
    addOfflineContact,
  };
};
