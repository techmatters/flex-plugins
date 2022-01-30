import { Browser, expect } from '@playwright/test';

const ASELO_DEV_CHAT_URL = 'https://tl-public-chat-staging.s3.amazonaws.com/chat-staging.html'

enum ChatStatementOrigin {
  BOT,
  CALLER
}

type ChatStatement = { text: string, origin: ChatStatementOrigin};

export function botStatement(text: string): ChatStatement {
  return {
    text,
    origin: ChatStatementOrigin.BOT
  }
}

export function callerStatement(text: string): ChatStatement {
  return {
    text,
    origin: ChatStatementOrigin.CALLER
  }
}

export type WebChatPage = {
  openChat: () => Promise<void>,
  selectHelpline: (helpline: string) => Promise<void>,
  chat: (statements: ChatStatement[])=> Promise<void>,
  close: ()=> Promise<void>,
}


export async function open(browser: Browser): Promise<WebChatPage> {

  const page = await browser.newPage();
  const selectors = {
    chatPanelWindow: page.locator('div.Twilio-MainContainer'),
    toggleChatOpenButton:  page.locator('button.Twilio-EntryPoint'),

    //Pre engagement
    preEngagementWindow: page.locator('div.Twilio-PreEngagementCanvas'),
    helplineDropdown: page.locator('div#select-helpline'),
    helplineOptions: page.locator('div#menu-helpline ul'),
    startChatButton: page.locator('div.Twilio-PreEngagementCanvas button.Twilio-DynamicForm-submit'),

    //Chatting
    chatMessageArea: page.locator('div.Twilio-MessagingCanvas'),
    chatInput: page.locator('.Twilio-MessageInputArea-TextArea textarea'),
    chatSendButton: page.locator('button.Twilio-MessageInput-SendButton'),
    messageBubbles: page.locator('div.Twilio-MessageListItem div.Twilio-MessageBubble'),
    chatAvatars: page.locator('div.Twilio-MessageListItem div.Twilio-ChatItem-Avatar'),
  }
  await page.goto(ASELO_DEV_CHAT_URL);
  console.log('Waiting for start chat button to render.');
  await selectors.toggleChatOpenButton.waitFor();
  console.log('Found start chat button.');

  return {
    openChat: async ()=> {
      await expect(selectors.chatPanelWindow).toHaveCount(0, { timeout: 500});
      await selectors.toggleChatOpenButton.click();
      await expect(selectors.chatPanelWindow).toBeVisible();
    },
    selectHelpline: async (helpline: string)=> {
      await selectors.preEngagementWindow.waitFor();
      await expect(selectors.helplineOptions).toHaveCount(0);
      await selectors.helplineDropdown.click()
      await expect(selectors.helplineOptions).toBeVisible();
      await selectors.helplineOptions.locator(`li[data-value='${helpline}']`).click();
      await expect(selectors.helplineOptions).toHaveCount(0);
    },
    chat: async (statements: ChatStatement[] ) => {
      await selectors.startChatButton.click();
      await selectors.chatInput.waitFor();
      let botAvatars = 0;

      for(const statementItem of statements) {
        botAvatars = await selectors.chatAvatars.count();
        const { text, origin }: ChatStatement = statementItem;
        switch (origin) {
          case ChatStatementOrigin.CALLER:
            console.debug('Entering caller text:', text);
            await selectors.chatInput.fill(text);
            console.debug('Sending caller message:', text);
            await selectors.chatSendButton.click();
            console.debug('Sent caller message:', text);
            break;
          case ChatStatementOrigin.BOT:
            console.debug('Waiting for bot text:', text);
            await selectors.chatPanelWindow.locator(`div.Twilio-MessageListItem div.Twilio-MessageBubble-Body:text("${text}")`).waitFor({ timeout: 60000});
            console.debug('Found for bot text:', text);
            break;
        }
      }
    },
    close: async ()=> {
      await page.close();
    }
  }
}