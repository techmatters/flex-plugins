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
