import { Page } from '@playwright/test';


export function tasks(page: Page) {
  const selectors = {
    taskListFirstAcceptButton: page.locator('.Twilio-TaskList button.Twilio-TaskButton-Accept').first(),
    taskListFirstMessageIcon: page.locator('.Twilio-TaskList div.Twilio-Icon-MessageBold').first()

  }

  return {
    acceptNextTask: async function(): Promise<void> {
      await selectors.taskListFirstAcceptButton.waitFor({state: 'visible'});
      await selectors.taskListFirstAcceptButton.click();
      await selectors.taskListFirstAcceptButton.waitFor({state: 'hidden'});
    }
  }
}