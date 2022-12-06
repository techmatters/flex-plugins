/* eslint-disable react/prop-types */
import React from 'react';
import { useSelector } from 'react-redux';
import { Actions, withTheme } from '@twilio/flex-ui';
import { MessageInputChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageInput/MessageInputImpl';

import { getConfig } from '../HrmFormPlugin';
import { selectCannedResponses } from '../states/selectors/hrmStateSelectors';
import { CannedResponsesContainer, FormSelect, FormSelectWrapper, FormOption } from '../styles/HrmStyles';

type Props = Partial<MessageInputChildrenProps>;

const CannedResponses: React.FC<Props> = props => {
  const cannedResponses = useSelector(selectCannedResponses);
  const { strings } = getConfig();
  const { conversationSid } = props;
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
    Actions.invokeAction('SetInputText', {
      conversationSid,
      body: event.target.value,
    });
  };

  if (!cannedResponses) return null;

  return (
    <CannedResponsesContainer>
      <FormSelectWrapper fullWidth={true}>
        <FormSelect id="canned_response" name="canned_response" onChange={handleChange} value="" fullWidth={true}>
          <FormOption disabled selected isEmptyValue={true} value="">
            {strings.CannedResponses}
          </FormOption>
          {cannedResponses.map(r => {
            return (
              <FormOption key={r.label} value={r.text} isEmptyValue={r.text === ''}>
                {r.label}
              </FormOption>
            );
          })}
        </FormSelect>
      </FormSelectWrapper>
    </CannedResponsesContainer>
  );
};
CannedResponses.displayName = 'CannedResponses';

export default withTheme(CannedResponses);
