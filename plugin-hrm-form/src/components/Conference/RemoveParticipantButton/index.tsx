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

import React from 'react';
import { IconButton, Notifications, TaskHelper } from '@twilio/flex-ui';
import type { ParticipantCanvasChildrenProps } from '@twilio/flex-ui/src/components/canvas/ParticipantCanvas/ParticipantCanvas.definitions';

import { ConferenceNotifications } from '../../../conference/setUpConferenceActions';
import * as conferenceApi from '../../../services/conferenceService';

type Props = Partial<ParticipantCanvasChildrenProps>;

const RemoveParticipantButton: React.FC<Props> = ({ participant, task, ...props }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  if (!participant?.callSid || !task?.conference?.conferenceSid) {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await conferenceApi.removeParticipant({
        callSid: participant.callSid,
        conferenceSid: task.conference.conferenceSid,
      });
    } catch (err) {
      Notifications.showNotificationSingle(ConferenceNotifications.ErrorUpdatingParticipantNotification);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IconButton
      icon="Hangup"
      onClick={handleClick}
      variant="destructive"
      disabled={isLoading || !TaskHelper.canHold(task) || participant.status !== 'joined'}
    />
  );
};

export default RemoveParticipantButton;
