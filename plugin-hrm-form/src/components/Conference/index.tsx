import React from 'react';
import { CallCanvasActions, ParticipantCanvas, TaskHelper } from '@twilio/flex-ui';

import ConferencePanel from './ConferencePanel';
import RemoveParticipant from './RemoveParticipant';

export const setupConference = () => {
  CallCanvasActions.Content.add(<ConferencePanel key="conference-panel" />, {
    sortOrder: 99,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  ParticipantCanvas.Actions.Content.add(<RemoveParticipant key="kick-participant" />, {
    sortOrder: 99,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
};
