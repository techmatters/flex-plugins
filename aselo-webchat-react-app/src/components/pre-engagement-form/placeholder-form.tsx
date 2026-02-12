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

/**
 * WebChat is created by using the function FlexWebChat.createWebChat(config).
 * The 'config' parameter expects the property 'preEngagementConfig' to have at
 * least one field defined.
 *
 * This file will provide a placeholder preEngagementConfig that will be used to
 * call FlexWebChat.createWebChat(config) initially. But that's just to bypass this
 * WebChat limitation, because we're actually replacing the Twilio's default PreEngagement
 * with a custom one.
 */

export const PLACEHOLDER_PRE_ENGAGEMENT_CONFIG = {
  fields: [
    {
      label: 'Hidden Field',
      type: 'InputField',
      attributes: {
        name: '',
        readOnly: true,
      },
    },
  ],
};
