/**
 * Copyright (C) 2021-2026 Technology Matters
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
import Picker from '@emoji-mart/react';
import { Box } from '@twilio-paste/core/box';

import { emojiPickerPopupStyles } from './styles/MessageInput.styles';
import { getLocale } from './localizedEmojiPicker';

type EmojiSelectPayload = {
  native: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  blockedEmojis?: string[];
  locale?: string;
};

export const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, blockedEmojis, locale }: Props) => {
  if (!isOpen) {
    return null;
  }

  const handleEmojiSelect = (payload: EmojiSelectPayload) => {
    onEmojiSelect(payload.native);
    onClose();
  };

  return (
    <Box {...emojiPickerPopupStyles}>
      <Picker
        perLine={7}
        emojiButtonSize={26}
        emojiSize={20}
        onClickOutside={onClose}
        onEmojiSelect={handleEmojiSelect}
        exceptEmojis={blockedEmojis || undefined}
        locale={locale ? getLocale(locale) : undefined}
      />
    </Box>
  );
};
