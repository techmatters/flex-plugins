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

import * as Flex from '@twilio/flex-ui';
import React from 'react';
import { useSelector } from 'react-redux';

import { PrimaryButton } from '../styles/buttons';
import { Flex as FlexBox } from '../styles';
import { RecordingSection } from '../components/contact/MediaSection';
import { RootState } from '../states';
import selectContactByTaskSid from '../states/contacts/selectContactByTaskSid';
import { isS3StoredRecording } from '../types/types';

type Props = {} & Flex.TaskContextProps;

const VoicemailTaskPanel: React.FC<Props> = ({ task }) => {
  const contact = useSelector((state: RootState) => selectContactByTaskSid(state, task.taskSid));

  if (!task || !contact?.savedContact) {
    return null;
  }

  const onClickCallBack = () => {
    Flex.Actions.invokeAction('StartOutboundCall', {
      destination: task.attributes.from,
      // taskAttributes: { ... custom attributes }
    });
  };

  const onClickRetryLater = () => {
    window.alert('Not implemented :P');
  };

  const externalStoredRecording = contact.savedContact.conversationMedia?.find(isS3StoredRecording);
  return (
    <div key="voicemail-actions">
      <FlexBox justifyContent="center" flexDirection="row" paddingTop="20px">
        <RecordingSection
          contactId={contact.savedContact.id}
          externalStoredRecording={externalStoredRecording}
          autoLoad
        />
      </FlexBox>
      <PrimaryButton onClick={onClickCallBack}>
        <Flex.Template code="VoicemailTaskPanel-CallBack" />
      </PrimaryButton>
      <PrimaryButton onClick={onClickRetryLater}>
        <Flex.Template code="VoicemailTaskPanel-RetryLater" />
      </PrimaryButton>
    </div>
  );
};

export default Flex.withTaskContext(VoicemailTaskPanel);
