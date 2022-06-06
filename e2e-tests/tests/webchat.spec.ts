import { Page, test } from '@playwright/test';
import * as webchat from '../webchat';
import { WebChatPage } from '../webchat';
import { statusIndicator, WorkerStatus } from '../workerStatus';
import {
  botStatement,
  callerStatement,
  ChatStatement,
  ChatStatementOrigin,
  counselorAutoStatement,
  counselorStatement,
} from '../chatModel';
import { flexChat } from '../flexChat';
import { tasks } from '../tasks';
import { Categories, contactForm, ContactFormTab } from '../contactForm';

test.describe.serial('Web chat caller', () => {
  let chatPage: WebChatPage, pluginPage: Page;
  test.beforeAll(async ({ browser }) => {
    pluginPage = await browser.newPage();
    console.log('Plugin page browser session launched.');
    await pluginPage.goto('/', { waitUntil: 'networkidle', timeout: 120000 });
    console.log('Plugin page visited.');
    chatPage = await webchat.open(browser);
    console.log('Webchat browser session launched.');
  });

  test.afterAll(async () => {
    await Promise.all([chatPage?.close(), pluginPage?.close()]);
  });
  test('Chat ', async () => {
    await chatPage.openChat();
    // await chatPage.selectHelpline('Fake Helpline'); // Step required in Aselo Dev, not in E2E
    const chatScript = [
      botStatement(
        'Welcome to the helpline. To help us better serve you, please answer the following three questions.',
      ),
      botStatement('Are you calling about yourself? Please answer Yes or No.'),
      callerStatement('yes'),
      botStatement("Thank you. You can say 'prefer not to answer' (or type X) to any question."),
      botStatement('How old are you?'),
      callerStatement('10'),
      botStatement('What is your gender?'), // Step required in Aselo Dev, not in E2E
      callerStatement('girl'),
      botStatement("We'll transfer you now. Please hold for a counsellor."),
      counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
      callerStatement('CALLER TEST CHAT MESSAGE'),
      counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
    ];

    const webchatProgress = chatPage.chat(chatScript);
    const flexChatProgress: AsyncIterator<ChatStatement> = flexChat(pluginPage).chat(chatScript);

    // Currently this loop handles the handing back and forth of control between the caller & counselor sides of the chat.
    // Each time round the loop it allows the webchat to process statements until it yields control back to this loop
    // And each time flexChatProgress.next(), the flex chat processes statements until it yields
    // Should be moved out to it's own function in time, and a cleaner was of injecting actions to be taken partway through the chat should be implemented.
    for await (const expectedCounselorStatement of webchatProgress) {
      console.log('Statement for flex chat to process', expectedCounselorStatement);
      if (expectedCounselorStatement) {
        switch (expectedCounselorStatement.origin) {
          case ChatStatementOrigin.COUNSELOR_AUTO:
            if (expectedCounselorStatement.text.startsWith('Hi, this is the counsellor')) {
              await statusIndicator(pluginPage).setStatus(WorkerStatus.AVAILABLE);
              await tasks(pluginPage).acceptNextTask();
            }
            await flexChatProgress.next();
            break;
          default:
            await flexChatProgress.next();
            break;
        }
      } else {
      }
    }
    console.log('Starting filling form');
    const form = contactForm(pluginPage);
    await form.fill([
      <ContactFormTab>{
        id: 'childInformation',
        label: 'Child',
        fill: form.fillStandardTab,
        items: {
          firstName: 'E2E',
          lastName: 'TEST',
          phone1: '1234512345',
          province: 'Northern',
          district: 'District A',
        },
      },
      <ContactFormTab<Categories>>{
        id: 'categories',
        label: 'Categories',
        fill: form.fillCategoriesTab,
        items: {
          Accessibility: ['Education'],
        },
      },
      <ContactFormTab>{
        id: 'caseInformation',
        label: 'Summary',
        fill: form.fillStandardTab,
        items: {
          callSummary: 'E2E TEST CALL',
        },
      },
    ]);
    await form.save();
  });
});
