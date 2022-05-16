/* eslint-disable import/no-unused-modules */
// eslint-disable-next-line import/no-extraneous-dependencies
import { RegisterOptions } from 'react-hook-form';
import { OneToOneConfigSpec, OneToManyConfigSpecs } from './insightsConfig';
import { CallTypeKeys } from './callTypes';

/**
 * Types used for customizable forms
 */
type ItemBase = {
  name: string;
  label: string;
} & RegisterOptions;

type InputDefinition = {
  type: 'input';
} & ItemBase;

type NumericInputDefinition = {
  type: 'numeric-input';
} & ItemBase;

type EmailInputDefinition = {
  type: 'email';
} & ItemBase;

export type InputOption = { value: any; label: string };

type RadioInputDefinition = {
  type: 'radio-input';
  options: InputOption[];
  defaultOption?: InputOption['value'];
} & ItemBase;

type ListboxMultiselectDefinition = {
  type: 'listbox-multiselect';
  options: InputOption[];
  height?: number;
  width?: number;
} & ItemBase;

export type SelectOption = { value: any; label: string };

type SelectDefinition = {
  type: 'select';
  options: SelectOption[];
  defaultOption?: SelectOption['value'];
  unknownOption?: SelectOption['value'];
} & ItemBase;

type DependentOptions = { [dependeeValue: string]: SelectOption[] };

type DependentSelectDefinition = {
  type: 'dependent-select';
  dependsOn: ItemBase['name'];
  defaultOption: SelectOption;
  options: DependentOptions;
} & ItemBase;

type CheckboxDefinition = {
  type: 'checkbox';
  initialChecked?: boolean;
} & ItemBase;

export type MixedOrBool = boolean | 'mixed';
type MixedCheckboxDefinition = {
  type: 'mixed-checkbox';
  initialChecked?: MixedOrBool;
} & ItemBase;

type TextareaDefinition = {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  width?: number;
} & ItemBase;

type TimeRelatedInput = {
  initializeWithCurrent?: boolean;
} & ItemBase;

type DateInputDefinition = {
  type: 'date-input';
} & TimeRelatedInput;

type TimeInputDefinition = {
  type: 'time-input';
} & TimeRelatedInput;

type FileUploadDefinition = {
  type: 'file-upload';
  description: string;
  onChange: () => void;
} & ItemBase;

type CallTypeButtonInputDefinition = {
  type: 'button';
  category: 'data' | 'non-data';
} & ItemBase;

export type FormItemDefinition =
  | InputDefinition
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
  | CallTypeButtonInputDefinition;
export type FormDefinition = FormItemDefinition[];

export type CategoryEntry = { color: string; subcategories: string[] };
export type CategoriesDefinition = { [category: string]: CategoryEntry };

export type CallTypeButtonsEntry = {
  type: 'button';
  name: CallTypeKeys;
  label: string;
  category: 'data' | 'non-data';
};

export type CallTypeButtonsDefinitions = CallTypeButtonsEntry[];

export type HelplineEntry = {
  label: string;
  value: string;
  default?: boolean;
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
    documents: LayoutDefinition;
    notes?: LayoutDefinition;
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
    DocumentForm: FormDefinition;
  };
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
  caseStatus: {
    [status: string]: StatusInfo;
  };
  prepopulateKeys: { ChildInformationTab: string[]; CallerInformationTab: string[] };
};
