import React from 'react';
import { CallCanvasActions, ParticipantCanvas } from '@twilio/flex-ui';

import ConferencePanel from './ConferencePanel';
import RemoveParticipant from './RemoveParticipant';

export const setupConference = () => {
  CallCanvasActions.Content.add(<ConferencePanel key="conference-panel" />, { sortOrder: 99 });
  ParticipantCanvas.Content.add(<RemoveParticipant key="kick-participant" />, { sortOrder: 99 });
};
