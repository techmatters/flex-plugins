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

import { DefinitionVersion } from 'hrm-form-definitions';

import { Contact } from '../../types/types';
import { FullCaseSection } from '../../services/caseSectionService';

export const getSectionText = (
  { sectionTypeSpecificData, sectionType }: FullCaseSection,
  formDefs: DefinitionVersion,
): string => {
  let { previewFields } = formDefs.layoutVersion.case[sectionType] ?? {};
  const sectionFormDefinition = formDefs.caseSectionTypes[sectionType]?.form;
  if (!previewFields || !previewFields.length) {
    previewFields = sectionFormDefinition?.length ? [sectionFormDefinition[0].name] : [];
  }
  return (
    previewFields
      .map(pf => sectionTypeSpecificData[pf])
      .filter(pv => pv)
      .join(', ') || '--'
  );
};

export const getContactActivityText = (contact: Contact, strings: Record<string, string>): string => {
  if (contact.rawJson.caseInformation.callSummary) {
    return contact.rawJson.caseInformation.callSummary.toString();
  }
  if (!contact.finalizedAt) {
    return strings['Case-Timeline-DraftContactSummaryPlaceholder'] ?? '';
  }
  return '';
};
