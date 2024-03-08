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

import type { Case } from '../../types/types';
import { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { getActivitiesFromCase, getActivitiesFromContacts, getActivityCount, sortActivities } from './caseActivities';
import { selectSavedContacts } from './connectedContacts';

export const selectCaseActivities = (state: RootState, caseId: Case['id'], pageSize: number, page: number) => {
  const {
    [namespace]: { configuration, connectedCase },
  } = state;
  const { definitionVersions, currentDefinitionVersion } = configuration;
  const caseState = connectedCase.cases[caseId];

  if (!caseState?.connectedCase) return [];

  const { connectedCase: caseForTask } = caseState;

  const timelineActivities = [
    ...getActivitiesFromCase(
      caseForTask,
      definitionVersions[caseForTask.info.definitionVersion] ?? currentDefinitionVersion,
    ),
    ...getActivitiesFromContacts(selectSavedContacts(state, caseForTask)),
  ];
  return sortActivities(timelineActivities).slice(page * pageSize, (page + 1) * pageSize);
};

export const selectCaseActivityCount = ({ [namespace]: { connectedCase } }: RootState, caseId: Case['id']) =>
  getActivityCount(connectedCase.cases[caseId]?.connectedCase) ?? 0;
