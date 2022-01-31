import { Page, test } from '@playwright/test';
import * as webchat from '../webchat';
import { WebChatPage } from '../webchat';
import { statusIndicator, WorkerStatus } from '../workerStatus';
import {
  botStatement,
  callerStatement,
  ChatStatement,
  ChatStatementOrigin,
  counselorAutoStatement, counselorStatement
} from '../chatModel';
import { flexChat } from '../flexChat';
import { tasks } from '../tasks';

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
    const chatScript = [
      botStatement("Welcome to the helpline. To help us better serve you, please answer the following three questions."),
      botStatement("Are you calling about yourself? Please answer Yes or No."),
      callerStatement("yes"),
      botStatement("Thank you. You can say 'prefer not to answer' (or type X) to any question."),
      botStatement("How old are you?"),
      callerStatement("10"),
      botStatement("What is your gender?"),
      callerStatement("girl"),
      botStatement("We'll transfer you now. Please hold for a counsellor."),
      counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
      callerStatement('CALLER TEST CHAT MESSAGE'),
      counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
    ]

    const webchatProgress = chatPage.chat(chatScript);
    const flexChatProgress: AsyncIterator<ChatStatement> = flexChat(pluginPage).chat(chatScript);

    for await (const expectedCounselorStatement of webchatProgress) {
      console.log('Statement for flex chat to process', expectedCounselorStatement);
      if (expectedCounselorStatement) {
        switch (expectedCounselorStatement.origin) {
          case ChatStatementOrigin.COUNSELOR_AUTO:
            if (expectedCounselorStatement.text.startsWith('Hi, this is the counsellor')) {
              await tasks(pluginPage).acceptNextTask();
            }
            await flexChatProgress.next();
            break;
          default:
            await flexChatProgress.next();
            break;
        }
      }
    }


    await statusIndicator(pluginPage).setStatus(WorkerStatus.AVAILABLE);
  })

})