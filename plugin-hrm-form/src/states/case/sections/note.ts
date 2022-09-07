import { DefinitionVersion } from 'hrm-form-definitions';

import { NoteEntry } from '../../../types/types';
import { CaseSectionApi, CaseUpdater } from './api';
import { upsertCaseSectionItem } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';

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
  getMostRecentSectionItem: getMostRecentSectionItem('counsellorNotes'),
  getSectionItemById: getSectionItemById('counsellorNotes'),
};
