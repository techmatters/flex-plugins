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

import { getAseloFeatureFlags, getTemplateStrings } from '../hrmConfig';
import { getInitializedCan, PermissionActions } from '../permissions';

const TRUNCATED_IDENTIFIER_LENGTH = 4;
const MAX_QUEUE_LENGTH = 13;
const TRUNCATED_QUEUE_LENGTH = 10;

// This function customises the TaskCard meant for Call channel
export const setCallTaskCardString = channel => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  channel.templates.TaskCard.firstLine = task => {
    const truncatedIdentifier = task.defaultFrom.slice(-TRUNCATED_IDENTIFIER_LENGTH);

    const queueName =
      task.queueName.length > MAX_QUEUE_LENGTH
        ? `${task.queueName.substring(0, TRUNCATED_QUEUE_LENGTH)}…`
        : task.queueName;

    return maskIdentifiers ? task.queueName : `${queueName} | …${truncatedIdentifier}`;
  };
};

// This function customises the TaskCard meant for all Chat channels
export const setChatTaskCardString = channel => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) {
    return;
  }

  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  const strings = getTemplateStrings();

  channel.templates.TaskCard.firstLine = task => {
    const identifier = maskIdentifiers ? strings.MaskIdentifiers : '@';

    const queueName =
      task.queueName.length > MAX_QUEUE_LENGTH
        ? `${task.queueName.substring(0, TRUNCATED_QUEUE_LENGTH)}…`
        : task.queueName;

    return maskIdentifiers ? task.queueName : `${queueName} | ${identifier}`;
  };
};
