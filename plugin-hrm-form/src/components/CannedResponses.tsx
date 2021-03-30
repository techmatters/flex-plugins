/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Actions, Template, withTheme } from '@twilio/flex-ui';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

import { CannedResponsesContainer } from '../styles/HrmStyles';
import { RootState, namespace, configurationBase } from '../states';

type OwnProps = {
  channelSid: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// eslint-disable-next-line react/display-name
const CannedResponses: React.FC<Props> = props => {
  const { channelSid, cannedResponses } = props;

  const handleChange = event => {
    Actions.invokeAction('SetInputText', {
      channelSid,
      body: event.target.value,
    });
  };

  if (!cannedResponses) return null;

  return (
    <CannedResponsesContainer>
      <FormControl className="form">
        <InputLabel className="input-label" htmlFor="canned_response">
          <Template code="CannedResponses" />
        </InputLabel>
        <Select value="" onChange={handleChange} name="canned_response">
          {cannedResponses.map(r => {
            return (
              <MenuItem key={r.label} value={r.text}>
                {r.label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
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
