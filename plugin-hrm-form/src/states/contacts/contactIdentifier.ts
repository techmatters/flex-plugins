import { DefinitionVersion } from 'hrm-form-definitions';

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
    definition &&
      definition.tabbedForms.ChildInformationTab.find(input => input.name === 'firstName' || input.name === 'lastName'),
  );

export const caseContactLabel = (
  definition: DefinitionVersion,
  strings: Record<string, string>,
  contact: HrmServiceContact,
) => {
  if (definitionUsesChildName(definition)) {
    return splitFullName(contact);
  }
  return contact ? `${strings['Case-Contact']} #${contact?.id}` : '';
};
