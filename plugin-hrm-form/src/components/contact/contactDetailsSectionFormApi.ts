import { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import { ContactRawJson, SearchContact } from '../../types/types';
import {
  transformCategories,
  transformContactFormValues,
  transformValues,
  unNestInformationObject,
} from '../../services/ContactService';

export type ContactFormValues = {
  [key in 'childInformation' | 'callerInformation' | 'caseInformation']?: Record<string, string | boolean>;
};

export type ContactDetailsSectionFormApi = {
  getFormDefinition: (def: DefinitionVersion) => FormDefinition;
  getLayoutDefinition: (def: DefinitionVersion) => LayoutDefinition;
  getFormValues: (def: DefinitionVersion, contact: SearchContact) => ContactFormValues;
  formToPayload: (
    def: DefinitionVersion,
    form: ContactFormValues,
  ) => {
    rawJson: Partial<
      | Pick<ContactRawJson, 'callerInformation' | 'childInformation'>
      | { caseInformation: Omit<ContactRawJson['caseInformation'], 'categories'> }
      >;
  };
};

export type IssueCategorizationSectionFormApi = {
  getFormDefinition: (def: DefinitionVersion) => FormDefinition;
  getLayoutDefinition: (def: DefinitionVersion) => LayoutDefinition;
  getFormValues: (def: DefinitionVersion, contact: SearchContact) => { categories: string[] };
  type: 'IssueCategorizationSectionForm';
  formToPayload: (
    def: DefinitionVersion,
    form: { categories: string[] },
    helpline: string,
  ) => { rawJson: { caseInformation: Pick<ContactRawJson['caseInformation'], 'categories'> } };
};

export const contactDetailsSectionFormApi: {
  CHILD_INFORMATION: ContactDetailsSectionFormApi;
  CALLER_INFORMATION: ContactDetailsSectionFormApi;
  ISSUE_CATEGORIZATION: IssueCategorizationSectionFormApi;
  CASE_INFORMATION: ContactDetailsSectionFormApi;
} = {
  CHILD_INFORMATION: {
    getFormValues: (def, contact) => ({
      childInformation: unNestInformationObject(def.tabbedForms.ChildInformationTab, contact.details.childInformation),
    }),
    getFormDefinition: def => def.tabbedForms.ChildInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.childInformation,
    formToPayload: (def, form) => ({
      rawJson: {
        childInformation: transformContactFormValues(form.childInformation, def.tabbedForms.ChildInformationTab),
      },
    }),
  },
  CALLER_INFORMATION: {
    getFormValues: (def, contact) => ({
      callerInformation: unNestInformationObject(
        def.tabbedForms.CallerInformationTab,
        contact.details.callerInformation,
      ),
    }),
    getFormDefinition: def => def.tabbedForms.CallerInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.callerInformation,
    formToPayload: (def, form) => ({
      rawJson: {
        callerInformation: transformContactFormValues(form.callerInformation, def.tabbedForms.CallerInformationTab),
      },
    }),
  },
  ISSUE_CATEGORIZATION: {
    type: 'IssueCategorizationSectionForm',
    getFormValues: (def, contact) => ({
      categories: Object.entries<string[]>(contact.overview.categories).flatMap(([category, subCategories]) =>
        subCategories.map(subCategories => `categories.${category}.${subCategories}`),
      ),
    }),
    getFormDefinition: def => def.tabbedForms.CallerInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.callerInformation,
    formToPayload: (def, form, helpline) => ({
      rawJson: { caseInformation: { categories: transformCategories(helpline, form.categories, def) } },
    }),
  },
  CASE_INFORMATION: {
    getFormValues: (def, contact) => {
      const { categories, ...caseInformation } = contact.details.caseInformation;
      return { caseInformation } as ContactFormValues;
    },
    getFormDefinition: def => def.tabbedForms.CaseInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.caseInformation,
    formToPayload: (def, form) => ({
      rawJson: {
        caseInformation: transformValues(def.tabbedForms.CaseInformationTab)(form.caseInformation),
      },
    }),
  },
} as const;
