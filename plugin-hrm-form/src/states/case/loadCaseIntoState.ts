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

import type { DefinitionVersion } from 'hrm-form-definitions';

import type { CaseState } from './types';
import type { Case } from '../../types/types';
import type { ParseFetchErrorResult } from '../parseFetchError';
import { getAvailableCaseStatusTransitions } from './caseStatus';

export const loadCaseIntoState = ({
  state,
  caseId,
  definitionVersion,
  newCase,
  error = null,
  loading = false,
  preserveWorkingCopy = false,
}: {
  state: CaseState;
  caseId: Case['id'];
  definitionVersion: DefinitionVersion;
  newCase: Case;
  loading?: boolean;
  error?: ParseFetchErrorResult;
  preserveWorkingCopy?: boolean;
}): CaseState => {
  const existingCase = state.cases[caseId];
  const statusUpdates = { loading, error };

  const existingWorkingCopy = existingCase?.caseWorkingCopy;

  if (!existingCase || !existingCase.connectedCase) {
    return {
      ...state,
      cases: {
        ...state.cases,
        [caseId]: {
          connectedCase: newCase,
          caseWorkingCopy: preserveWorkingCopy && existingWorkingCopy ? existingWorkingCopy : { sections: {} },
          availableStatusTransitions: getAvailableCaseStatusTransitions(newCase, definitionVersion),
          lastReferencedDate: new Date(),
          sections: {},
          timelines: {},
          outstandingUpdateCount: 0,
          ...statusUpdates,
        },
      },
    };
  }

  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...existingCase,
        lastReferencedDate: new Date(),
        connectedCase: newCase || existingCase.connectedCase,
        ...statusUpdates,
      },
    },
  };
};
