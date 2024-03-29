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

import { WellKnownCaseSection } from '../../../types/types';
import { CaseStateEntry, CaseWorkingCopy } from '../types';
import { CaseSection, CaseSectionTypeSpecificData } from '../../../services/caseSectionService';

// TODO: This interface was created to abstract away the differences between various types of case sections, now the structure of these is standardised the abstraction is largely redundant
// Most of the implementations are identical now, the only difference being the part of the form definition that is used for forms and layouts
// This API could be replaced with directly specified functions for most of it and a simple map to locate the form defs for each section.
// Alternatively, aligning the naming of the form definition sections with the sectionType will eliminate the need for any mapping, and be another step towards 'generic case section types' support.
export type CaseSectionApi = {
  readonly label: string; // for logging only
  readonly type: WellKnownCaseSection;
  getSectionItemById: (sections: CaseStateEntry['sections'], id: string) => CaseSection | undefined;
  getSectionFormDefinition: (definitions: DefinitionVersion) => FormDefinition;
  getSectionLayoutDefinition: (definitions: DefinitionVersion) => LayoutDefinition;
  getWorkingCopy: (caseInfo: CaseWorkingCopy, id?: string) => CaseSectionTypeSpecificData | undefined;
  updateWorkingCopy: (caseInfo: CaseWorkingCopy, item?: CaseSectionTypeSpecificData, id?: string) => CaseWorkingCopy;
};
