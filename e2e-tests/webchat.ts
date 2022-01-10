import { Browser, expect } from '@playwright/test';

const ASELO_DEV_CHAT_URL = 'https://tl-public-chat-staging.s3.amazonaws.com/chat-staging.html'

export type WebChatPage = {
  openChat: () => Promise<void>,
  selectHelpline: (helpline: string) => Promise<void>,
  close: ()=> Promise<void>
}

export async function open(browser: Browser): Promise<WebChatPage> {

  const page = await browser.newPage();
  const selectors = {
    chatPanelWindow: page.locator('div.Twilio-MainContainer'),
    preengagementWindow: page.locator('div.Twilio-PreEngagementCanvas'),
    chatWindow: page.locator('div.Twilio-MessagingCanvas'),
    startChatButton:  page.locator('button.Twilio-EntryPoint'),
    helplineDropdown: page.locator('div#select-helpline'),
    helplineOptions: page.locator('div#menu-helpline ul')
  }
  await page.goto(ASELO_DEV_CHAT_URL);
  await selectors.startChatButton.waitFor();

  return {
    openChat: async ()=> {
      await expect(selectors.chatPanelWindow).toHaveCount(0);
      await selectors.startChatButton.click();
      await expect(selectors.chatPanelWindow).toBeVisible();
    },
    selectHelpline: async (helpline: string)=> {
      await selectors.preengagementWindow.waitFor();
      await expect(selectors.helplineOptions).toHaveCount(0);
      await selectors.helplineDropdown.click()
      await expect(selectors.helplineOptions).toBeVisible();
      await selectors.helplineOptions.locator(`li[data-value='${helpline}']`).click();
      await expect(selectors.helplineOptions).toHaveCount(0);
    },
    close: async ()=> {
      await page.close();
    }
  }
}