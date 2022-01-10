import { test, Page } from '@playwright/test';
import * as webchat from '../webchat';
import { WebChatPage } from '../webchat';

test.describe.serial('Web chat caller', ()=> {
  let chatPage: WebChatPage, pluginPage: Page;
  test.beforeAll(async ({browser})=> {
    pluginPage = await browser.newPage();
    await pluginPage.goto('/');
    chatPage = await webchat.open(browser);
  });

  test.afterAll(async ({browser})=> {
    await Promise.all([
      chatPage?.close(),
      pluginPage?.close()
    ]);
  })
  test('Chat ', async ()=> {
    await chatPage.openChat();
    await chatPage.selectHelpline('Fake Helpline')
  })

})