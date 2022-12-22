import { DefinitionVersion } from 'hrm-form-definitions';

import { HrmServiceContact } from '../../types/types';

const splitFullName = (contact: HrmServiceContact, placeholder: string) => {
  const { firstName, lastName } = contact?.rawJson?.childInformation ?? {};
  if ((firstName === 'Unknown' && lastName === 'Unknown') || (!firstName && !lastName)) {
    return placeholder;
  }
  return `${firstName ?? ''} ${lastName ?? ''}`;
};

const definitionUsesChildName = (definition: DefinitionVersion) =>
  Boolean(
    definition &&
      definition.tabbedForms.ChildInformationTab.find(input => input.name === 'firstName' || input.name === 'lastName'),
  );

export const contactLabel = (
  definition: DefinitionVersion,
  contact: HrmServiceContact,
  { placeholder = 'Unknown', substituteForId = true }: { placeholder?: string; substituteForId?: boolean } = {},
) => {
  if (definitionUsesChildName(definition)) {
    return splitFullName(contact, placeholder);
  }
  return contact && contact.id && substituteForId ? `#${contact?.id}` : placeholder;
};
