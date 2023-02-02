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

import { NoteEntry } from '../../../types/types';
import { CaseSectionApi, CaseUpdater } from './api';
import { upsertCaseSectionItem } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';
import { getWorkingCopy, setWorkingCopy } from './workingCopy';

const SECTION_PROPERTY = 'counsellorNotes';

const noteSectionUpdater: CaseUpdater = upsertCaseSectionItem<NoteEntry>(
  ci => {
    ci.counsellorNotes = ci.counsellorNotes ?? [];
    return ci.counsellorNotes;
  },
  temp => {
    const { form: noteForm, ...entryInfo } = temp;
    return {
      ...noteForm,
      ...entryInfo,
    };
  },
);

export const noteSectionApi: CaseSectionApi<NoteEntry> = {
  label: 'Note',
  toForm: (input: NoteEntry) => {
    const { createdAt, updatedAt, updatedBy, twilioWorkerId, id, ...toCopy } = input;
    return {
      id: id?.toString(),
      updatedAt,
      updatedBy,
      createdAt,
      twilioWorkerId,
      form: toCopy,
    };
  },
  upsertCaseSectionItemFromForm: noteSectionUpdater,
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.NoteForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.notes ?? {},
  getMostRecentSectionItem: getMostRecentSectionItem(SECTION_PROPERTY),
  getSectionItemById: getSectionItemById(SECTION_PROPERTY),
  getWorkingCopy: getWorkingCopy(SECTION_PROPERTY),
  updateWorkingCopy: setWorkingCopy(SECTION_PROPERTY),
};
