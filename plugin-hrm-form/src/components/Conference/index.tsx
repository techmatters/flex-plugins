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
