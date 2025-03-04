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
import { namespace } from '../storeNamespaces';
import { Case, Contact } from '../../types/types';

export const selectDefinitionVersions = (state: RootState) => state[namespace].configuration.definitionVersions;

export const selectCurrentDefinitionVersion = (state: RootState) =>
  state[namespace].configuration.currentDefinitionVersion;

export const selectDefinitionVersionForCase = ({ [namespace]: { configuration } }: RootState, connectedCase: Case) =>
  configuration.definitionVersions[connectedCase?.info?.definitionVersion ?? ''] ??
  configuration.currentDefinitionVersion;

export const selectDefinitionVersionForContact = ({ [namespace]: { configuration } }: RootState, contact: Contact) =>
  configuration.definitionVersions[contact?.rawJson?.definitionVersion ?? ''] ?? configuration.currentDefinitionVersion;
