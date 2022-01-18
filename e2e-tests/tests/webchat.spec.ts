import { test, Page } from '@playwright/test';
import * as webchat from '../webchat';
import { botStatement, callerStatement, WebChatPage } from '../webchat';

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
    await chatPage.selectHelpline('Fake Helpline');
    await chatPage.chat([
      botStatement("Welcome to the helpline. To help us better serve you, please answer the following three questions."),
      botStatement("Are you calling about yourself? Please answer Yes or No."),
      callerStatement("yes"),
      botStatement("Thank you. You can say 'prefer not to answer' (or type X) to any question."),
      botStatement("How old are you?"),
      callerStatement("10"),
      botStatement("What is your gender?"),
      callerStatement("girl"),
      botStatement("We'll transfer you now. Please hold for a counsellor."),
    ])
  })

})