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

import { RootState } from '..';
import { connectedCaseBase, namespace } from '../storeNamespaces';
import { CaseStateEntry } from './types';
import { selectCounselorName } from '../configuration/selectCounselorsHash';
import { selectDefinitionVersionForCase } from '../configuration/selectDefinitions';
import { Case } from '../../types/types';

export const selectCaseByCaseId = (state: RootState, caseId: string): CaseStateEntry | undefined =>
  state[namespace][connectedCaseBase]?.cases[caseId];

export type CaseHistoryDetails = {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  statusUpdatedAt?: Date;
  statusUpdatedBy?: string;
  previousStatusLabel?: string;
  statusLabel: string;
};

export const selectCaseHistoryDetails = (state: RootState, caseObj: Case): CaseHistoryDetails => {
  const definitionVersion = selectDefinitionVersionForCase(state, caseObj);
  const {
    previousStatus,
    status,
    statusUpdatedBy,
    statusUpdatedAt,
    twilioWorkerId,
    createdAt,
    updatedAt,
    updatedBy,
  } = caseObj;
  const statusLabel = status ? definitionVersion.caseStatus[status]?.label || `Unknown (${status})` : 'None'; // Shouldn't ever be 'None'
  const previousStatusLabel = previousStatus
    ? definitionVersion.caseStatus[previousStatus]?.label || `Unknown (${previousStatus})`
    : 'None';
  return {
    createdAt: new Date(createdAt),
    createdBy: selectCounselorName(state, twilioWorkerId),
    updatedAt: updatedAt ? new Date(updatedAt) : undefined,
    updatedBy: selectCounselorName(state, updatedBy),
    statusUpdatedAt: statusUpdatedAt ? new Date(statusUpdatedAt) : undefined,
    statusUpdatedBy: selectCounselorName(state, statusUpdatedBy),
    previousStatusLabel,
    statusLabel,
  };
};
