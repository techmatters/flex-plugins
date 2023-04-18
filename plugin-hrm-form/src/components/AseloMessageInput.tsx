import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';
import React, { Dispatch, useEffect } from 'react';
import { Button, Template, withTheme } from '@twilio/flex-ui';
import { useForm } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';

import CannedResponses from './CannedResponses';
import { conversationsBase, namespace, RootState } from '../states';
import { newUpdateDraftMessageTextAction } from '../states/conversations';

type MessageProps = Partial<MessageInputChildrenProps>;

const mapDispatchToProps = (
  dispatch: Dispatch<{ type: string } & Record<string, any>>,
  { conversationSid }: MessageProps,
) => ({
  updateDraftMessageText: (text: string) => dispatch(newUpdateDraftMessageTextAction(conversationSid, text)),
});

const mapStateToProps = (state: RootState, { conversationSid }: MessageProps) => ({
  draftText: state[namespace][conversationsBase][conversationSid]?.draftMessageText ?? '',
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & MessageProps;

const AseloMessageInput: React.FC<Props> = ({
  conversationSid,
  conversation: { source: conversation },
  updateDraftMessageText,
  draftText,
}) => {
  const { register, handleSubmit, setValue, getValues } = useForm();

  useEffect(() => {
    setValue('messageInputArea', draftText);
    return () => {
      updateDraftMessageText(getValues('messageInputArea'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            conversation.sendMessage(message).then(() => {
              setValue('messageInputArea', '');
              updateDraftMessageText('');
            });
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

export default withTheme(connector(AseloMessageInput));
