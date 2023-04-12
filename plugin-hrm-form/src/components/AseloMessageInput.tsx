import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React, { useRef } from 'react';
import { Button, Manager, Template, withTheme } from '@twilio/flex-ui';

import CannedResponses from './CannedResponses';
import useTraceUpdate from '../hooks/useTraceUpdate';

type Props = Partial<MessageInputChildrenProps>;

const AseloMessageInput: React.FC<Props> = props => {
  useTraceUpdate(props, 'AseloMessageInput');
  const { conversationSid } = props;
  const manager = Manager.getInstance();
  const textAreaRef = useRef<HTMLTextAreaElement>();

  return (
    <div key="textarea">
      <textarea style={{ height: 30, width: 'auto' }} id="messageInputArea" ref={textAreaRef} />
      <Button
        onClick={() => {
          manager.conversationsClient
            .getConversationBySid(conversationSid)
            .then(conversation => conversation.sendMessage(textAreaRef.current.value))
            .then(() => (textAreaRef.current.value = ''));
        }}
      >
        <Template code="Send" />
      </Button>
      <CannedResponses key="canned-responses" conversationSid={conversationSid} />
    </div>
  );
};
AseloMessageInput.displayName = 'AseloMessageInput';

export default withTheme(AseloMessageInput);
