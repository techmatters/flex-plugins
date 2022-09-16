import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { PerpetratorEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';
import { getWorkingCopy, setWorkingCopy } from './workingCopy';

const SECTION_PROPERTY = 'perpetrators';

export const perpetratorSectionApi: CaseSectionApi<PerpetratorEntry> = {
  label: 'Perpetrator',
  toForm: (input: PerpetratorEntry) => {
    const { perpetrator, ...caseItemEntry } = { ...input, form: input.perpetrator };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName(SECTION_PROPERTY, 'perpetrator'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.PerpetratorForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.perpetrators,
  getMostRecentSectionItem: getMostRecentSectionItem(SECTION_PROPERTY),
  getSectionItemById: getSectionItemById(SECTION_PROPERTY),
  getWorkingCopy: getWorkingCopy(SECTION_PROPERTY),
  updateWorkingCopy: setWorkingCopy(SECTION_PROPERTY),
};
