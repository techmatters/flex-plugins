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

export enum FormInputType {
  Input = 'input',
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

/**
 * Types used for customizable forms
 */
type ItemBase = {
  name: string;
  label: string;
  type: FormInputType;
} & RegisterOptions;

type NonSaveable = {
  saveable: false;
};

export const isNonSaveable = (item: any): item is NonSaveable =>
  typeof item.saveable === 'boolean' && !item.saveable;

type InputDefinition = {
  type: FormInputType.Input;
} & ItemBase;

type NumericInputDefinition = {
  type: FormInputType.NumericInput;
} & ItemBase;

type EmailInputDefinition = {
  type: FormInputType.Email;
} & ItemBase;

export type InputOption = { value: any; label: string };

type RadioInputDefinition = {
  type: FormInputType.RadioInput;
  options: InputOption[];
  defaultOption?: InputOption['value'];
} & ItemBase;

type ListboxMultiselectDefinition = {
  type: FormInputType.ListboxMultiselect;
  options: InputOption[];
  height?: number;
  width?: number;
} & ItemBase;

export type SelectOption = { value: any; label: string };

type BaseSelectDefinition = {
  type: FormInputType.Select;
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

type CopyToDefinition = ItemBase &
  NonSaveable & {
    type: FormInputType.CopyTo;
    initialChecked: false;
    target: CaseSectionApiName;
  };

type CustomContactComponentDefinition = ItemBase &
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
};

export declare type ProfileBlockDefinition = {
  flag: string;
  label: string;
  timeFrameInHours: string;
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
  thaiCharacterPdfSupport?: boolean;
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
  referenceData?: Record<string, any>;
  blockedEmojis: string[];
  profileForms?: {
    Sections: ProfileSectionDefinition[];
    FlagDurations: ProfileBlockDefinition[];
  };
};
