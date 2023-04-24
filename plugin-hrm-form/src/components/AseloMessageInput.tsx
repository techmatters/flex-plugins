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

import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React, { Dispatch, useEffect, useState } from 'react';
import { Button, Template, withTheme } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';

import CannedResponses from './CannedResponses';
import { conversationsBase, namespace, RootState } from '../states';
import {
  MessageSendStatus,
  newSendMessageeAsyncAction,
  newUpdateDraftMessageTextAction,
} from '../states/conversations';
import asyncDispatch from '../states/asyncDispatch';

/**
 * The following CSS attributtes should be set in here
 * so the dynamic resizing will work properly:
 * - padding (vertical: top or bottom)
 * - border-width
 * - line-height
 */
const PADDING_VERTICAL = 8;
const BORDER_WIDTH = 1;
const LINE_HEIGHT = 20;
const MIN_LINES = 1;
const MAX_LINES = 5;
const MIN_HEIGHT = MIN_LINES * LINE_HEIGHT + PADDING_VERTICAL * 2 + BORDER_WIDTH * 2;
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT + PADDING_VERTICAL * 2 + BORDER_WIDTH * 2;

type MessageProps = Partial<MessageInputChildrenProps>;

const mapDispatchToProps = (
  dispatch: Dispatch<{ type: string } & Record<string, any>>,
  { conversationSid, conversation: { source: conversation } }: MessageProps,
) => ({
  updateDraftMessageText: (text: string) => dispatch(newUpdateDraftMessageTextAction(conversationSid, text)),
  sendMessage: (text: string) => asyncDispatch(dispatch)(newSendMessageeAsyncAction(conversation, text)),
});

const mapStateToProps = (state: RootState, { conversationSid }: MessageProps) => {
  const convoState = state[namespace][conversationsBase][conversationSid];
  return {
    draftText: convoState?.draftMessageText ?? '',
    sendStatus: convoState?.messageSendStatus ?? '',
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & MessageProps;

const AseloMessageInput: React.FC<Props> = ({
  conversationSid,
  conversation: { source: conversation },
  updateDraftMessageText,
  draftText,
  sendMessage,
  sendStatus,
}) => {
  const initialHeight = MIN_LINES * LINE_HEIGHT + PADDING_VERTICAL * 2 + BORDER_WIDTH * 2;
  const [height, setHeight] = useState<number>(initialHeight);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number>();

  const { register, handleSubmit, setValue, getValues } = useForm();

  useEffect(() => {
    setValue('messageInputArea', draftText);
    return () => {
      updateDraftMessageText(getValues('messageInputArea'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationSid]);

  useEffect(() => {
    setValue('messageInputArea', draftText);
    setIsDisabled(sendStatus === MessageSendStatus.SENDING || !draftText);
  }, [draftText, sendStatus, setValue]);

  /**
   * This function gets the "pure" height of the text inside the textarea.
   *
   * Ideally, textarea.scrollHeight would give us the height we need, but
   * there are some edge cases that changes the value of textarea.scrollHeight.
   * Example of edge cases:
   *  - The scrollbar beign visible or not;
   *  - Or if textarea min height would acommodate more than 1 line;
   *
   * In summary, this function overcome this issue with the following steps:
   * - It changes textarea's height to 1
   * - Handles scrollbar visibility
   *    - If there's more than MAX_LINES of height, let the scrollbar visibible
   *    - Else, it hides the scrollbar, because the scrollbar would change the
   *    width space available, that can impact in the number of lines needed to
   *    fit the whole text.
   * - After this, gets textarea.scrollHeight. Now we get the correct value
   * - Revert all changes to the textarea element
   */
  const getPureScrollHeight = (textarea: HTMLTextAreaElement) => {
    const isNotDisplayingScrollbar = textarea.scrollHeight === textarea.clientHeight;

    const prevHeight = textarea.style.height;
    const prevOverflow = textarea.style.overflow;
    textarea.style.height = '1px';

    if (isNotDisplayingScrollbar) {
      textarea.style.overflow = 'hidden';
    }

    const { scrollHeight } = textarea;
    textarea.style.height = prevHeight;

    if (isNotDisplayingScrollbar) {
      textarea.style.overflow = prevOverflow;
    }

    return scrollHeight;
  };

  const handleDynamicSize = (textarea: HTMLTextAreaElement) => {
    const currentScrollHeight = getPureScrollHeight(textarea);
    const shouldExpand = currentScrollHeight > prevScrollHeight && height < MAX_HEIGHT;
    const shouldShrink = !shouldExpand && currentScrollHeight < prevScrollHeight && height > MIN_HEIGHT;

    /*
     * why the candidateHeight is not just currentScrollHeight?
     *
     * Because we're setting the textarea's "height" attribute, and we
     * need to account for the space taken by the border as well.
     * Also, we don't need to add padding here because we're setting
     * "box-sizing: border-box;" that handle that for us.
     */
    const candidateHeight = currentScrollHeight + BORDER_WIDTH * 2;

    if (shouldExpand) {
      const nextHeight = Math.min(candidateHeight, MAX_HEIGHT);
      setHeight(nextHeight);
    } else if (shouldShrink) {
      const nextHeight = Math.min(Math.max(candidateHeight, MIN_HEIGHT), MAX_HEIGHT);
      setHeight(nextHeight);
    }

    setPrevScrollHeight(currentScrollHeight);
  };

  const [isDisabled, setIsDisabled] = useState(sendStatus === MessageSendStatus.SENDING || !draftText);

  const triggerTyping = debounce(
    () => {
      if (conversation) {
        conversation.typing();
      }
    },
    500,
    {
      leading: true,
      trailing: true,
    },
  );

  const updateSendButtonState = debounce(() => {
    setIsDisabled(sendStatus === MessageSendStatus.SENDING || !getValues('messageInputArea'));
  }, 200);

  const submitMessageForSending = handleSubmit(async () => {
    const message = getValues('messageInputArea');
    /*
     * Deliberately does not use the isDisabled state for this check, because that is set on a debounce.
     * This way the user can hit 'Enter' straight after they finish typing and it will always send.
     */
    if (conversation && message.length && sendStatus !== MessageSendStatus.SENDING) {
      await sendMessage(message);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleDynamicSize(e.target);
    triggerTyping();
    updateSendButtonState();
  };

  const handleEnterInMessageInput = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      submitMessageForSending();
    }
  };

  const overflow = height < MAX_HEIGHT ? 'hidden' : '';

  return (
    <div key="textarea">
      <textarea
        id="messageInputArea"
        name="messageInputArea"
        ref={ref => {
          register(ref);
        }}
        onChange={handleChange}
        onKeyDown={handleEnterInMessageInput}
        style={{
          display: 'block',
          boxSizing: 'border-box',
          width: '100%',
          overflow,
          height: `${height}px`,
          lineHeight: `${LINE_HEIGHT}px`,
          padding: `${PADDING_VERTICAL}px 12px`,
          fontFamily: '"Open Sans"',
          fontSize: '13px',
          marginBottom: '10px',
          borderColor: '#CACDD8',
          borderRadius: '4px',
        }}
      />
      <Button onClick={submitMessageForSending} disabled={isDisabled}>
        <Template code="Send" />
      </Button>
      <CannedResponses key="canned-responses" conversationSid={conversationSid} />
    </div>
  );
};
AseloMessageInput.displayName = 'AseloMessageInput';

export default withTheme(connector(AseloMessageInput));
