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

import { omit } from 'lodash';

import type { CaseState } from './types';
import type { Case } from '../../types/types';

export const referenceCase = ({
  caseId,
  referenceId,
  state,
  newCase,
}: {
  state: CaseState;
  caseId: Case['id'];
  referenceId: string;
  newCase?: Case;
}): CaseState => {
  const existingCase = state.cases[caseId];

  // If there's no "new case" and the reference is already there, avoid triggering re-renders
  if (existingCase.references.has(referenceId) && !newCase) {
    return state;
  }

  // If the reference does not exists, or if there's a "new case" (actually new or updated version), rebuild the state to trigger appropriate re-renders
  const updatedReferences = existingCase.references.add(referenceId);
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...existingCase,
        references: updatedReferences,
        connectedCase: newCase || existingCase.connectedCase,
      },
    },
  };
};

export const dereferenceCase = (state: CaseState, caseId: Case['id'], referenceId: string): CaseState => {
  const caseState = state.cases[caseId];
  if (!caseState) {
    return state;
  }
  const references = caseState.references ?? new Set<string>();
  references.delete(referenceId);
  if (references.size === 0) {
    return {
      ...state,
      cases: omit(state.cases, caseId),
    };
  }
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...state.cases[caseId],
        references,
      },
    },
  };
};
