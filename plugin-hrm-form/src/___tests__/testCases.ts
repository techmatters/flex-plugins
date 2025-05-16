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
import { Case } from '../types/types';
import { CaseStateEntry } from '../states/case/types';

export const VALID_EMPTY_CASE: Case = {
  label: '',
  id: '1',
  accountSid: 'AC',
  info: {
    definitionVersion: 'v1',
  },
  updatedAt: new Date(2000, 0, 1).toISOString(),
  createdAt: new Date(2000, 0, 1).toISOString(),
  helpline: '',
  twilioWorkerId: 'WK',
  status: '',
};

export const VALID_EMPTY_CASE_STATE_ENTRY: CaseStateEntry = {
  connectedCase: VALID_EMPTY_CASE,
  sections: {},
  timelines: {},
  availableStatusTransitions: [],
  caseWorkingCopy: undefined,
  references: new Set<string>(),
  outstandingUpdateCount: 0,
};
