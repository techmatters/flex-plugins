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

import { OneToManyConfigSpecs, OneToOneConfigSpec } from './insightsConfig';
import { CallTypeKeys } from './callTypes';
import { LayoutVersion } from './layoutVersion';

export enum FormInputType {
  Input = 'input',
  SearchInput = 'search-input',
  NumericInput = 'numeric-input',
  Email = 'email',
  RadioInput = 'radio-input',
  ListboxMultiselect = 'listbox-multiselect',
  Select = 'select',
  DependentSelect = 'dependent-select',
  Checkbox = 'checkbox',
  MixedCheckbox = 'mixed-checkbox',
  Textarea = 'textarea',
  DateInput = 'date-input',
  TimeInput = 'time-input',
  FileUpload = 'file-upload',
  Button = 'button',
  CopyTo = 'copy-to',
  CustomContactComponent = 'custom-contact-component',
}

type IsPIIFlag = {
  isPII?: boolean;
};

/**
 * Types used for customizable forms
 */

/**
 * Base type for all form items
 * @param name - the name of the field, used to reference this field in code and other parts of the form definitions such as LayoutDefinition.json
 * @param label - the label to display for this field, can (should) be a translation key
 * @param type - the type of the field, this determines the basic behaviour of the generated form element and which additional properties are supported
 * @param metadata - additional properties that don't directly affect
 */
type ItemBase = {
  name: string;
  label: string;
  type: FormInputType;
  metadata?: Record<string, any>;
  required?: { value: boolean; message: string } | boolean;
  maxLength?: { value: number; message: string };
  validate?: (data: any) => string | boolean;
} & IsPIIFlag;

type NonSaveable = {
  saveable: false;
};

export const isNonSaveable = (item: any): item is NonSaveable =>
  typeof item.saveable === 'boolean' && !item.saveable;

/**
 * Type for single line text inputs
 */
type InputDefinition = {
  type: FormInputType.Input;
} & ItemBase;

/**
 * Specialised single line text input for search fields
 */
type SearchInputDefinition = {
  type: FormInputType.SearchInput;
} & ItemBase;

/**
 * Specialised single line text input that only accepts numbers
 */
type NumericInputDefinition = {
  type: FormInputType.NumericInput;
} & ItemBase;

/**
 * Specialised single line text input that requires an email address
 */
type EmailInputDefinition = {
  type: FormInputType.Email;
} & ItemBase;

/**
 * Option type used for lists and radio button selections
 * @param value - the value to use when this option is selected
 * @param label - the label to display for this option in the UI - doesn't currently support translation keys but should do
 */
export type InputOption = { value: any; label: string };

/**
 * A set of radio buttons, where only one option can be selected
 * @param options - the options to display as radio buttons
 * @param defaultOption - the value of the option that should be selected by default - if not set, no option will be selected by default
 */
type RadioInputDefinition = {
  type: FormInputType.RadioInput;
  options: InputOption[];
  defaultOption?: InputOption;
} & ItemBase;

/**
 * A list box that allows multiple options to be selected
 * @param options - the options to display in the list box
 * @param height - the height of the list box in pixels - should support strings to allow for other units
 * @param width - the width of the list box in pixels - should support strings to allow for other units
 */
type ListboxMultiselectDefinition = {
  type: FormInputType.ListboxMultiselect;
  options: InputOption[];
  height?: number;
  width?: number;
} & ItemBase;

export type SelectOption = { value: any; label: string };

type BaseSelectDefinition = {
  type: FormInputType.Select;
  defaultOption?: SelectOption;
  unknownOption?: SelectOption['value'];
} & ItemBase;

type SelectDefinition = BaseSelectDefinition & {
  options: SelectOption[];
} & ItemBase;

export type SelectDefinitionWithReferenceOptions = BaseSelectDefinition & {
  optionsReferenceKey: string;
} & ItemBase;

export const isSelectDefinitionWithReferenceOptions = (
  item: any,
): item is SelectDefinitionWithReferenceOptions =>
  item.type === 'select' && typeof (<any>item).optionsReferenceKey === 'string';

export type DependentOptions = { [dependeeValue: string]: SelectOption[] };

type DependentSelectDefinitionBase = {
  type: FormInputType.DependentSelect;
  dependsOn: ItemBase['name'];
  defaultOption: SelectOption;
} & ItemBase;

type DependentSelectDefinition = DependentSelectDefinitionBase & {
  options: DependentOptions;
};

type DependentSelectDefinitionWithReferenceOptions = DependentSelectDefinitionBase & {
  optionsReferenceKey: string;
};

export const isDependentSelectDefinitionWithReferenceOptions = (
  item: any,
): item is DependentSelectDefinitionWithReferenceOptions =>
  item.type === 'dependent-select' && typeof (<any>item).optionsReferenceKey === 'string';

type CheckboxDefinition = {
  type: FormInputType.Checkbox;
  initialChecked?: boolean;
} & ItemBase;

export type MixedOrBool = boolean | 'mixed';
type MixedCheckboxDefinition = {
  type: FormInputType.MixedCheckbox;
  initialChecked?: MixedOrBool;
} & ItemBase;

type TextareaDefinition = {
  type: FormInputType.Textarea;
  placeholder?: string;
  rows?: number;
  width?: number | string;
  additionalActions?: CustomContactComponentDefinition[];
} & ItemBase;

type TimeRelatedInput = {
  initializeWithCurrent?: boolean;
} & ItemBase;

type DateInputDefinition = {
  type: FormInputType.DateInput;
} & TimeRelatedInput;

type TimeInputDefinition = {
  type: FormInputType.TimeInput;
} & TimeRelatedInput;

type FileUploadDefinition = {
  type: FormInputType.FileUpload;
  description: string;
  onChange: () => void;
} & ItemBase;

type CallTypeButtonInputDefinition = {
  type: FormInputType.Button;
  category: 'data' | 'non-data';
} & ItemBase;

type CopyToDefinition = ItemBase & {
  type: FormInputType.CopyTo;
  initialChecked: false;
  target: string;
};

export type CustomContactComponentDefinition = ItemBase &
  NonSaveable & {
    type: FormInputType.CustomContactComponent;
    component: string;
    props?: Record<string, boolean | number | string>;
  };

export declare type ProfileSectionDefinition = {
  name: string;
  label: string;
  editLabel: string;
  type: string;
  rows: number;
  placeholder: string;
  width: number;
} & IsPIIFlag;

export declare type ProfileFlagDurationDefinition = {
  flag: string;
  label: string;
  durationInHours: string;
};

export type FormItemDefinition =
  | InputDefinition
  | SearchInputDefinition
  | NumericInputDefinition
  | EmailInputDefinition
  | RadioInputDefinition
  | ListboxMultiselectDefinition
  | SelectDefinition
  | DependentSelectDefinition
  | CheckboxDefinition
  | MixedCheckboxDefinition
  | TextareaDefinition
  | DateInputDefinition
  | TimeInputDefinition
  | FileUploadDefinition
  | CallTypeButtonInputDefinition
  | CopyToDefinition
  | CustomContactComponentDefinition;

export type FormItemJsonDefinition =
  | FormItemDefinition
  | SelectDefinitionWithReferenceOptions
  | DependentSelectDefinitionWithReferenceOptions;

export type FormDefinition = FormItemDefinition[];

export type CategoryEntry = {
  color: string;
  subcategories: { label: string; toolkitUrl?: string }[];
};
export type CategoriesDefinition = { [category: string]: CategoryEntry };

export type CallTypeButtonsEntry = {
  type: 'button';
  name: CallTypeKeys;
  label: string;
  category: 'data' | 'non-data';
};

export type CallTypeButtonsDefinitions = CallTypeButtonsEntry[];

/**
 * Case filter definition
 */
export type CaseFilterType = 'multi-select' | 'date-input';
export type CaseFilterPosition = 'left' | 'right';

export type CaseFilterConfig = {
  searchable?: boolean;
  type?: CaseFilterType;
  allowFutureDates?: boolean;
  component?: string;
  position: CaseFilterPosition;
};

export type CaseFiltersDefinition = Record<string, CaseFilterConfig>;

/**
 * Status info definition
 */
export type StatusInfo = {
  value: string;
  label: string;
  color: string; // color that represents this status in the UI
  transitions: string[]; // possible statuses this one can transition to (further update may be to include who can make such a transition for a more granular control)
};

/**
 * Case overview definition
 */
export type CaseOverviewTypeEntry = {
  name: string;
  label: string;
  type: string;
  form: FormDefinition;
};

export type CaseOverviewDefinition = Record<'status', CaseOverviewTypeEntry> &
  Record<string, CaseOverviewTypeEntry>;

/**
 * Case section definition
 */
export type CaseSectionTypeJsonEntry = {
  label: string;
  formPath: string;
};

export type CaseSectionTypeEntry = {
  label: string;
  form: FormDefinition;
};

export type CaseSectionTypeDefinitions = Record<string, CaseSectionTypeEntry>;

export type HelplineEntry = {
  label: string;
  value: string;
  default?: boolean;
  kmsUrl?: string;
  manager?: {
    name: string;
    phone: string;
    email: string;
  };
};

export type HelplineDefinitions = {
  label: string;
  helplines: HelplineEntry[];
};

export type CannedResponsesDefinitions = {
  label: string;
  text: string;
}[];

export type LocalizedStringMap = {
  [language: string]: {
    [key: string]: string;
  };
};

export type FullyQualifiedFieldReference = `${keyof DefinitionVersion['tabbedForms']}.${string}`;
/**
 * Type that defines a complete version for all the customizable forms used across the app
 */
export type DefinitionVersion = {
  caseStatus: {
    [status: string]: StatusInfo;
  };
  caseOverview: CaseOverviewDefinition;
  caseFilters: CaseFiltersDefinition;
  caseSectionTypes: CaseSectionTypeDefinitions;
  // TODO: change this property to contactForms to be consistent (though that may create confusion with the component name)
  tabbedForms: {
    CallerInformationTab: FormDefinition;
    CaseInformationTab: FormDefinition;
    ChildInformationTab: FormDefinition;
    IssueCategorizationTab: (helpline: string) => CategoriesDefinition;
    ContactlessTaskTab: { offlineChannels?: string[] };
  };
  callTypeButtons: CallTypeButtonsDefinitions;
  layoutVersion: LayoutVersion;
  helplineInformation: HelplineDefinitions;
  cannedResponses?: CannedResponsesDefinitions;
  insights: {
    oneToOneConfigSpec: OneToOneConfigSpec;
    oneToManyConfigSpecs: OneToManyConfigSpecs;
  };
  /**
   * @deprecated - this is the legacy prepopulation configuration. Use prepopulationMappings for all new code
   */
  prepopulateKeys?: {
    survey: {
      ChildInformationTab: string[];
      CallerInformationTab: string[];
    };
    preEngagement: {
      ChildInformationTab: string[];
      CallerInformationTab: string[];
      CaseInformationTab: string[];
    };
  };
  prepopulateMappings: {
    /**
     * The config for the survey and preEngagement values is:
     * An object, with each key, as it appears in the set of values provided in the task
     * The value is a 2d array of strings representing the field which they target.
     * The field names must be in the form '<form name>.<field name>', e.g. ChildInformationTab.gender
     * The top level array represents the fields that must ALL be targeted.
     * So
     * "gender": [["ChildInformationTab.gender"], ["CaseInformationTab.gender]]
     * would target both fields
     * The lower level represents a list of fields that it will populate thw first available one for.
     * So
     * "gender": [["CallerInformationTab.gender", "ChildInformationTab.gender"], ["CaseInformationTab.gender"]]
     * Would target CallerInformationTab.gender if it is available, or ChildInformationTab.gender if not.
     * It would also target "CaseInformationTab.gender"
     * In the JSON, strings are assumed to be single item arrays if not already wrapped in two levels of arrays
     * So
     * "gender": ["ChildInformationTab.gender", "CaseInformationTab.gender"]
     * is equivalent to
     * "gender": [["ChildInformationTab.gender"], ["CaseInformationTab.gender]]
     * and
     * "gender": "ChildInformationTab.gender"
     * is equivalent to
     * "gender": [["ChildInformationTab.gender"]]
     */
    survey: Record<string, FullyQualifiedFieldReference[][]>;
    preEngagement: Record<string, FullyQualifiedFieldReference[][]>;
  };
  referenceData?: Record<string, any>;
  blockedEmojis: string[];
  profileForms?: {
    Sections: ProfileSectionDefinition[];
    FlagDurations: ProfileFlagDurationDefinition[];
  };
  customStrings?: {
    Messages: LocalizedStringMap;
    Substitutions: LocalizedStringMap;
  };
};
