/* eslint-disable import/no-unused-modules */
// eslint-disable-next-line import/no-extraneous-dependencies
import { RegisterOptions } from 'react-hook-form';
import { OneToOneConfigSpec, OneToManyConfigSpecs } from './insightsConfig';
import { CallTypeKeys } from './callTypes';

export enum CaseSectionApiName {
  Notes = 'notes',
  Households = 'households',
  Perpetrators = 'perpetrators',
  Incidents = 'incidents',
  Referrals = 'referrals',
  Documents = 'documents',
}

/**
 * Types used for customizable forms
 */
type ItemBase = {
  name: string;
  label: string;
} & RegisterOptions;

type NonSaveable = {
  saveable: false;
};

export const isNonSaveable = (item: any): item is NonSaveable =>
  typeof item.saveable === 'boolean' && !item.saveable;

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

type BaseSelectDefinition = {
  type: 'select';
  defaultOption?: SelectOption['value'];
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
  type: 'dependent-select';
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

type CopyToDefinition = ItemBase &
  NonSaveable & {
    type: 'copy-to';
    initialChecked: false;
    target: CaseSectionApiName;
  };

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
  | CallTypeButtonInputDefinition
  | CopyToDefinition;

export type FormItemJsonDefinition =
  | FormItemDefinition
  | SelectDefinitionWithReferenceOptions
  | DependentSelectDefinitionWithReferenceOptions;

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
    hideCounselorDetails?: boolean;
    households: LayoutDefinition;
    perpetrators: LayoutDefinition;
    incidents: LayoutDefinition;
    referrals: LayoutDefinition;
    documents: LayoutDefinition;
    notes?: LayoutDefinition;
  };
};

export type StatusInfo = {
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
  referenceData?: Record<string, any>;
};
