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

import { parseISO } from 'date-fns';

import { RootState } from '..';
import { ContactState } from './existingContacts';
import { namespace } from '../storeNamespaces';
import { Case } from '../../types/types';

const selectFirstContactByCaseId = (state: RootState, caseId: Case['id']): ContactState =>
  Object.values(state[namespace].activeContacts.existingContacts)
    .filter(cs => cs.savedContact?.caseId === caseId)
    .sort((a, b) => parseISO(a.savedContact?.createdAt).valueOf() - parseISO(b.savedContact?.createdAt).valueOf())[0] ||
  null;

export { selectFirstContactByCaseId };
