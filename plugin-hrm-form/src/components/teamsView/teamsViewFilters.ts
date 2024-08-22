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
    // default: activity.name !== 'Offline',
  }));

  return {
    id: 'data.activity_name',
    fieldName: 'activity',
    type: FiltersListItemType.multiValue,
    title: 'Activities',
    options,
  };
};

const getSkillsArray = Manager.getInstance().serviceConfiguration.taskrouter_skills?.map(skill => ({
  value: skill.name,
  label: skill.name,
}));

/**
 * This function returns a list of skills defined in the taskrouter_skills configuration
 */
const skillsFilterDefinition: FilterDefinitionFactory = () => {
  return {
    id: 'data.attributes.routing.skills',
    title: 'Enabled Skills',
    fieldName: 'skills',
    type: FiltersListItemType.multiValue,
    options: getSkillsArray ? sortBy(getSkillsArray, ['label']) : [],
    condition: 'IN',
  };
};

const disabledSkillsFilterDefinition: FilterDefinitionFactory = () => {
  return {
    id: 'data.attributes.disabled_skills.skills',
    title: 'Disabled Skills',
    fieldName: 'disabled_skills',
    type: FiltersListItemType.multiValue,
    options: getSkillsArray ? sortBy(getSkillsArray, ['label']) : [],
    condition: 'IN',
  };
};

/**
 * This function sets up filters for the TeamsView component
 * The activity filter omits the default since we already include offline in the above, ie Flex.TeamsView.activitiesFilter
 * The skills filter is included if the feature flag is enabled.
 */
export const setUpTeamsViewFilters = () => {
  TeamsView.defaultProps.filters = [
    activityNoOfflineByDefault,
    ...(getAseloFeatureFlags().enable_teams_view_enhancements
      ? [skillsFilterDefinition, disabledSkillsFilterDefinition]
      : []),
  ];
};

export const setUpWorkerDirectoryFilters = () => {
  const managerInstance = Manager.getInstance();

  const activitiesArray = Array.from(managerInstance.store.getState().flex.worker.activities.values());
  const availableActivities = activitiesArray.filter(a => a.available).map(a => a.name);

  const activitiesFilter = `data.activity_name IN ${JSON.stringify(availableActivities)}`;
  WorkerDirectoryTabs.defaultProps.hiddenWorkerFilter = `(${activitiesFilter})`;
};
