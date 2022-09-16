import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { DocumentEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';
import { getWorkingCopy, setWorkingCopy } from './workingCopy';

const SECTION_PROPERTY = 'documents';

export const documentSectionApi: CaseSectionApi<DocumentEntry> = {
  label: 'Document',
  toForm: (input: DocumentEntry) => {
    const { document, ...caseItemEntry } = { ...input, form: input.document };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName(SECTION_PROPERTY, 'document'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.DocumentForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.documents,
  getMostRecentSectionItem: getMostRecentSectionItem(SECTION_PROPERTY),
  getSectionItemById: getSectionItemById(SECTION_PROPERTY),
  getWorkingCopy: getWorkingCopy(SECTION_PROPERTY),
  updateWorkingCopy: setWorkingCopy(SECTION_PROPERTY),
};
