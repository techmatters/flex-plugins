import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { PerpetratorEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';

export const perpetratorSectionApi: CaseSectionApi<PerpetratorEntry> = {
  label: 'Perpetrator',
  toForm: (input: PerpetratorEntry) => {
    const { perpetrator, ...caseItemEntry } = { ...input, form: input.perpetrator };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName('perpetrators', 'perpetrator'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.PerpetratorForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.perpetrators,
  getMostRecentSectionItem: getMostRecentSectionItem('perpetrators'),
  getSectionItemById: getSectionItemById('perpetrators'),
};
