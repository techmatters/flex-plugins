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

import React, { useEffect, useState, useCallback } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Actions, ActionPayload, withTaskContext, TaskContextProps, ITask, Manager } from '@twilio/flex-ui';
import { EmojiIcon } from '@twilio-paste/icons/cjs/EmojiIcon';
import Picker from '@emoji-mart/react';

import { Relative, Popup, SelectEmojiButton } from './styles';
import { configurationBase, namespace, RootState } from '../../states';

type onEmojiSelectPayload = {
  native: string;
};

const EMOJIS_PER_LINE_DEFAULT = 9;
const MESSAGING_CANVAS_WIDTH_DEFAULT = 420;
const EMOJI_WIDTH = 36;

const getConversationSid = (task: ITask) =>
  task && task.attributes && (task.attributes.conversationSid || task.attributes.channelSid);

const concatEmoji = (inputText: string, emoji: string) => {
  if (inputText.length === 0) {
    return emoji;
  }

  return `${inputText} ${emoji}`;
};

const mapStateToProps = (state: RootState) => ({
  definitionVersion: state[namespace][configurationBase].currentDefinitionVersion,
});

const connector = connect(mapStateToProps);

const EmojiPicker: React.FC<TaskContextProps & ConnectedProps<typeof connector>> = ({ task, definitionVersion }) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [emojisPerLine, setEmojisPerLine] = useState(EMOJIS_PER_LINE_DEFAULT);

  const { blockedEmojis } = definitionVersion ?? { blockedEmojis: [] };
  const conversationSid = getConversationSid(task);

  /**
   * Adds listener on Action.SetInputText to track the InputText value
   */
  useEffect(() => {
    const inputTextListener = (event: ActionPayload) => setInputText(event.body);
    Actions.addListener('afterSetInputText', inputTextListener);

    return () => {
      Actions.removeListener('afterSetInputText', inputTextListener);
    };
  }, []);

  /**
   * Adds listener to change the number of emojis per line,
   * based on the canvas width
   */
  useEffect(() => {
    const messagingCanvasResizeListener = () => {
      const canvas = document.querySelector<HTMLDivElement>('.Twilio-MessagingCanvas');
      const width = canvas.clientWidth;

      if (width < MESSAGING_CANVAS_WIDTH_DEFAULT) {
        const emojisPerLine =
          EMOJIS_PER_LINE_DEFAULT - Math.ceil((MESSAGING_CANVAS_WIDTH_DEFAULT - width) / EMOJI_WIDTH);
        setEmojisPerLine(emojisPerLine);
      } else {
        setEmojisPerLine(EMOJIS_PER_LINE_DEFAULT);
      }
    };
    const manager = Manager.getInstance();
    manager.events.addListener('flexSplitterResize', messagingCanvasResizeListener);

    return () => {
      manager.events.removeListener('flexSplitterResize', messagingCanvasResizeListener);
    };
  }, []);

  const togglePicker = () => setIsOpen(isOpen => !isOpen);
  const handleClickOutside = () => isOpen && setIsOpen(false);

  /**
   * Put selected emoji on the InputText
   */
  const handleSelectEmoji = useCallback(
    (payload: onEmojiSelectPayload) => {
      const body = concatEmoji(inputText, payload.native);
      Actions.invokeAction('SetInputText', {
        body,
        conversationSid,
      });
      setIsOpen(false);
    },
    [inputText, conversationSid],
  );

  return (
    <Relative>
      <Popup isOpen={isOpen}>
        <Picker
          onEmojiSelect={handleSelectEmoji}
          onClickOutside={handleClickOutside}
          exceptEmojis={blockedEmojis}
          perLine={emojisPerLine}
        />
      </Popup>
      <SelectEmojiButton type="button" onClick={togglePicker}>
        <EmojiIcon decorative={false} title="Select emoji" />
      </SelectEmojiButton>
    </Relative>
  );
};

EmojiPicker.displayName = 'EmojiPicker';
export default withTaskContext(connector(EmojiPicker));
