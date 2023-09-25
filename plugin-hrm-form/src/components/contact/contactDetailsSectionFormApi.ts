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

/* eslint-disable import/named */
import { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import { ContactRawJson } from '../../types/types';
import { transformValues } from '../../services/ContactService';
import { SearchContactDraftChanges } from '../../states/contacts/existingContacts';

type ContactFormValues = {
  [key in 'childInformation' | 'callerInformation' | 'caseInformation']?: Record<string, string | boolean>;
};

export type ContactDetailsSectionFormApi = {
  getFormDefinition: (def: DefinitionVersion) => FormDefinition;
  getLayoutDefinition: (def: DefinitionVersion) => LayoutDefinition;
  getFormValues: (def: DefinitionVersion, contact: SearchContactDraftChanges) => ContactFormValues;
  formToPayload: (
    def: DefinitionVersion,
    form: ContactFormValues,
  ) => Partial<Pick<ContactRawJson, 'callerInformation' | 'childInformation' | 'caseInformation'>>;
};

const mapFormToDefinition = (
  def: FormDefinition,
  contact: SearchContactDraftChanges,
): Record<string, string | boolean> => {
  const entries = Object.entries(def).map(([, { name }]) => [name, contact[name]]);
  return Object.fromEntries(entries);
};

export const contactDetailsSectionFormApi: {
  CHILD_INFORMATION: ContactDetailsSectionFormApi;
  CALLER_INFORMATION: ContactDetailsSectionFormApi;
  CASE_INFORMATION: ContactDetailsSectionFormApi;
} = {
  CHILD_INFORMATION: {
    getFormValues: (def, contact) => ({
      childInformation: mapFormToDefinition(def.tabbedForms.ChildInformationTab, contact.rawJson.childInformation),
    }),
    getFormDefinition: def => def.tabbedForms.ChildInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.childInformation,
    formToPayload: (def, form) => ({
      // TODO: Remove this and other calls to 'tranformValues' in components & helpers when we save via redux and can put ut uin the reducer
      childInformation: transformValues(def.tabbedForms.ChildInformationTab)(form.childInformation),
    }),
  },
  CALLER_INFORMATION: {
    getFormValues: (def, contact) => ({
      callerInformation: mapFormToDefinition(def.tabbedForms.CallerInformationTab, contact.rawJson.callerInformation),
    }),
    getFormDefinition: def => def.tabbedForms.CallerInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.callerInformation,
    formToPayload: (def, form) => ({
      callerInformation: transformValues(def.tabbedForms.CallerInformationTab)(form.callerInformation),
    }),
  },
  CASE_INFORMATION: {
    getFormValues: (def, contact) => {
      const { categories, ...caseInformation } = contact.rawJson.caseInformation;
      return { caseInformation } as ContactFormValues;
    },
    getFormDefinition: def => def.tabbedForms.CaseInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.caseInformation,
    formToPayload: (def, form) => ({
      caseInformation: transformValues(def.tabbedForms.CaseInformationTab)(form.caseInformation),
    }),
  },
} as const;
