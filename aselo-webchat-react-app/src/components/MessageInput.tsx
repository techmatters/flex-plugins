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

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import throttle from 'lodash.throttle';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@twilio-paste/core/box';
import { InputBox } from '@twilio-paste/core/input-box';
import { TextArea } from '@twilio-paste/core/textarea';
import { Button } from '@twilio-paste/core/button';
import { SendIcon } from '@twilio-paste/icons/cjs/SendIcon';

import { AppState } from '../store/definitions';
import { AttachFileButton } from './AttachFileButton';
import { FilePreview } from './FilePreview';
import { EmojiPicker } from './EmojiPicker';
import { detachFiles } from '../store/actions/genericActions';
import { CHAR_LIMIT } from '../constants';
import {
  formStyles,
  innerInputStyles,
  messageOptionContainerStyles,
  filePreviewContainerStyles,
  textAreaContainerStyles,
} from './styles/MessageInput.styles';
import { useSanitizer } from '../utils/useSanitizer';
import { selectCurrentLocale } from '../store/config.reducer';

export const MessageInput = () => {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const { conversation, attachedFiles, fileAttachmentConfig, emojiPickerConfig, currentLocale } = useSelector(
    (state: AppState) => ({
      conversation: state.chat.conversation,
      attachedFiles: state.chat.attachedFiles || [],
      fileAttachmentConfig: state.config.fileAttachment,
      emojiPickerConfig: state.config.emojiPicker,
      currentLocale: selectCurrentLocale(state),
    }),
  );
  const oldAttachmentsLength = useRef((attachedFiles || []).length);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentsBoxRef = useRef<HTMLDivElement>(null);

  const throttleChange = useMemo(
    () =>
      throttle(() => {
        conversation?.typing();

        // in case the input was already focused, let's make sure to send the `read` status if the customer is typing
        if (conversation?.lastReadMessageIndex !== conversation?.lastMessage?.index) {
          conversation?.setAllMessagesRead();
        }
      }, 500),
    [conversation],
  );
  const { onUserInputSubmit } = useSanitizer();

  const logger = window.Twilio.getLogger('MessageInput');
  const isSubmitDisabled = (!text.trim() && !attachedFiles?.length) || isSending;

  const send = async () => {
    if (isSubmitDisabled) {
      return;
    }
    if (!conversation) {
      logger.error('Failed sending message: no conversation found');
      return;
    }
    setIsSending(true);

    let preparedMessage = conversation.prepareMessage();
    preparedMessage = preparedMessage.setBody(onUserInputSubmit(text));
    attachedFiles.forEach((file: File) => {
      const formData = new FormData();
      formData.append(file.name, file);
      preparedMessage.addMedia(formData);
    });
    await preparedMessage.build().send();
    setText('');
    dispatch(detachFiles(attachedFiles));
    setIsSending(false);
    textAreaRef.current?.focus();
  };

  const onKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLInputElement).form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const onChange = (val: ChangeEvent<HTMLTextAreaElement>) => {
    setText(val.target.value);

    throttleChange();
  };

  const onFocus = () => {
    conversation?.setAllMessagesRead();
  };

  const onEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
    textAreaRef.current?.focus();
  };

  useEffect(() => {
    textAreaRef.current?.setAttribute('rows', '1');
    textAreaRef.current?.focus();
  }, [textAreaRef]);

  // Ensuring attached files are automatically scrolled to
  useEffect(() => {
    if (!attachmentsBoxRef.current) {
      return;
    }

    if (attachedFiles.length > oldAttachmentsLength.current) {
      (attachmentsBoxRef.current.lastChild as Element)?.scrollIntoView();
    }

    oldAttachmentsLength.current = attachedFiles.length;
  }, [attachedFiles]);

  return (
    <Box
      as="form"
      {...formStyles}
      onSubmit={e => {
        e.preventDefault();
        send();
      }}
    >
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={onEmojiSelect}
        blockedEmojis={emojiPickerConfig?.blockedEmojis}
        locale={currentLocale}
      />
      <InputBox element="MESSAGE_INPUT_BOX" disabled={isSending}>
        <Box as="div" {...innerInputStyles}>
          <Box {...textAreaContainerStyles}>
            <TextArea
              ref={textAreaRef}
              data-test="message-input-textarea"
              placeholder="Type your message"
              value={text}
              element="MESSAGE_INPUT"
              onChange={onChange}
              onFocus={onFocus}
              readOnly={isSending}
              onKeyPress={onKeyPress}
              maxLength={CHAR_LIMIT}
            />
          </Box>
          {emojiPickerConfig?.enabled && (
            <Box {...messageOptionContainerStyles}>
              <Button
                data-test="emoji-picker-button"
                variant="secondary_icon"
                size="icon_small"
                type="button"
                onClick={() => setIsEmojiPickerOpen(prev => !prev)}
              >
                <svg
                  role="img"
                  aria-hidden="false"
                  width="20px"
                  height="20px"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-labelledby="EmojiIcon"
                >
                  <title id="EmojiIcon">Select emoji</title>
                  <path
                    fill="currentColor"
                    d="M6.674 11.02a.5.5 0 00-.964.268c.653 2.35 3.241 3.766 5.577 3.117a.531.531 0 00.037-.012c1.403-.51 2.572-1.663 2.966-3.108a.5.5 0 00-.965-.263c-.297 1.089-1.197 2.008-2.324 2.425-1.813.492-3.828-.629-4.327-2.427zm.787-3.885a.788.788 0 100 1.577.788.788 0 000-1.577zm5.077 0a.788.788 0 000 1.577.789.789 0 100-1.577z"
                  />
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zm-7 8a7 7 0 1114 0 7 7 0 01-14 0z"
                  />
                </svg>
              </Button>
            </Box>
          )}
          <Box {...messageOptionContainerStyles}>
            {fileAttachmentConfig?.enabled && <AttachFileButton textAreaRef={textAreaRef} />}
          </Box>
          <Box {...messageOptionContainerStyles}>
            <Button
              data-test="message-send-button"
              variant="primary_icon"
              size="icon_small"
              type="submit"
              aria-disabled={isSubmitDisabled}
            >
              <SendIcon decorative={false} title="Send message" size="sizeIcon30" />
            </Button>
          </Box>
        </Box>
        {attachedFiles && (
          <Box data-test="message-attachments" {...filePreviewContainerStyles} ref={attachmentsBoxRef}>
            {attachedFiles.map((file, index) => (
              <FilePreview focusable={true} key={index} file={file} isBubble={false} disabled={isSending} />
            ))}
          </Box>
        )}
      </InputBox>
    </Box>
  );
};
