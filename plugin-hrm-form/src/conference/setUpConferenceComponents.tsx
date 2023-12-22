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
import { CallCanvas, CallCanvasActions, ParticipantCanvas, TaskHelper } from '@twilio/flex-ui';
import { ParticipantCanvasChildrenProps } from '@twilio/flex-ui/src/components/canvas/ParticipantCanvas/ParticipantCanvas.definitions';

import ConferencePanel from '../components/Conference/ConferenceActions/ConferencePanel';
import ToggleMute from '../components/Conference/ConferenceActions/ToggleMute';
import ToogleDialpad from '../components/Conference/ConferenceActions/ToogleDialpad';
import Hangup from '../components/Conference/ConferenceActions/Hangup';
import HoldParticipantButton from '../components/Conference/HoldParticipantButton';
import RemoveParticipantButton from '../components/Conference/RemoveParticipantButton';
import ConferenceMonitor from '../components/Conference/ConferenceMonitor';
import ParticipantLabel from '../components/Conference/ParticipantLabel';
import { getTemplateStrings } from '../hrmConfig';

export const setupConferenceComponents = () => {
  const strings = getTemplateStrings();
  strings.HangupCallTooltip = strings.HangupCallLeaveTooltip;

  CallCanvas.Content.add(<ConferenceMonitor key="conference-monitor" />);
  CallCanvasActions.Content.remove('toggleMute', {
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  CallCanvasActions.Content.remove('dialpad', {
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  CallCanvasActions.Content.remove('hangup', {
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  CallCanvasActions.Content.add(<ConferencePanel key="conference-panel" />, {
    sortOrder: -1,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  CallCanvasActions.Content.add(<ToggleMute key="conference-toggle" />, {
    sortOrder: 1,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  CallCanvasActions.Content.add(<ToogleDialpad key="open-dialpad" />, {
    sortOrder: 1,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  CallCanvasActions.Content.add(<Hangup key="conference-hangup" />, {
    sortOrder: 3,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });

  ParticipantCanvas.Actions.Content.remove('hold', {
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  ParticipantCanvas.Actions.Content.add(<HoldParticipantButton key="hold-participant" />, {
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  ParticipantCanvas.Actions.Content.add(<RemoveParticipantButton key="remove-participant" />, {
    sortOrder: 99,
    if: props => TaskHelper.isCallTask(props.task) && TaskHelper.isLiveCall(props.task),
  });
  ParticipantCanvas.Actions.Content.remove('cancel-transfer', {
    if: props =>
      TaskHelper.isCallTask(props.task) &&
      TaskHelper.isLiveCall(props.task) &&
      props.participant?.connecting &&
      props.participant?.participantType === 'external',
  });
  ParticipantCanvas.Content.remove('name', {
    if: (props: ParticipantCanvasChildrenProps) =>
      props.participant?.participantType === 'external' || props.participant?.participantType === 'unknown',
  });
  // @ts-ignore
  ParticipantCanvas.Content.add(<ParticipantLabel key="participant-name" />, {
    if: (props: ParticipantCanvasChildrenProps) =>
      props.participant?.participantType === 'external' || props.participant?.participantType === 'unknown',
    sortOrder: 2,
  });
};
