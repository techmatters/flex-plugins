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
