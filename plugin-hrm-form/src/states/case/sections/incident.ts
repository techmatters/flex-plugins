import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi, getMostRecentSectionItem, getSectionItemById, upsertCaseSectionList } from './api';
import { IncidentEntry } from '../../../types/types';

export const incidentSectionApi: CaseSectionApi<IncidentEntry> = {
  label: 'Incident',
  toForm: (input: IncidentEntry) => {
    const { incident, ...caseItemEntry } = { ...input, form: input.incident };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionList('incidents', 'incident'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.IncidentForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.incidents,
  getMostRecentSectionItem: getMostRecentSectionItem('incidents'),
  getSectionItemById: getSectionItemById('incidents'),
};
