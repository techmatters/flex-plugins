import React from 'react';
import { Actions, ITask, NotificationType, Notifications, Template } from '@twilio/flex-ui';

export const ConferenceNotifications = {
  UnholdParticipantsNotification: 'ConferenceNotifications_UnholdParticipantsNotification',
  ErrorAddingParticipantNotification: 'ConferenceNotifications_ErrorAddingParticipantNotification',
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
};

export const setUpConferenceActions = () => {
  setupConferenceNotifications();
  Actions.addListener('beforeHangupCall', async (payload: { task: ITask }, abortFunction) => {
    const { conference } = payload.task;

    if (conference.participants.length > 2 && conference.participants.some(p => p.onHold)) {
      Notifications.showNotification(ConferenceNotifications.UnholdParticipantsNotification);
      abortFunction();
    }
  });
};
