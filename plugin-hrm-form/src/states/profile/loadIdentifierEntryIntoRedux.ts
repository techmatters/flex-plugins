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

import * as t from './types';

const loadIdentifierEntryIntoRedux = (
  state: t.IdentifiersState,
  identifierId: t.Identifier['id'],
  identifierUpdate: Partial<t.IdentifierEntry>,
): t.IdentifiersState => {
  const existingIdentifier = state[identifierId];
  const newIdentifier = {
    ...existingIdentifier,
    ...identifierUpdate,
  };
  return {
    ...state,
    [identifierId]: newIdentifier,
  };
};

export default loadIdentifierEntryIntoRedux;
