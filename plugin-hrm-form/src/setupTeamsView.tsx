/**
 * Copyright (C) 2021-2026 Technology Matters
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

import * as Flex from '@twilio/flex-ui';
import * as React from 'react';

import TakeOverTaskButton from './components/teamsView/TakeOverTaskButton';
import TeamsView from './components/teamsView';

export const setUpTeamsView = () => {
  TeamsView.setUpSelectAgentColumn();
  TeamsView.setUpAgentColumn();
  TeamsView.setUpStatusColumn();
  TeamsView.setUpSkillsColumn();
  TeamsView.setUpTeamsViewSorting();
  TeamsView.setUpTeamsViewFilters();
  TeamsView.setUpWorkerDirectoryFilters();

  Flex.Supervisor.TaskCanvas.Header.Content.add(<TakeOverTaskButton key="take-over-button" />);
};
