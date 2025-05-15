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

import { DefinitionVersionId } from 'hrm-form-definitions';

import { Case, Contact } from '../types/types';
import { getDefinitionVersionsList } from '../services/ServerlessService';
import { getDefinitionVersions } from '../hrmConfig';

// eslint-disable-next-line import/no-unused-modules
const getMissingDefinitionVersions = async (versions: string[]) => {
  const { definitionVersions } = getDefinitionVersions();
  const missingDefinitionVersions = new Set(
    versions.filter(v => Object.values(DefinitionVersionId).includes(v) && !definitionVersions[v]),
  );

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const definitions = await getDefinitionVersionsList(Array.from(missingDefinitionVersions));
  return definitions;
};

export const getContactsMissingVersions = (contacts: Contact[]) =>
  getMissingDefinitionVersions(contacts.map(c => c.rawJson.definitionVersion));

export const getCasesMissingVersions = async (cases: Case[]) =>
  getMissingDefinitionVersions(cases.map(c => c.info.definitionVersion));
