import React, { useEffect, useState, useCallback } from 'react';
import { Actions, ActionPayload, withTaskContext, TaskContextProps, ITask } from '@twilio/flex-ui';
import { EmojiIcon } from '@twilio-paste/icons/esm/EmojiIcon';
import Picker from '@emoji-mart/react';

import { Relative, Popup, SelectEmojiButton } from './styles';

type onEmojiSelectPayload = {
  native: string;
};

const getConversationSid = (task: ITask) =>
  task && task.attributes && (task.attributes.conversationSid || task.attributes.channelSid);

const concatEmoji = (inputText: string, emoji: string) => {
  if (inputText.length === 0) {
    return emoji;
  }

  return `${inputText} ${emoji}`;
};

const EmojiPicker: React.FC<TaskContextProps> = ({ task }) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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
        <Picker onEmojiSelect={handleSelectEmoji} onClickOutside={handleClickOutside} />
      </Popup>
      <SelectEmojiButton type="button" onClick={togglePicker}>
        <EmojiIcon decorative={false} title="Select emoji" />
      </SelectEmojiButton>
    </Relative>
  );
};

export default withTaskContext(EmojiPicker);
