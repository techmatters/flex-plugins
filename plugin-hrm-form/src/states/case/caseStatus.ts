import { DefinitionVersion, StatusInfo } from 'hrm-form-definitions';

import { getPermissionsForCase, PermissionActions } from '../../permissions';
import { Case } from '../../types/types';

export const getAvailableCaseStatusTransitions = (
  connectedCase: Case,
  definitionVersion: DefinitionVersion,
): StatusInfo[] => {
  if (definitionVersion) {
    const { can } = getPermissionsForCase(connectedCase.twilioWorkerId, connectedCase.status);
    const caseStatusList = Object.values<StatusInfo>(definitionVersion.caseStatus);
    const currentStatusItem = caseStatusList.find(cs => cs.value === connectedCase.status);
    const availableStatusTransitions: string[] = currentStatusItem
      ? [...(currentStatusItem.transitions ?? []), currentStatusItem.value]
      : [];
    return caseStatusList.filter(
      option =>
        availableStatusTransitions.includes(option.value) &&
        (option === currentStatusItem ||
          (currentStatusItem.value === 'closed' && option.value !== 'closed' && can(PermissionActions.REOPEN_CASE)) ||
          (currentStatusItem.value !== 'closed' && option.value === 'closed' && can(PermissionActions.CLOSE_CASE)) ||
          (currentStatusItem.value !== 'closed' &&
            option.value !== 'closed' &&
            can(PermissionActions.CASE_STATUS_TRANSITION))),
    );
  }
  return [];
};
