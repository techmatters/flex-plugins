import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseDetailsName } from './types';
import { HrmServiceContact } from '../../types/types';

const splitFullName = (contact: HrmServiceContact) => {
  const { firstName, lastName } = contact?.rawJson?.childInformation ?? {};
  if ((firstName === 'Unknown' && lastName === 'Unknown') || (!firstName && lastName)) {
    return 'Unknown';
  }
  return `${firstName} ${lastName}`;
};

const definitionUsesChildName = (definition: DefinitionVersion) =>
  Boolean(
    definition.tabbedForms.ChildInformationTab.find(input => input.name === 'firstName' || input.name === 'lastName'),
  );

export const caseContactIdentifier = (definition: DefinitionVersion, contact: HrmServiceContact) => {
  if (definitionUsesChildName(definition)) {
    return splitFullName(contact);
  }
  return contact ? `#${contact?.id}` : '';
};
