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

// TODO: REMOVE
/* eslint-disable import/no-unused-modules */

import { namespace, connectedCaseBase } from '../storeNamespaces';
import type { RootState } from '..';
import type { Case } from '../../types/types';

export const selectCaseState = (state: RootState) => state[namespace][connectedCaseBase];

export const selectCaseById = (state: RootState, caseId: Case['id']) =>
  caseId ? selectCaseState(state)?.cases[caseId] : undefined;
