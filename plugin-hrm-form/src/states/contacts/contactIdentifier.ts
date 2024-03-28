/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { DefinitionVersion } from 'hrm-form-definitions';

import { Contact, ContactRawJson } from '../../types/types';

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
  contact: Contact,
  options: ContactLabelOptions = {},
) => contactLabel(definition, options, contact?.rawJson, contact?.id);
