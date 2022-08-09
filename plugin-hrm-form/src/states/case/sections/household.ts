import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi, getMostRecentSectionItem, getSectionItemById, upsertCaseSectionList } from './api';
import { HouseholdEntry } from '../../../types/types';

export const householdSectionApi: CaseSectionApi<HouseholdEntry> = {
  label: 'Household',
  toForm: (input: HouseholdEntry) => {
    const { household, ...caseItemEntry } = { ...input, form: input.household };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionList('households', 'household'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.HouseholdForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.households,
  getMostRecentSectionItem: getMostRecentSectionItem('households'),
  getSectionItemById: getSectionItemById('households'),
};
