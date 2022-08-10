import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { HouseholdEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';

export const householdSectionApi: CaseSectionApi<HouseholdEntry> = {
  label: 'Household',
  toForm: (input: HouseholdEntry) => {
    const { household, ...caseItemEntry } = { ...input, form: input.household };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName('households', 'household'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.HouseholdForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.households,
  getMostRecentSectionItem: getMostRecentSectionItem('households'),
  getSectionItemById: getSectionItemById('households'),
};
