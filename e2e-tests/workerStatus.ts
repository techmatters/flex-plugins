import { expect, Page } from '@playwright/test';

export enum WorkerStatus {
  UNKNOWN,
  AVAILABLE = 'Available',
  OFFLINE = 'Offline'
}

export function statusIndicator(page: Page) {

  const selectors = {
    userControlsAvatar: page.locator('button.Twilio-UserControls-UserCard'),
    userControlsStatusOption:  (status: WorkerStatus)=>page.locator(`button.Twilio-AccountMenu-Item:text-is("${status}")`),
    userCardStatus: page.locator('div.Twilio-UserCard-InfoContainer-SecondLine span')
  }

  return {
    setStatus: async function (status: WorkerStatus) {
      await selectors.userControlsAvatar.click();
      console.log('Worker status dropdown should be open');
      const statusSelector = selectors.userControlsStatusOption(status);
      await statusSelector.waitFor({state: 'visible'});
      console.log('Worker status option spotted');
      await statusSelector.click();
      console.log('Worker status option clicked');
      await expect(selectors.userCardStatus).toContainText(status.toLocaleString());
      console.log('Status changed');
    }
  }

}