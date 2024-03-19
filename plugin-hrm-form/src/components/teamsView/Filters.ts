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

import type { FilterDefinitionFactory } from '@twilio/flex-ui/src/components/view/TeamsView';
import { Manager, FiltersListItemType, TeamsView, WorkerDirectoryTabs } from '@twilio/flex-ui';
import sortBy from 'lodash/sortBy';

import { getAseloFeatureFlags } from '../../hrmConfig';

const activityNoOfflineByDefault: FilterDefinitionFactory = (appState, _teamFiltersPanelProps) => {
  const activitiesArray = Array.from(appState.flex.worker.activities.values());

  const options = activitiesArray.map(activity => ({
    value: activity.name,
    label: activity.name,
    default: activity.name !== 'Offline',
  }));

  return {
    id: 'data.activity_name',
    fieldName: 'activity',
    type: FiltersListItemType.multiValue,
    title: 'Activities',
    options,
  };
};

/**
 * This function returns a list of skills defined in the taskrouter_skills configuration
 */
const skillsFilterDefinition: FilterDefinitionFactory = (_appState, _teamFiltersPanelProps) => {
  const skillsArray = Manager.getInstance().serviceConfiguration.taskrouter_skills?.map(skill => ({
    value: skill.name,
    label: skill.name,
    default: true,
  }));

  return {
    id: 'data.attributes.routing.skills',
    title: 'Skills',
    fieldName: 'skills',
    type: FiltersListItemType.multiValue,
    options: skillsArray ? sortBy(skillsArray, ['label']) : [],
    condition: 'IN',
  };
};

export const setUpTeamViewFilters = () => {
  // eslint-disable-next-line camelcase
  const { enable_teams_view } = getAseloFeatureFlags();

  // eslint-disable-next-line camelcase
  if (enable_teams_view) {
    TeamsView.defaultProps.filters = [
      activityNoOfflineByDefault,
      /*
       * Omit the default since we already include offline in the above
       * Flex.TeamsView.activitiesFilter
       */
      skillsFilterDefinition,
    ];
  } else {
    TeamsView.defaultProps.filters = [activityNoOfflineByDefault];
  }
};

export const setUpWorkerDirectoryFilters = () => {
  const managerInstance = Manager.getInstance();

  const activitiesArray = Array.from(managerInstance.store.getState().flex.worker.activities.values());

  const availableActivities = activitiesArray.filter(a => a.available).map(a => a.name);

  const activitiesFilter = `data.activity_name IN ${JSON.stringify(availableActivities)}`;

  WorkerDirectoryTabs.defaultProps.hiddenWorkerFilter = `(${activitiesFilter})`;
};
