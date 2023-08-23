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

import { getCurrentConfig } from '../aselo-webchat';

/**
 * If contentType is 'ip', we get contactIdentifier from the context.
 * Otherwise, we get contactIdentifier from the pre-engagement answers.
 */
function getContactIdentifier(manager: FlexWebChat.Manager, payload: any) {
  const { contactType } = getCurrentConfig();

  if (contactType === 'ip') {
    return manager.configuration.context.ip;
  }

  return payload.formData.contactIdentifier;
}

/**
 * Creates a new appConfig object based on the current one,
 * with these new properties at appConfig.context:
 *  - contactType
 *  - contactIdentifier
 */
function getUpdatedAppConfig(manager: FlexWebChat.Manager, contactIdentifier: string) {
  const { contactType } = getCurrentConfig();
  const appConfig = manager.configuration;

  // TODO: remove IP from context when possible
  return {
    ...appConfig,
    context: {
      ...appConfig.context,
      contactIdentifier,
      contactType,
    },
  };
}

/**
 * On 'beforeStartEngagement' event, adds to webchat context:
 *  - contactType
 *  - contactIdentifier
 */
export function addContactIdentifierToContext(manager: FlexWebChat.Manager) {
  FlexWebChat.Actions.addListener('beforeStartEngagement', async (payload) => {
    const contactIdentifier = getContactIdentifier(manager, payload);
    const updatedAppConfig = getUpdatedAppConfig(manager, contactIdentifier);

    manager.updateConfig(updatedAppConfig);
  });
}
