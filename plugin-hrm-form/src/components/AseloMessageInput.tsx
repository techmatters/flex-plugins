import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React, { useEffect, useState } from 'react';
import { Actions, Button, Manager, Template, withTheme } from '@twilio/flex-ui';

import { getTemplateStrings } from '../hrmConfig';
import EmojiPicker from './emojiPicker';
import CannedResponses from './CannedResponses';
import { Flex } from '../styles/HrmStyles';

type Props = Partial<MessageInputChildrenProps>;

const AseloMessageInput: React.FC<Props> = props => {
  const { conversationSid } = props;
  const manager = Manager.getInstance();

  const [message, setMessage] = useState('');

  const handleMessageChange = event => {
    // 👇️ access textarea value
    setMessage(event.target.value);
  };
  return (
    <div key="textarea">
      <textarea onChange={handleMessageChange} value={message} id="messageInputArea" />
      <Button
        onClick={() => {
          manager.conversationsClient
            .getConversationBySid(conversationSid)
            .then(conversation => conversation.sendMessage(message));
          setMessage('');
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
