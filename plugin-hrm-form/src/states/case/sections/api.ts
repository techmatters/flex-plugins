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

import { Case, WellKnownCaseSection } from '../../../types/types';
import { CaseWorkingCopy } from '../types';
import { ApiCaseSection, CaseSectionTypeSpecificData } from '../../../services/caseSectionService';

export type CaseSectionApi = {
  readonly label: string; // for logging only
  readonly type: WellKnownCaseSection;
  getSectionItemById: (caseObj: Case, id: string) => ApiCaseSection | undefined;
  getMostRecentSectionItem: (caseObj: Case) => ApiCaseSection | undefined;
  getSectionFormDefinition: (definitions: DefinitionVersion) => FormDefinition;
  getSectionLayoutDefinition: (definitions: DefinitionVersion) => LayoutDefinition;
  getWorkingCopy: (caseInfo: CaseWorkingCopy, id?: string) => CaseSectionTypeSpecificData | undefined;
  updateWorkingCopy: (caseInfo: CaseWorkingCopy, item?: CaseSectionTypeSpecificData, id?: string) => CaseWorkingCopy;
};
