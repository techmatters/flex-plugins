import type { FilterDefinitionFactory } from '@twilio/flex-ui/src/components/view/TeamsView';
import { Manager, FiltersListItemType, TeamsView, WorkerDirectoryTabs } from '@twilio/flex-ui';

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
const skillsFilterDefinition: FilterDefinitionFactory = () => {
  const options =
    Manager.getInstance().serviceConfiguration.taskrouter_skills?.map(skill => ({
      value: skill.name,
      label: skill.name,
      default: false,
    })) || [];

  return {
    id: 'data.skill_name',
    fieldName: 'skill',
    type: FiltersListItemType.multiValue,
    title: 'Skills',
    options,
  };
};

export const setUpTeamViewFilters = () => {
  TeamsView.defaultProps.filters = [
    activityNoOfflineByDefault,
    /*
     * Omit the default since we already include offline in the above
     * Flex.TeamsView.activitiesFilter
     */
    skillsFilterDefinition,
  ];
};

export const setUpWorkerDirectoryFilters = () => {
  const managerInstance = Manager.getInstance();

  const activitiesArray = Array.from(managerInstance.store.getState().flex.worker.activities.values());
  const availableActivities = activitiesArray.filter(a => a.available).map(a => a.name);

  const skillsArray = managerInstance.serviceConfiguration.taskrouter_skills || [];
  const skillsNames = skillsArray.map(skill => skill.name);

  const activitiesFilter = `data.activity_name IN ${JSON.stringify(availableActivities)}`;

  const skillsFilter = `data.skills_name IN ${JSON.stringify(skillsNames)}`;

  WorkerDirectoryTabs.defaultProps.hiddenWorkerFilter = `(${activitiesFilter}) AND (${skillsFilter})`;
};
