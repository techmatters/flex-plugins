import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi, getMostRecentSectionItem, getSectionItemById, upsertCaseSectionList } from './api';
import { PerpetratorEntry } from '../../../types/types';

export const perpetratorSectionApi: CaseSectionApi<PerpetratorEntry> = {
  label: 'Perpetrator',
  toForm: (input: PerpetratorEntry) => {
    const { perpetrator, ...caseItemEntry } = { ...input, form: input.perpetrator };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionList('perpetrators', 'perpetrator'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.PerpetratorForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.perpetrators,
  getMostRecentSectionItem: getMostRecentSectionItem('perpetrators'),
  getSectionItemById: getSectionItemById('perpetrators'),
};
