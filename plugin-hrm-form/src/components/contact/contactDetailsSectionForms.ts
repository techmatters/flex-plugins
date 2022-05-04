import { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import { ContactRawJson, InformationObject, SearchContact } from '../../types/types';
import { TaskEntry } from '../../states/contacts/reducer';
import {
  transformCategories,
  transformContactFormValues,
  unNestInformationObject,
} from '../../services/ContactService';

type ContactFormValues = Record<string, string | boolean>;

export type ContactDetailsSectionForm = {
  getFormDefinition: (def: DefinitionVersion) => FormDefinition;
  getLayoutDefinition: (def: DefinitionVersion) => LayoutDefinition;
  getFormValues: (def: DefinitionVersion, contact: SearchContact) => ContactFormValues;
  formPath: keyof TaskEntry;
  formToPayload: (
    def: DefinitionVersion,
    form: ContactFormValues,
  ) => {
    contactRawJson: Partial<
      | Pick<ContactRawJson, 'callerInformation' | 'childInformation'>
      | { caseInformation: Omit<ContactRawJson['caseInformation'], 'categories'> }
    >;
  };
};

export type IssueCategorizationSectionForm = {
  getFormDefinition: (def: DefinitionVersion) => FormDefinition;
  getLayoutDefinition: (def: DefinitionVersion) => LayoutDefinition;
  getFormValues: (def: DefinitionVersion, contact: SearchContact) => string[];
  formPath: keyof TaskEntry;
  formToPayload: (
    def: DefinitionVersion,
    form: string[],
  ) => { contactRawJson: { caseInformation: Pick<ContactRawJson['caseInformation'], 'categories'> } };
};

export const isIssueCategorizationSectionForm = (
  form: ContactDetailsSectionForm | IssueCategorizationSectionForm,
): form is IssueCategorizationSectionForm => form.formPath === 'categories';

export const contactDetailsSectionForm: {
  CHILD_INFORMATION: ContactDetailsSectionForm;
  CALLER_INFORMATION: ContactDetailsSectionForm;
  ISSUE_CATEGORIZATION: IssueCategorizationSectionForm;
  CASE_INFORMATION: ContactDetailsSectionForm;
} = {
  CHILD_INFORMATION: {
    formPath: 'childInformation',
    getFormValues: (def, contact) =>
      unNestInformationObject(def.tabbedForms.ChildInformationTab, contact.details.childInformation),
    getFormDefinition: def => def.tabbedForms.ChildInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.childInformation,
    formToPayload: (def, form) => ({
      contactRawJson: {
        childInformation: transformContactFormValues(form, def.tabbedForms.ChildInformationTab),
      },
    }),
  },
  CALLER_INFORMATION: {
    formPath: 'callerInformation',
    getFormValues: (def, contact) =>
      unNestInformationObject(def.tabbedForms.CallerInformationTab, contact.details.callerInformation),
    getFormDefinition: def => def.tabbedForms.CallerInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.callerInformation,
    formToPayload: (def, form) => ({
      contactRawJson: {
        callerInformation: transformContactFormValues(form, def.tabbedForms.CallerInformationTab),
      },
    }),
  },
  ISSUE_CATEGORIZATION: {
    formPath: 'categories',
    getFormValues: (def, contact) =>
      Object.entries<string[]>(contact.overview.categories).flatMap(([category, subCategories]) =>
        subCategories.map(subCategories => `categories.${category}.${subCategories}`),
      ),
    getFormDefinition: def => def.tabbedForms.CallerInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.callerInformation,
    formToPayload: (def, form) => ({
      contactRawJson: { caseInformation: { categories: transformCategories('', form) } },
    }),
  },
  CASE_INFORMATION: {
    formPath: 'caseInformation',
    getFormValues: (def, contact) => {
      const { categories, ...caseInformation } = contact.details.caseInformation;
      return caseInformation as ContactFormValues;
    },
    getFormDefinition: def => def.tabbedForms.CaseInformationTab,
    getLayoutDefinition: def => def.layoutVersion.contact.caseInformation,
    formToPayload: (def, form) => ({
      contactRawJson: {
        caseInformation: transformContactFormValues(form, def.tabbedForms.CaseInformationTab),
      },
    }),
  },
} as const;
