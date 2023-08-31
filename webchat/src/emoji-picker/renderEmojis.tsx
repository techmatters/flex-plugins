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

import React from 'react';
import * as FlexWebChat from '@twilio/flex-webchat-ui';
import { Provider } from 'react-redux';

import EmojiButton from './components/EmojiButton';
import EmojiPicker from './components/EmojiPicker';

export const renderEmojis = (manager: FlexWebChat.Manager, blockedEmojis: string[] | undefined) => {
  FlexWebChat.MessageInput.Content.add(
    <Provider store={manager.store as any} key="emojibtn-provider">
      <EmojiButton />
    </Provider>,
  );

  FlexWebChat.MessagingCanvas.Content.add(
    <Provider store={manager.store as any} key="emojipicker-provider">
      <EmojiPicker blockedEmojis={blockedEmojis} />
    </Provider>,
  );
};
