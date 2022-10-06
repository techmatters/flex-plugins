import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseSectionApi } from './api';
import { IncidentEntry } from '../../../types/types';
import { upsertCaseSectionItemUsingSectionName } from './update';
import { getMostRecentSectionItem, getSectionItemById } from './get';
import { getWorkingCopy, setWorkingCopy } from './workingCopy';

const SECTION_PROPERTY = 'incidents';

export const incidentSectionApi: CaseSectionApi<IncidentEntry> = {
  label: 'Incident',
  toForm: (input: IncidentEntry) => {
    const { incident, ...caseItemEntry } = { ...input, form: input.incident };
    return caseItemEntry;
  },
  upsertCaseSectionItemFromForm: upsertCaseSectionItemUsingSectionName(SECTION_PROPERTY, 'incident'),
  getSectionFormDefinition: (definitionVersions: DefinitionVersion) => definitionVersions.caseForms.IncidentForm,
  getSectionLayoutDefinition: (definitionVersions: DefinitionVersion) =>
    definitionVersions.layoutVersion.case.incidents,
  getMostRecentSectionItem: getMostRecentSectionItem(SECTION_PROPERTY),
  getSectionItemById: getSectionItemById(SECTION_PROPERTY),
  getWorkingCopy: getWorkingCopy(SECTION_PROPERTY),
  updateWorkingCopy: setWorkingCopy(SECTION_PROPERTY),
};
