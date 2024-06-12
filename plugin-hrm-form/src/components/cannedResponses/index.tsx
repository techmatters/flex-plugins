/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import { Actions, withTheme } from '@twilio/flex-ui';

import { selectCannedResponses } from '../../states/selectors/hrmStateSelectors';
import { FormSelect, FormSelectWrapper, FormOption } from '../../styles';
import { CannedResponsesContainer } from './styles';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';
import { newUpdateDraftMessageTextAction } from '../../states/conversations';

type MessageProps = { conversationSid?: string };

const mapDispatchToProps = (
  dispatch: Dispatch<{ type: string } & Record<string, any>>,
  { conversationSid }: MessageProps,
) => {
  return {
    updateDraftMessageText: (text: string) => {
      dispatch(newUpdateDraftMessageTextAction(conversationSid, text));
    },
  };
};

const connector = connect(null, mapDispatchToProps);

type Props = MessageProps & ConnectedProps<typeof connector>;

const CannedResponses: React.FC<Props> = ({ conversationSid, updateDraftMessageText }) => {
  const cannedResponses = useSelector(selectCannedResponses);
  const strings = getTemplateStrings();
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = event => {
    if (getAseloFeatureFlags().enable_aselo_messaging_ui) {
      updateDraftMessageText(event.target.value);
    } else {
      Actions.invokeAction('SetInputText', {
        conversationSid,
        body: event.target.value,
      });
    }
  };

  if (!cannedResponses) return null;

  return (
    <CannedResponsesContainer>
      <FormSelectWrapper fullWidth={true}>
        <FormSelect id="canned_response" name="canned_response" onChange={handleChange} value="" fullWidth={true}>
          <FormOption disabled isEmptyValue={true} value="">
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

export default withTheme(connector(CannedResponses));
