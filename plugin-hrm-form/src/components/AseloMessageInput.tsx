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
const BORDER_WIDTH = 1;
const LINE_HEIGHT = 16;
const MIN_LINES = 1;
const MAX_LINES = 5;
const MIN_HEIGHT = MIN_LINES * LINE_HEIGHT + PADDING * 2 + BORDER_WIDTH * 2;
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT + PADDING * 2 + BORDER_WIDTH * 2;

const AseloMessageInput: React.FC<Props> = props => {
  const initialHeight = MIN_LINES * LINE_HEIGHT + PADDING * 2 + BORDER_WIDTH * 2;
  const [height, setHeight] = useState<number>(initialHeight);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number>();
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleDynamicSize(e.target);
    debounce(triggerTyping, 500, {
      leading: true,
      trailing: true,
    });
  };

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
        style={{
          height: `${height}px`,
          lineHeight: `${LINE_HEIGHT}px`,
          padding: `${PADDING}px`,
          boxSizing: 'border-box',
        }}
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
