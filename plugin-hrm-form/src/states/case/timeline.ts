import { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { getActivitiesFromCase, getActivitiesFromContacts, sortActivities } from './caseActivities';
import { selectSavedContacts } from './connectedContacts';

export const selectCaseActivities = (state: RootState, taskSid: string) => {
  const {
    [namespace]: { configuration, connectedCase },
  } = state;
  const { definitionVersions, currentDefinitionVersion } = configuration;
  const caseState = connectedCase.tasks[taskSid];

  /**
   * Gets the activities timeline from current caseId
   * If the case is just being created, adds the case's description as a new activity
   */
  if (!caseState?.connectedCase) return [];

  const { connectedCase: caseForTask } = caseState;

  const timelineActivities = [
    ...getActivitiesFromCase(
      caseForTask,
      definitionVersions[caseForTask.info.definitionVersion] ?? currentDefinitionVersion,
    ),
    ...getActivitiesFromContacts(selectSavedContacts(state, caseForTask)),
  ];
  return sortActivities(timelineActivities);
};
