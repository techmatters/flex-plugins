import { DefinitionVersion } from 'hrm-form-definitions';

import { ContactRawJson, HrmServiceContact, SearchAPIContact } from '../../types/types';

const extractName = (contact: ContactRawJson, placeholder: string) => {
  const { firstName, lastName } = contact?.childInformation ?? {};
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

type ContactLabelOptions = { placeholder?: string; substituteForId?: boolean };

const contactLabel = (
  definition: DefinitionVersion,
  { placeholder = 'Unknown', substituteForId = true }: ContactLabelOptions = {},
  contactDetails?: ContactRawJson,
  id?: string,
) => {
  if (definitionUsesChildName(definition)) {
    return extractName(contactDetails, placeholder);
  }
  return id && substituteForId ? `#${id}` : placeholder;
};

export const contactLabelFromHrmContact = (
  definition: DefinitionVersion,
  contact: HrmServiceContact,
  options: ContactLabelOptions = {},
) => contactLabel(definition, options, contact?.rawJson, contact?.id);

export const contactLabelFromSearchContact = (
  definition: DefinitionVersion,
  contact: SearchAPIContact,
  options: ContactLabelOptions = {},
) => contactLabel(definition, options, contact?.details, contact?.contactId);
