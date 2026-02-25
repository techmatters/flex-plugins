/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Box } from '@twilio-paste/core/box';
import { FormEvent } from 'react';
import { Button } from '@twilio-paste/core/button';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '@twilio-paste/core/text';

import { submitAndInitChatThunk, updatePreEngagementDataField } from '../store/actions/genericActions';
import { AppState } from '../store/definitions';
import { Header } from './Header';
import { NotificationBar } from './NotificationBar';
import { fieldStyles, titleStyles, formStyles } from './styles/PreEngagementFormPhase.styles';
import LocalizedTemplate from '../localization/LocalizedTemplate';
import { generateForm } from './forms/formInputs';

export const PreEngagementFormPhase = () => {
  const { preEngagementData } = useSelector((state: AppState) => state.session ?? {});
  const { preEngagementFormDefinition } = useSelector((state: AppState) => state.config);
  const dispatch = useDispatch();

  const getItem = (inputName: string) => preEngagementData[inputName] ?? {};
  const setItemValue = (payload: { name: string; value: string | boolean }) => {
    dispatch(updatePreEngagementDataField(payload));
  };
  const handleChange = setItemValue;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await dispatch(submitAndInitChatThunk() as any);
  };

  if (!preEngagementFormDefinition) {
    return null;
  }

  const titleText = preEngagementFormDefinition.description ?? 'Hi there!';
  const submitText = preEngagementFormDefinition.submitLabel ?? 'Start chat';

  return (
    <>
      <Header />
      <NotificationBar />
      <Box as="form" data-test="pre-engagement-chat-form" onSubmit={handleSubmit} {...formStyles}>
        <Text {...titleStyles} as="h3">
          <LocalizedTemplate code={titleText} />
        </Text>
        <Box {...fieldStyles}>
          {generateForm({ form: preEngagementFormDefinition.fields, handleChange, getItem, setItemValue })}
        </Box>

        <Button variant="primary" type="submit" data-test="pre-engagement-start-chat-button">
          <LocalizedTemplate code={submitText} />
        </Button>
      </Box>
    </>
  );
};
