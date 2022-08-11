import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { IncidentEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';

export const incidentSectionApi: CaseSectionApi<IncidentEntry> = {
  label: 'Incident',
  toForm: (input: IncidentEntry) => {
    const { incident, ...caseItemEntry } = { ...input, form: input.incident };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName('incidents', 'incident'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.IncidentForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.incidents,
  getMostRecentSectionItem: getMostRecentSectionItem('incidents'),
  getSectionItemById: getSectionItemById('incidents'),
};
