import { Case, SearchContact } from '../types/types';
import { getDefinitionVersionsList } from '../services/ServerlessService';
import { getDefinitionVersions } from '../HrmFormPlugin';

// eslint-disable-next-line import/no-unused-modules
const getMissingDefinitionVersions = async (versions: string[]) => {
  const { definitionVersions } = getDefinitionVersions();
  const missingDefinitionVersions = Object.keys(
    versions.reduce((accum, v) => (definitionVersions[v] ? accum : { ...accum, [v]: true }), {}),
  );

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const definitions = await getDefinitionVersionsList(missingDefinitionVersions);
  return definitions;
};

export const getContactsMissingVersions = (contacts: SearchContact[]) =>
  getMissingDefinitionVersions(contacts.map(c => c.details.definitionVersion));

export const getCasesMissingVersions = async (cases: Case[]) =>
  getMissingDefinitionVersions(cases.map(c => c.info.definitionVersion));
