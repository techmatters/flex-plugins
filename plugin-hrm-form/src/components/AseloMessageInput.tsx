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
import { Button, Template, withTheme, styled } from '@twilio/flex-ui';
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
import { getTemplateStrings } from '../hrmConfig';

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

  const handleChange = () => {
    triggerTyping();
    updateSendButtonState();
  };

  const handleEnterInMessageInput = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      submitMessageForSending();
    }
  };

  const textAreaPlaceholder = getTemplateStrings()['Type message'] || 'Type message';

  return (
    <AseloMessageInputContainer key="textarea">
      <TextAreaContainer>
        <TextAreaContainerInner>
          <TextArea
            id="messageInputArea"
            name="messageInputArea"
            ref={ref => {
              register(ref);
            }}
            onChange={handleChange}
            onKeyDown={handleEnterInMessageInput}
            rows={1}
            placeholder={textAreaPlaceholder}
          />
        </TextAreaContainerInner>
      </TextAreaContainer>
      <MessageInputActions>
        <MessageInputActionsInner>
          {
            // Emoji picker goes in here
            ':)'
          }
        </MessageInputActionsInner>
        <ButtonContainer>
          <SendMessageButton size="small" onClick={submitMessageForSending} disabled={isDisabled}>
            <Template code="Send" />
          </SendMessageButton>
        </ButtonContainer>
      </MessageInputActions>
      <CannedResponses key="canned-responses" conversationSid={conversationSid} />
    </AseloMessageInputContainer>
  );
};
AseloMessageInput.displayName = 'AseloMessageInput';

export default withTheme(connector(AseloMessageInput));

const FlexRowNoWrap = styled('div')`
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
`;

const AseloMessageInputContainer = styled(FlexRowNoWrap)`
  flex-direction: column;
  overflow-x: visible;
`;

const TextAreaContainer = styled(FlexRowNoWrap)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: flex-end;
  background: rgb(255, 255, 255);
  border: 1.2px solid rgba(202, 205, 216, 1);
  border-radius: 4px;
`;

const TextAreaContainerInner = styled('div')`
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border-radius: 4px;

  &:focus-within {
    border: 1px solid rgba(2, 99, 224, 0.7);
    box-shadow: 0px 0px 0px 3px rgba(2, 99, 224, 0.7);
  }
`;

const TextArea = styled('textarea')`
  min-height: 2.25rem;
  max-height: 120px;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0.5rem 12px;
  display: block;
  border: 0px;
  font-family: 'Inter var experimental', 'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  width: 100%;
  resize: none;
  outline: none;
  box-sizing: border-box;
  overflow: hidden auto;
  background: transparent;
  color: rgb(18, 28, 45);
  border-radius: 4px;
`;

const MessageInputActions = styled(FlexRowNoWrap)`
  overflow: visible;
  margin-bottom: 16px;
`;

const MessageInputActionsInner = styled(MessageInputActions)`
  width: auto;
  margin-bottom: 0;
`;

const ButtonContainer = styled(MessageInputActions)`
  -webkit-box-flex: 0;
  flex-grow: 0;
  margin-bottom: 0;
`;

const SendMessageButton = styled(Button)`
  background: rgba(216, 27, 96, 0.8);
  color: #f6f6f6;
  padding: 4px 8px;
`;
