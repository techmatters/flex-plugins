import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { DocumentEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';

export const documentSectionApi: CaseSectionApi<DocumentEntry> = {
  label: 'Document',
  toForm: (input: DocumentEntry) => {
    const { document, ...caseItemEntry } = { ...input, form: input.document };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName('documents', 'document'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.DocumentForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.documents,
  getMostRecentSectionItem: getMostRecentSectionItem('documents'),
  getSectionItemById: getSectionItemById('documents'),
};
