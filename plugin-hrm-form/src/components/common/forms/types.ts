/* eslint-disable import/no-unused-modules */
import type { RegisterOptions } from 'react-hook-form';

import { CallTypes } from '../../../states/DomainConstants';
import { OneToOneConfigSpec, OneToManyConfigSpecs } from '../../../insightsConfig/types';

export type FormFieldType = { value: string; error?: string; validation?: string[]; touched?: boolean };

export type FormInformation = {
  [key: string]: FormFieldType | FormInformation;
};

// Given a type T that defines a form (where each leaf is of type FormFieldType), infers the structure, with each leaf as the type of FormFieldType['value']
export type FormValues<T> = {
  [P in keyof T]: T[P] extends FormFieldType
    ? FormFieldType['value']
    : T[P] extends FormInformation
    ? FormValues<T[P]>
    : never;
};

export type DefaultEventHandlers = (
  parents: string[],
  name: string,
) => {
  handleBlur: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleFocus: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
};

/**
 * Types used for customizable forms
 */

type ItemBase = {
  name: string;
  label: string;
};

type InputDefinition = {
  type: 'input';
} & ItemBase &
  RegisterOptions;

type NumericInputDefinition = {
  type: 'numeric-input';
} & ItemBase &
  RegisterOptions;

export type SelectOption = { value: any; label: string };

type SelectDefinition = {
  type: 'select';
  options: SelectOption[];
  defaultOption?: SelectOption['value'];
} & ItemBase &
  RegisterOptions;

type DependentOptions = { [dependeeValue: string]: SelectOption[] };

type DependentSelectDefinition = {
  type: 'dependent-select';
  dependsOn: ItemBase['name'];
  defaultOption: SelectOption;
  options: DependentOptions;
} & ItemBase &
  RegisterOptions;

type CheckboxDefinition = {
  type: 'checkbox';
  initialChecked?: boolean;
} & ItemBase &
  RegisterOptions;

export type MixedOrBool = boolean | 'mixed';
type MixedCheckboxDefinition = {
  type: 'mixed-checkbox';
  initialChecked?: MixedOrBool;
} & ItemBase &
  RegisterOptions;

type TextareaDefinition = {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  width?: number;
} & ItemBase &
  RegisterOptions;

type DateInputDefinition = {
  type: 'date-input';
} & ItemBase &
  RegisterOptions;

type TimeInputDefinition = {
  type: 'time-input';
} & ItemBase &
  RegisterOptions;

export type FormItemDefinition =
  | InputDefinition
  | NumericInputDefinition
  | SelectDefinition
  | DependentSelectDefinition
  | CheckboxDefinition
  | MixedCheckboxDefinition
  | TextareaDefinition
  | DateInputDefinition
  | TimeInputDefinition;
export type FormDefinition = FormItemDefinition[];

export type CategoryEntry = { color: string; subcategories: string[] };
export type CategoriesDefinition = { [category: string]: CategoryEntry };

type CallTypeButtonsEntry = {
  type: 'button';
  name: string;
  label: CallTypes;
  category: 'data' | 'non-data';
};

export type CallTypeButtonsDefinitions = CallTypeButtonsEntry[];

/*
 * ToDo: improve this type by removing name property and using officeName as a key:
 * {
 *   office1: { ... },
 *   office2: { ... },
 * }
 */
export type OfficeEntry = {
  name: string;
  manager?: {
    name: string;
    phone: string;
    email: string;
  };
};

// ToDo: also this type can be defined as: OfficeDefinitions = { [officename: string]: OfficeEntry };
export type OfficeDefinitions = OfficeEntry[];

export type CannedResponsesDefinitions = {
  label: string;
  text: string;
}[];

/**
 * Type that gives extra info on how a single field should be formatted
 */
export type LayoutValue = { includeLabel: boolean; format?: 'date' };
export type LayoutDefinition = {
  previewFields?: ItemBase['name'][];
  layout?: { [name: string]: LayoutValue };
  splitFormAt?: number;
};

export type LayoutVersion = {
  contact: {
    callerInformation: LayoutDefinition;
    childInformation: LayoutDefinition;
    caseInformation: LayoutDefinition;
  };
  case: {
    households: LayoutDefinition;
    perpetrators: LayoutDefinition;
    incidents: LayoutDefinition;
    referrals: LayoutDefinition;
  };
};

type StatusInfo = {
  value: string;
  label: string;
  color: string; // color that represents this status in the UI
  transitions: string[]; // possible statuses this one can transition to (further update may be to include who can make such a transition for a more granular control)
};

/**
 * Type that defines a complete version for all the customizable forms used across the app
 */
export type DefinitionVersion = {
  caseForms: {
    HouseholdForm: FormDefinition;
    IncidentForm: FormDefinition;
    NoteForm: FormDefinition;
    PerpetratorForm: FormDefinition;
    ReferralForm: FormDefinition;
  };
  // TODO: change this property to contactForms to be consistent (though that may create confusion with the component name)
  tabbedForms: {
    CallerInformationTab: FormDefinition;
    CaseInformationTab: FormDefinition;
    ChildInformationTab: FormDefinition;
    IssueCategorizationTab: CategoriesDefinition;
  };
  callTypeButtons: CallTypeButtonsDefinitions;
  layoutVersion: LayoutVersion;
  officeInformation?: OfficeDefinitions;
  cannedResponses?: CannedResponsesDefinitions;
  insights: {
    oneToOneConfigSpec: OneToOneConfigSpec;
    oneToManyConfigSpecs: OneToManyConfigSpecs;
  };
  caseStatus: {
    [status: string]: StatusInfo;
  };
};
