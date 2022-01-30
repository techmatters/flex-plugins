import { Page, test } from '@playwright/test';
import { botStatement, callerStatement, WebChatPage } from '../webchat';
import * as webchat from '../webchat';

test.describe.serial('Web chat caller', ()=> {
  let chatPage: WebChatPage, pluginPage: Page;
  test.beforeAll(async ({browser})=> {
    pluginPage = await browser.newPage();
    console.log('Plugin page browser session launched.');
    await pluginPage.goto('/', {waitUntil: 'networkidle', timeout: 120000});
    console.log('Plugin page visited.');
    chatPage = await webchat.open(browser);
    console.log('Webchat browser session launched.');
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