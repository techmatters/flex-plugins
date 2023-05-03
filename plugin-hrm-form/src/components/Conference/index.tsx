import React from 'react';
import { CallCanvasActions, ParticipantCanvas } from '@twilio/flex-ui';

import ConferencePanel from './ConferencePanel';
import KickParticipant from './KickParticipant';

export const setupConference = () => {
  CallCanvasActions.Content.add(<ConferencePanel key="conference-panel" />, { sortOrder: 99 });
  ParticipantCanvas.Content.add(<KickParticipant key="kick-participant" />, { sortOrder: 99 });
};
