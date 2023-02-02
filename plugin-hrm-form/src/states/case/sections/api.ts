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

import { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import { CaseInfo, CaseItemEntry } from '../../../types/types';
import { CaseWorkingCopy } from '../types';

export type CaseUpdater = (original: CaseInfo, temporaryInfo: CaseItemEntry) => CaseInfo;

export type CaseSectionApi<T> = {
  readonly label: string; // for logging only
  getSectionItemById: (caseInfo: CaseInfo, id: string) => T | undefined;
  getMostRecentSectionItem: (caseInfo: CaseInfo) => T | undefined;
  toForm: (section: T) => CaseItemEntry;
  upsertCaseSectionItemFromForm: CaseUpdater;
  getSectionFormDefinition: (definitions: DefinitionVersion) => FormDefinition;
  getSectionLayoutDefinition: (definitions: DefinitionVersion) => LayoutDefinition;
  getWorkingCopy: (caseInfo: CaseWorkingCopy, id?: string) => CaseItemEntry | undefined;
  updateWorkingCopy: (caseInfo: CaseWorkingCopy, item?: CaseItemEntry, id?: string) => CaseWorkingCopy;
};
