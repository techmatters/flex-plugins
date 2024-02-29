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
import { getAvailableCaseStatusTransitions } from './caseStatus';

// eslint-disable-next-line import/no-unused-modules
export const loadCaseIntoState = ({
  state,
  definitionVersion,
  newCase,
  referenceId,
  error = null,
  loading = false,
}: {
  state: CaseState;
  definitionVersion: DefinitionVersion;
  newCase: Case;
  referenceId?: string;
  loading?: boolean;
  error?: any;
}): CaseState => {
  const existingCase = state.cases[newCase.id];
  if (!existingCase) {
    return {
      ...state,
      cases: {
        ...state.cases,
        [newCase.id]: {
          connectedCase: newCase,
          caseWorkingCopy: { sections: {} },
          availableStatusTransitions: getAvailableCaseStatusTransitions(newCase, definitionVersion),
          references: referenceId ? new Set([referenceId]) : new Set<string>(),
          loading,
          error,
        },
      },
    };
  }

  const updatedReferences = referenceId ? existingCase.references.add(referenceId) : existingCase.references;
  return {
    ...state,
    cases: {
      ...state.cases,
      [newCase.id]: {
        ...existingCase,
        references: updatedReferences,
        connectedCase: newCase,
      },
    },
  };
};
