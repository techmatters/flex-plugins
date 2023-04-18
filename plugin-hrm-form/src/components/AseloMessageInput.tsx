import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React, { useEffect, useState } from 'react';
import { Button, Manager, Template, withTheme } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';
import debounce from 'lodash/debounce';

import CannedResponses from './CannedResponses';
import useTraceUpdate from '../hooks/useTraceUpdate';

type Props = Partial<MessageInputChildrenProps>;

type Conversation = Awaited<ReturnType<Manager['conversationsClient']['getConversationBySid']>>;

const AseloMessageInput: React.FC<Props> = props => {
  const [conversation, setConversation] = useState<Conversation>();
  const { register, handleSubmit, setValue, getValues } = useForm();
  const { conversationSid } = props;

  useEffect(() => {
    const fetchConversation = async () => {
      const conversation = await Manager.getInstance().conversationsClient.getConversationBySid(conversationSid);
      setConversation(conversation);
    };

    fetchConversation();
  }, [conversationSid]);

  const triggerTyping = () => {
    if (conversation) {
      conversation.typing();
    }
  };

  const handleChange = debounce(triggerTyping, 500, {
    leading: true,
    trailing: true,
  });

  useTraceUpdate(props, 'AseloMessageInput');

  return (
    <div key="textarea">
      <textarea
        id="messageInputArea"
        name="messageInputArea"
        ref={ref => {
          register(ref);
        }}
        onChange={handleChange}
      />
      <Button
        onClick={handleSubmit(async () => {
          const message = getValues('messageInputArea');

          if (conversation) {
            conversation.sendMessage(message).then(() => setValue('messageInputArea', ''));
          }
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
