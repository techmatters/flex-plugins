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

import * as FlexWebChat from '@twilio/flex-webchat-ui';

export const WIDGET_EXPANDED_CLASS = 'AseloWidget-Expanded';

/**
 * This function adds/removes '.AseloWidget-Expanded' class to the widget's
 * floating button. On a mobile device, this class will hide the floating button.
 */
function addOrRemoveWidgetExpandedClass(manager: FlexWebChat.Manager) {
  const entryPointButton = document.querySelector<HTMLButtonElement>('button.Twilio-EntryPoint');
  if (!entryPointButton) {
    return;
  }

  const { isEntryPointExpanded } = manager.store.getState().flex.session;

  if (isEntryPointExpanded) {
    entryPointButton.classList.add(WIDGET_EXPANDED_CLASS);
  } else {
    entryPointButton.classList.remove(WIDGET_EXPANDED_CLASS);
  }
}

export function addWidgetExpandedListener(manager: FlexWebChat.Manager) {
  /**
   * Calls addOrRemoveWidgetExpandedClass a first time to handle the scenario
   * where the chat is initially expanded
   */
  addOrRemoveWidgetExpandedClass(manager);

  /**
   * Calls addOrRemoveWidgetExpandedClass everytime the user toggles
   * the chat's visibility. This will make the button visible again
   * in case the chat is collapsed.
   */
  FlexWebChat.Actions.addListener('afterToggleChatVisibility', () => addOrRemoveWidgetExpandedClass(manager));
}
