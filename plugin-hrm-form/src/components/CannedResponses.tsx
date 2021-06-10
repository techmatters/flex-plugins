/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Actions, withTheme } from '@twilio/flex-ui';

import { getConfig } from '../HrmFormPlugin';
import {} from '@material-ui/core';

import { CannedResponsesContainer, FormSelect, FormSelectWrapper, FormOption } from '../styles/HrmStyles';
import { RootState, namespace, configurationBase } from '../states';

type OwnProps = {
  channelSid: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// eslint-disable-next-line react/display-name
const CannedResponses: React.FC<Props> = props => {
  const { channelSid, cannedResponses } = props;
  const { strings } = getConfig();
  const handleChange = event => {
    Actions.invokeAction('SetInputText', {
      channelSid,
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

const mapStateToProps = (state: RootState) => {
  return {
    state,
    cannedResponses: state[namespace][configurationBase].currentDefinitionVersion?.cannedResponses,
  };
};

const connector = connect(mapStateToProps);
export default connector(withTheme(CannedResponses));
