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

import { CaseWorkingCopy } from '../types';
import { CaseSectionTypeSpecificData } from '../../../services/caseSectionService';

export const getWorkingCopy = (sectionName: string) => (
  caseWorkingCopy: CaseWorkingCopy,
  id?: string,
): CaseSectionTypeSpecificData | undefined =>
  id ? caseWorkingCopy.sections[sectionName]?.existing[id] : caseWorkingCopy.sections[sectionName]?.new;

export const setWorkingCopy = (sectionName: string) => (
  caseWorkingCopy: CaseWorkingCopy,
  item?: CaseSectionTypeSpecificData,
  id?: string,
): CaseWorkingCopy => {
  if (!caseWorkingCopy.sections[sectionName]) {
    caseWorkingCopy.sections[sectionName] = { existing: {} };
  }
  const section = caseWorkingCopy.sections[sectionName];
  if (id) {
    // Id specified so we are updating an existing section's working copy
    if (item) {
      // Overwriting
      section.existing[id] = item;
    } else {
      // Removing
      delete section.existing[id];
    }
  }
  // Id not specified so we are updating a 'new', as yet unsaved section's working copy
  else if (item) {
    // Overwriting
    section.new = item;
  } else {
    // Removing
    delete section.new;
  }
  // Clean up empty sections
  if (!section.new && Object.keys(section.existing).length === 0) {
    delete caseWorkingCopy.sections[sectionName];
  }
  return caseWorkingCopy;
};
