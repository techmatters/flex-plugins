import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React, { useEffect, useState } from 'react';
import { Button, Manager, Template, withTheme } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';
import debounce from 'lodash/debounce';

import CannedResponses from './CannedResponses';
import useTraceUpdate from '../hooks/useTraceUpdate';

type Props = Partial<MessageInputChildrenProps>;

type Conversation = Awaited<ReturnType<Manager['conversationsClient']['getConversationBySid']>>;

const PADDING = 2;
const VERTICAL_PADDING = PADDING * 2;
const LINE_HEIGHT = 16;
const MIN_LINES = 2;
const MAX_LINES = 5;

const AseloMessageInput: React.FC<Props> = props => {
  const initialHeight = MIN_LINES * LINE_HEIGHT + VERTICAL_PADDING;
  const [height, setHeight] = useState(initialHeight);
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

  const handleChange = (e: React.ChangeEvent) => {
    debounce(triggerTyping, 500, {
      leading: true,
      trailing: true,
    });

    const { scrollHeight } = e.target;

    console.log({ height, scrollHeight });

    let nextHeight: number;

    if (height && scrollHeight && height !== scrollHeight) {
      if (scrollHeight > height) {
        const maxHeight = MAX_LINES * LINE_HEIGHT + VERTICAL_PADDING;
        nextHeight = Math.min(height + LINE_HEIGHT, maxHeight);
      } else {
        const minHeight = MIN_LINES * LINE_HEIGHT + VERTICAL_PADDING;
        nextHeight = Math.max(height - LINE_HEIGHT, minHeight);
      }

      setHeight(nextHeight);
    }
  };

  useTraceUpdate(props, 'AseloMessageInput');

  const heightInPixels = height ? `${height}px` : 'auto';

  return (
    <div key="textarea">
      <textarea
        id="messageInputArea"
        name="messageInputArea"
        ref={ref => {
          register(ref);
        }}
        onChange={handleChange}
        style={{ height: heightInPixels, lineHeight: `${LINE_HEIGHT}px`, padding: `${PADDING}px` }}
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
