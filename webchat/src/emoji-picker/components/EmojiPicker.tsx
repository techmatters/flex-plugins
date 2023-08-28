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

/* eslint-disable react/require-default-props */
import React, { useState, useEffect, useCallback } from 'react';
import Picker from '@emoji-mart/react';
import { connect } from 'react-redux';
import { Actions, ActionPayload } from '@twilio/flex-webchat-ui';

import { AseloWebchatState } from '../../aselo-webchat-state';
import { toggleEmojiPicker } from '../emoji-state';
import { Popup } from './emoji-styles';
import { getLocale } from './localizedEmojiPicker';

type OwnProps = {
  blockedEmojis?: string[] | undefined;
};

const EmojiPicker = ({ channelSid, isPickerOpen, onToggleEmojiPicker, language, blockedEmojis }: Props) => {
  const [inputText, setInputText] = useState('');

  type onEmojiSelectPayload = {
    native: string;
  };

  const concatEmoji = (input: string, emoji: string) => {
    if (input.length === 0) {
      return emoji;
    }
    return `${inputText}${emoji}`;
  };

  const handleSelectEmoji = useCallback(
    (payload: onEmojiSelectPayload) => {
      const body = concatEmoji(inputText, payload.native);
      Actions.invokeAction('SetInputText', {
        channelSid,
        body,
      });

      onToggleEmojiPicker();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputText, channelSid],
  );

  /**
   * Adds two listeners: Action.SetInputText to track the inputText value
   * Action.SendMessage to track and set inputText to an empty string
   */
  useEffect(() => {
    const inputTextListener = (event: ActionPayload) => {
      setInputText(event.body);
    };
    Actions.addListener('afterSetInputText', inputTextListener);

    Actions.addListener('afterSendMessage', () => {
      setInputText('');
    });

    return () => {
      Actions.removeListener('afterSetInputText', inputTextListener);
      Actions.removeListener('afterSendMessage', () => {
        setInputText('');
      });
    };
  }, [inputText]);

  return (
    <>
      {isPickerOpen && (
        <Popup>
          <Picker
            perLine={7}
            emojiButtonSize={26}
            emojiSize={20}
            onClickOutside={onToggleEmojiPicker}
            onEmojiSelect={handleSelectEmoji}
            exceptEmojis={blockedEmojis || undefined}
            locale={getLocale(language || 'en-US')}
          />
        </Popup>
      )}
    </>
  );
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const mapStateToProps = (state: AseloWebchatState) => {
  return {
    isPickerOpen: state?.emoji?.isPickerOpen,
    channelSid: state?.flex?.session?.channelSid ?? {},
    language: state?.flex?.config?.language,
  };
};

const mapDispatchToProps = {
  onToggleEmojiPicker: toggleEmojiPicker,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPicker);
