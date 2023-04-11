import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React from 'react';
import { Button, Manager, Template, withTheme } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';

import CannedResponses from './CannedResponses';
import useTraceUpdate from '../hooks/useTraceUpdate';

type Props = Partial<MessageInputChildrenProps>;

const AseloMessageInput: React.FC<Props> = props => {
  const { register, handleSubmit, setValue, getValues } = useForm();

  useTraceUpdate(props, 'AseloMessageInput');
  const { conversationSid } = props;

  return (
    <div key="textarea">
      <textarea
        id="messageInputArea"
        name="messageInputArea"
        ref={ref => {
          register(ref);
        }}
      />
      <Button
        onClick={handleSubmit(async () => {
          const message = getValues('messageInputArea');

          return Manager.getInstance()
            .conversationsClient.getConversationBySid(conversationSid)
            .then(conversation => conversation.sendMessage(message))
            .then(() => setValue('messageInputArea', ''));
        })}
      >
        <Template code="Send" />
      </Button>
      <CannedResponses key="canned-responses" conversationSid={conversationSid} />
    </div>
  );
};
AseloMessageInput.displayName = 'AseloMessageInput';

export default withTheme(AseloMessageInput);
