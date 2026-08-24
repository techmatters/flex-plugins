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
import { format, parseISO } from 'date-fns';

import { PrimaryButton, SecondaryButton } from '../styles/buttons';
import { Flex as FlexBox } from '../styles';
import { RecordingSection } from '../components/contact/MediaSection';
import { RootState } from '../states';
import selectContactByTaskSid from '../states/contacts/selectContactByTaskSid';
import { isS3StoredRecording } from '../types/types';
import { PanelContainer, Section, SectionHeader } from '../styles/twilioTaskPanel';
import VoicemailIcon from '../components/common/icons/VoicemailIcon';
import CallIcon from '../components/common/icons/CallIcon';
import HrmTheme from '../styles/HrmTheme';
import { createVoicemailSchedule } from '../services/scheduledJobsService';
import { VoicemailActionsNotifications } from './setUpVoicemailComponents';

type Props = {} & Flex.TaskContextProps;

// {Short localized date}, {Short localized time} {short timezone}
const DATE_DISPLAY_FORMAT = 'Pp O';

const VoicemailTaskPanel: React.FC<Props> = ({ task }) => {
  const contact = useSelector((state: RootState) => selectContactByTaskSid(state, task.taskSid));

  if (!task || !contact?.savedContact) {
    return null;
  }

  const { receivedTime, from, maxCallbackAttempts } = task.attributes;
  const callbackAttempts = task.attributes.callbackAttempts ?? [];

  const onClickCallBack = async () => {
    try {
      await task.setAttributes({
        ...task.attributes,
        callbackAttempts: Array.from(new Map(callbackAttempts).set(task.sid, new Date().toISOString())),
      });
      await Flex.Actions.invokeAction('StartOutboundCall', {
        destination: task.attributes.from,
      });
    } catch (err) {
      console.error(err);
      Flex.Notifications.showNotification(VoicemailActionsNotifications.ActionErrorNotification);
    }
  };

  const onClickRetryLater = async () => {
    try {
      await createVoicemailSchedule({ voicemailTask: task });
      await Flex.Actions.invokeAction('CompleteTask', { task });
    } catch (err) {
      console.error(err);
      Flex.Notifications.showNotification(VoicemailActionsNotifications.ActionErrorNotification);
    }
  };

  const receivedDate = receivedTime
    ? format(parseISO(receivedTime), DATE_DISPLAY_FORMAT)
    : 'TaskPanel-ActiveVoicemail-ReceivedTimePlaceholder';

  const externalStoredRecording = contact.savedContact.conversationMedia?.find(isS3StoredRecording);
  return (
    <PanelContainer key="voicemail-actions">
      <FlexBox justifyContent="center" flexDirection="column" paddingTop="20px">
        <Section>
          <SectionHeader>
            <Flex.Template code="TaskPanel-ActiveVoicemail-RecordingLabel" />
          </SectionHeader>
          <div>
            <RecordingSection
              contactId={contact.savedContact.id}
              externalStoredRecording={externalStoredRecording}
              autoLoad
            />
          </div>
        </Section>
        <Section>
          <SectionHeader>
            <Flex.Template code="TaskPanel-ActiveVoicemail-CallerPhoneNumberLabel" />
          </SectionHeader>
          <p>{from}</p>
        </Section>
        <Section>
          <SectionHeader>
            <Flex.Template code="TaskPanel-ActiveVoicemail-ReceivedTimeLabel" />
          </SectionHeader>
          <p>
            <Flex.Template code={receivedDate} />
          </p>
        </Section>
        {callbackAttempts.length < maxCallbackAttempts && !Flex.TaskHelper.isInWrapupMode(task) && (
          <>
            <Section>
              <PrimaryButton fullWidth={true} onClick={onClickCallBack}>
                <CallIcon width="16px" height="16px" color={HrmTheme.buttonColors.primary.textColor} />
                <span style={{ width: '10px' }} />
                <Flex.Template code="TaskPanel-ActiveVoicemail-CallBack" phoneNumber={from} />
              </PrimaryButton>
            </Section>
            <Section>
              <SecondaryButton fullWidth={true} onClick={onClickRetryLater}>
                <VoicemailIcon width="16px" height="16px" color={HrmTheme.buttonColors.secondary.textColor} />
                <span style={{ width: '10px' }} />
                <Flex.Template code="TaskPanel-ActiveVoicemail-RetryLater" />
              </SecondaryButton>
            </Section>
          </>
        )}
        <Section>
          <SectionHeader>
            <Flex.Template code="TaskPanel-ActiveVoicemail-CallbackAttemptListLabel" />
          </SectionHeader>
          {callbackAttempts.length ? (
            callbackAttempts.map((attempt, idx) => (
              <p key={`attempt-${idx}`}>
                <Flex.Template
                  code="TaskPanel-ActiveVoicemail-CallbackAttemptListItem"
                  attemptTime={format(parseISO(attempt[1]), DATE_DISPLAY_FORMAT)}
                  attemptNo={idx + 1}
                  maxAttempts={maxCallbackAttempts}
                />
              </p>
            ))
          ) : (
            <p>
              <Flex.Template code="TaskPanel-ActiveVoicemail-CallbackAttemptListPlaceholder" />
            </p>
          )}
        </Section>
      </FlexBox>
    </PanelContainer>
  );
};

export default Flex.withTaskContext(VoicemailTaskPanel);
