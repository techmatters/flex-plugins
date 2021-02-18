import type { ValidationRules } from 'react-hook-form';

import { CallTypes } from '../../../states/DomainConstants';

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
  ValidationRules;

type NumericInputDefinition = {
  type: 'numeric-input';
} & ItemBase &
  ValidationRules;

export type SelectOption = { value: any; label: string };

type SelectDefinition = {
  type: 'select';
  options: SelectOption[];
} & ItemBase &
  ValidationRules;

type DependentOptions = { [dependeeValue: string]: SelectOption[] };

type DependentSelectDefinition = {
  type: 'dependent-select';
  dependsOn: ItemBase['name'];
  defaultOption: SelectOption;
  options: DependentOptions;
} & ItemBase &
  ValidationRules;

type CheckboxDefinition = {
  type: 'checkbox';
  initialChecked?: boolean;
} & ItemBase &
  ValidationRules;

export type MixedOrBool = boolean | 'mixed';
type MixedCheckboxDefinition = {
  type: 'mixed-checkbox';
  initialChecked?: MixedOrBool;
} & ItemBase &
  ValidationRules;

type TextareaDefinition = {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  width?: number;
} & ItemBase &
  ValidationRules;

type DateInputDefinition = {
  type: 'date-input';
} & ItemBase &
  ValidationRules;

type TimeInputDefinition = {
  type: 'time-input';
} & ItemBase &
  ValidationRules;

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
};
