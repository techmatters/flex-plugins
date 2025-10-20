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
  const title = 'Activities';
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
    title: Manager.getInstance().strings[title] ?? title,
    options,
  };
};

export const skillsOptions = Manager.getInstance().serviceConfiguration.taskrouter_skills?.map(({ name }) => ({
  value: name,
  label: name,
}));

/**
 * This function returns a list of skills defined in the taskrouter_skills configuration
 */
const skillsFilterDefinition: FilterDefinitionFactory = () => {
  const title = 'Enabled Skills';
  return {
    id: 'data.attributes.routing.skills',
    title: Manager.getInstance().strings[title] ?? title,
    fieldName: 'skills',
    type: FiltersListItemType.multiValue,
    options: skillsOptions ? sortBy(skillsOptions, ['label']) : [],
    condition: 'IN',
  };
};

const disabledSkillsFilterDefinition: FilterDefinitionFactory = () => {
  const title = 'Disabled Skills';
  return {
    id: 'data.attributes.disabled_skills.skills',
    title: Manager.getInstance().strings[title] ?? title,
    fieldName: 'disabled_skills',
    type: FiltersListItemType.multiValue,
    options: skillsOptions ? sortBy(skillsOptions, ['label']) : [],
    condition: 'IN',
  };
};

const filterInputExpressionStrings: Record<string, string> = {};

/**
 * This function will generate a FilterDefinitionFactory that can be passed livequery expression to determine how to evaluate filter selections to generate a filtered list of workers
 * e.g. data.attributes.routing.skills IN [{...selections}] OR data.attributes.disabled_skills.skills IN [{...selections}]
 * to return any workers with the selected skills present in their enabled or disabled list
 *
 * The Twilio FilterDefinition does not support expression inputs like this, only references to a single data field, e.g. data.attributes.routing.skills
 * To work around this, this function creates a dummy FilterDefinition which only renders the UI and updates the current filter selections in the redux state
 * The query the FilterDefinition generates is always a NOT_IN vs an attribute that doesn't exist, so should always return everything.
 * This is why the id property is usually prefixed with 'dummy_' to ensure it doesn't point at real data and indicate it isn't supposed to
 *
 * The 'real' filtering is implemented by setting the hiddenFilter property on teamsView.
 * We maintain a map of filter strings, with an entry for each 'expression backed filter'.
 * We re-evaluate the relevant entry each time the factory function is run, reading the current filter selections for the filter from redux state and generating the livequery snippet using the provided generator function
 * We then add all these filter expressions with AND logic to the hiddenFilter, which implements the filter
 */
const generateFilterDefinitionFactoryForInputExpression = ({
  id,
  queryGenerator,
  titleKey,
  fieldName = id.toLowerCase().replace('.', '_'),
}: {
  id: string;
  queryGenerator: (selectionsString: string[]) => string;
  titleKey: string;
  fieldName?: string;
}): FilterDefinitionFactory => (state, teamsViewProps) => {
  const values = state.flex.supervisor.appliedFilters.find(af => af.name === id)?.values ?? [];
  const selections = Array.isArray(values) ? values : [values];
  if (selections.length) {
    filterInputExpressionStrings[id] = queryGenerator(selections);
  } else {
    // Assume nothing is selected if no values are set in the state, therefore we don't apply any filtering for this filter
    delete filterInputExpressionStrings[id];
  }
  teamsViewProps.hiddenFilter = Object.values(filterInputExpressionStrings).join(' AND ');
  return {
    id,
    title: Manager.getInstance().strings[titleKey] ?? titleKey,
    fieldName,
    type: FiltersListItemType.multiValue,
    options: skillsOptions ? sortBy(skillsOptions, ['label']) : [],
    condition: `NOT_IN`,
  };
};

const assignedSkillsFilterDefinition: FilterDefinitionFactory = generateFilterDefinitionFactoryForInputExpression({
  id: `data.attributes.dummy_assigned_skills`,
  queryGenerator: selections => {
    const selectionsString = selections.map(s => `\"${s}\"`).join(', ');
    return `(data.attributes.routing.skills IN [${selectionsString}] OR data.attributes.disabled_skills.skills IN [${selectionsString}])`;
  },
  titleKey: 'Assigned Skills',
});

const unassignedSkillsFilterDefinition: FilterDefinitionFactory = generateFilterDefinitionFactoryForInputExpression({
  id: `data.attributes.dummy_unassigned_skills`,
  queryGenerator: selections =>
    `(${selections
      .map(
        selection =>
          `(data.attributes.routing.skills NOT_IN [\"${selection}\"] AND data.attributes.disabled_skills.skills NOT_IN [\"${selection}\"])`,
      )
      .join(' OR ')})`,
  titleKey: 'Unassigned Skills',
});

/**
 * This function sets up filters for the TeamsView component
 * The activity filter omits the default since we already include offline in the above, ie Flex.TeamsView.activitiesFilter
 * The skills filter is included if the feature flag is enabled.
 */
export const setUpTeamsViewFilters = () => {
  TeamsView.defaultProps.filters = getAseloFeatureFlags().enable_assigned_skill_teams_view_filters
    ? [
        activityNoOfflineByDefault,
        skillsFilterDefinition,
        disabledSkillsFilterDefinition,
        assignedSkillsFilterDefinition,
        unassignedSkillsFilterDefinition,
      ]
    : [activityNoOfflineByDefault, skillsFilterDefinition, disabledSkillsFilterDefinition];
};

export const setUpWorkerDirectoryFilters = () => {
  const managerInstance = Manager.getInstance();

  const activitiesArray = Array.from(managerInstance.store.getState().flex.worker.activities.values());
  const availableActivities = activitiesArray.filter(a => a.available).map(a => a.name);

  WorkerDirectoryTabs.defaultProps.hiddenWorkerFilter = `(data.activity_name IN ${JSON.stringify(
    availableActivities,
  )})`;
};
