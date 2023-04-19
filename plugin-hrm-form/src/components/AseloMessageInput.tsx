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
