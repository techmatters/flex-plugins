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
import { Actions, Notifications, NotificationType, Template } from '@twilio/flex-ui';

import { hasTaskControl, isTransferring } from '../transfer/transferTaskState';
import { TransfersNotifications } from '../transfer/setUpTransferActions';

export const ConferenceNotifications = {
  UnholdParticipantsNotification: 'ConferenceNotifications_UnholdParticipantsNotification',
  ErrorAddingParticipantNotification: 'ConferenceNotifications_ErrorAddingParticipantNotification',
  ErrorUpdatingParticipantNotification: 'ConferenceNotifications_ErrorUpdatingParticipantNotification',
};

const setupConferenceNotifications = () => {
  Notifications.registerNotification({
    id: ConferenceNotifications.UnholdParticipantsNotification,
    type: NotificationType.error,
    content: (
      <Template code="Can't leave conference because some participants are on hold. Please unhold and try again." />
    ),
  });

  Notifications.registerNotification({
    id: ConferenceNotifications.ErrorAddingParticipantNotification,
    type: NotificationType.error,
    content: <Template code="Something went wrong trying to add participant to the call, please try again." />,
  });

  Notifications.registerNotification({
    id: ConferenceNotifications.ErrorUpdatingParticipantNotification,
    type: NotificationType.error,
    content: <Template code="Something went wrong trying to update the participant, please try again." />,
  });
};

export const setUpConferenceActions = () => {
  setupConferenceNotifications();
  Actions.addListener('beforeHangupCall', async (payload: { task: ITask }, abortFunction) => {
    const { conference } = payload.task;

    const someParticipantIsOnHold =
      conference.participants.filter(p => p.status === 'joined').length > 2 &&
      conference.participants.some(p => p.onHold && p.status === 'joined');

    if (isTransferring(payload.task)) {
      Notifications.showNotificationSingle(TransfersNotifications.CantHangTransferInProgressNotification);
      abortFunction();
    }

    if (someParticipantIsOnHold && hasTaskControl(payload.task)) {
      Notifications.showNotificationSingle(ConferenceNotifications.UnholdParticipantsNotification);
      abortFunction();
    }
  });
};
