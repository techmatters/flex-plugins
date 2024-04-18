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
import { Supervisor, TaskCanvasHeader } from '@twilio/flex-ui';

import { getAseloConfigFlags } from '../../hrmConfig';
import ViewTaskNumber from './ViewTaskNumber';
import { getInitializedCan, PermissionActions } from '../../permissions';

/**
 * Adds a custom button for voice channel to show the phone number in emergency situations
 */
export const setUpViewMaskedVoiceNumber = () => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return;
  if (!getAseloConfigFlags().enableUnmaskingCalls) return;

  TaskCanvasHeader.Content.add(<ViewTaskNumber key="view-task-number" />, {
    sortOrder: 1,
    if: props => props.task.channelType === 'voice',
  });

  Supervisor.TaskCanvasHeader.Content.add(<ViewTaskNumber key="view-task-number" />, {
    sortOrder: 0,
    if: props => props.task.channelType === 'voice',
  });
};
