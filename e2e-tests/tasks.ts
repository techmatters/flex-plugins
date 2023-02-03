/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

export function tasks(page: Page) {
  const selectors = {
    taskListFirstAcceptButton: page
      .locator('.Twilio-TaskList button.Twilio-TaskButton-Accept')
      .first(),
    taskListFirstMessageIcon: page.locator('.Twilio-TaskList div.Twilio-Icon-MessageBold').first(),
  };

  return {
    acceptNextTask: async function (): Promise<void> {
      await selectors.taskListFirstAcceptButton.waitFor({ state: 'visible' });
      await selectors.taskListFirstAcceptButton.click();
      await selectors.taskListFirstAcceptButton.waitFor({ state: 'hidden' });
    },
  };
}
