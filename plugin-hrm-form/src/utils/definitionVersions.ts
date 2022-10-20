import { DefinitionVersionId } from 'hrm-form-definitions';

import { Case, SearchContact } from '../types/types';
import { getDefinitionVersionsList } from '../services/ServerlessService';
import { getDefinitionVersions } from '../HrmFormPlugin';

// eslint-disable-next-line import/no-unused-modules
const getMissingDefinitionVersions = async (versions: DefinitionVersionId[]) => {
  const { definitionVersions } = getDefinitionVersions();
  const missingDefinitionVersions: DefinitionVersionId[] = versions.filter(
    v => Object.values(DefinitionVersionId).includes(v) && !definitionVersions[v],
  );

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const definitions = await getDefinitionVersionsList(missingDefinitionVersions);
  return definitions;
};

export const getContactsMissingVersions = (contacts: SearchContact[]) =>
  getMissingDefinitionVersions(contacts.map(c => c.details.definitionVersion));

export const getCasesMissingVersions = async (cases: Case[]) =>
  getMissingDefinitionVersions(cases.map(c => c.info.definitionVersion));
