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

import { Case, WellKnownCaseSection } from '../../../types/types';
import { ApiCaseSection } from '../../../services/caseSectionService';

export const getSectionItemById = (propertyName: WellKnownCaseSection) => (
  caseObj: Case,
  id: string,
): ApiCaseSection | undefined => {
  const sectionList = caseObj?.sections[propertyName];
  if (Array.isArray(sectionList)) {
    return sectionList.find(s => s.sectionId === id);
  }
  return undefined;
};

export const getMostRecentSectionItem = (propertyName: string) => (caseObj: Case): ApiCaseSection | undefined => {
  const sectionList = caseObj?.sections[propertyName];
  if (Array.isArray(sectionList)) {
    const sorted = [...sectionList].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
    return sorted[0];
  }
  return undefined;
};
