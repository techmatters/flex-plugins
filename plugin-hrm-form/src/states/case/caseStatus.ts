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

import { DefinitionVersion, StatusInfo } from 'hrm-form-definitions';

import { getInitializedCan, PermissionActions } from '../../permissions';
import { Case } from '../../types/types';

export const getAvailableCaseStatusTransitions = (
  connectedCase: Case,
  definitionVersion: DefinitionVersion,
): StatusInfo[] => {
  if (definitionVersion) {
    const can = getInitializedCan();
    const caseStatusList = Object.values<StatusInfo>(definitionVersion.caseStatus);
    const currentStatusItem = caseStatusList.find(cs => cs.value === connectedCase.status);
    const availableStatusTransitions: string[] = currentStatusItem
      ? [...(currentStatusItem.transitions ?? []), currentStatusItem.value]
      : [];
    return caseStatusList.filter(
      option =>
        availableStatusTransitions.includes(option.value) &&
        (option === currentStatusItem ||
          (currentStatusItem.value === 'closed' &&
            option.value !== 'closed' &&
            can(PermissionActions.REOPEN_CASE, connectedCase)) ||
          (currentStatusItem.value !== 'closed' &&
            option.value === 'closed' &&
            can(PermissionActions.CLOSE_CASE, connectedCase)) ||
          (currentStatusItem.value !== 'closed' &&
            option.value !== 'closed' &&
            can(PermissionActions.CASE_STATUS_TRANSITION, connectedCase))),
    );
  }
  return [];
};
