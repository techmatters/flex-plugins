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

import { CaseSectionApi } from './api';
import { RootState } from '../..';
import { Case } from '../../../types/types';
import { selectCounselorName } from '../../configuration/selectCounselorsHash';
import { selectCaseByCaseId } from '../selectCaseStateByCaseId';

const selectCaseItemHistory = (
  state: RootState,
  caseId: Case['id'],
  caseSectionApi: CaseSectionApi,
  caseItemId: string,
) => {
  const caseState = selectCaseByCaseId(state, caseId);
  const { createdBy, createdAt, updatedAt, updatedBy } =
    caseSectionApi.getSectionItemById(caseState?.sections, caseItemId) ?? {};
  const addingCounsellorName = selectCounselorName(state, createdBy);
  const updatingCounsellorName = selectCounselorName(state, updatedBy);
  return { addingCounsellorName, added: createdAt, updatingCounsellorName, updated: updatedAt };
};

export default selectCaseItemHistory;
