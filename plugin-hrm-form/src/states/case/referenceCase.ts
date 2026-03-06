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

import type { CaseState } from './types';
import type { Case } from '../../types/types';

// eslint-disable-next-line import/no-unused-modules
export const updateCaseLastReferenced = (state: CaseState, caseId: Case['id'], newCase?: Case): CaseState => {
  const existingCase = state.cases[caseId];
  if (!existingCase) {
    return state;
  }
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...existingCase,
        lastReferencedDate: new Date(),
        connectedCase: newCase || existingCase.connectedCase,
      },
    },
  };
};
