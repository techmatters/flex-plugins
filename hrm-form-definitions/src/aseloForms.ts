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

import {
  DefinitionFileSpecification,
  DefinitionSpecification,
  FormDefinitionSpecification,
  FormItemDefinitionSpecification,
} from './specification';
import {
  FormInputType,
  OneToManyConfigSpecs,
  OneToOneConfigSpec,
  SelectOption,
} from './formDefinition';

export type FormFileSpecification = FormDefinitionSpecification & DefinitionFileSpecification;
export type JsonFileSpecification<T = any> = DefinitionSpecification<T> &
  DefinitionFileSpecification;
export type FormItemFileSpecification = FormItemDefinitionSpecification &
  DefinitionFileSpecification;
export type CaseStatus = {
  value: string;
  label: string;
  color: string;
  transitions: string[];
};

export type AseloFormTemplateDefinitions = {
  caseForms: {
    HouseholdForm: FormFileSpecification;
    IncidentForm: FormFileSpecification;
    NoteForm: FormFileSpecification;
    PerpetratorForm: FormFileSpecification;
    ReferralForm: FormFileSpecification;
    DocumentForm: FormFileSpecification;
    CaseSummaryForm: FormFileSpecification;
  };
  tabbedForms: {
    CallerInformationTab: FormFileSpecification;
    CaseInformationTab: FormFileSpecification;
    ChildInformationTab: FormFileSpecification;
    IssueCategorizationTab: JsonFileSpecification;
  };
  callTypeButtons: FormFileSpecification;
  layoutVersion: JsonFileSpecification;
  helplineInformation: FormItemFileSpecification;
  caseSectionTypes: JsonFileSpecification;
  cannedResponses: JsonFileSpecification<{ label: string; text: string }[]>;
  insights: {
    oneToOneConfigSpec: JsonFileSpecification<OneToOneConfigSpec>;
    oneToManyConfigSpecs: JsonFileSpecification<OneToManyConfigSpecs>;
  };
  caseStatus: JsonFileSpecification<Record<string, CaseStatus>>;
};

function generateAgeRangeOptions(from: number, to: number): SelectOption[] {
  return Array(to - from + 1)
    .fill(null)
    .map((_, i) => {
      const value = (from + i).toString();
      return {
        value,
        label: value,
      };
    });
}

export const aseloFormTemplates: AseloFormTemplateDefinitions = {
  caseForms: {
    HouseholdForm: {
      definitionFilePath: './caseForms/HouseholdForm.json',
      items: {
        firstName: {
          required: false,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: false,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        relationshipToChild: {
          required: false,
          default: {
            name: 'relationshipToChild',
            label: 'Relationship to child',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Caregiver', label: 'Caregiver' },
              { value: 'Friend', label: 'Friend' },
              { value: 'Grandparent', label: 'Grandparent' },
              { value: 'Neighbour', label: 'Neighbour' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Partner', label: 'Partner' },
              {
                value: 'Person in a position of responsibility',
                label: 'Person in a position of responsibility',
              },
              { value: 'Sibling', label: 'Sibling' },
              { value: 'Stranger', label: 'Stranger' },
              { value: 'Other', label: 'Other' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        streetAddress: {
          required: false,
          default: {
            name: 'streetAddress',
            label: 'Street Address',
            type: FormInputType.Input,
          },
        },
        province: {
          required: false,
          default: {
            name: 'province',
            label: 'Province',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: false,
          default: {
            name: 'district',
            label: 'District',
            type: FormInputType.DependentSelect,
            dependsOn: 'province',
            defaultOption: { value: '', label: '' },
            options: {
              District1: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
              District2: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
            },
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        phone1: {
          required: false,
          default: {
            name: 'phone1',
            label: 'Phone #1',
            type: FormInputType.Input,
          },
        },
        gender: {
          required: false,
          default: {
            name: 'gender',
            label: 'Gender',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Boy', label: 'Boy' },
              { value: 'Girl', label: 'Girl' },
              { value: 'Non-Binary', label: 'Non-Binary' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        age: {
          required: false,
          default: {
            name: 'age',
            label: 'Age',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              ...generateAgeRangeOptions(0, 60),
              { value: '>60', label: '>60' },
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Other', label: 'Other' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        language: {
          required: false,
          default: {
            name: 'language',
            label: 'Language',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'language1', label: 'language1' },
            ],
          },
        },
        ethnicity: {
          required: false,
          default: {
            name: 'ethnicity',
            label: 'Ethnicity',
            type: FormInputType.Input,
          },
        },
      },
    },
    IncidentForm: {
      definitionFilePath: './caseForms/IncidentForm.json',
      items: {
        date: {
          required: false,
          default: {
            name: 'date',
            label: 'Date',
            type: FormInputType.DateInput,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        duration: {
          required: false,
          default: {
            name: 'duration',
            label: 'Duration',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Ongoing', label: 'Ongoing' },
              { value: 'Once Off', label: 'Once Off' },
              { value: 'Other', label: 'Other' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        location: {
          required: false,
          default: {
            name: 'location',
            label: 'Location',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Unknown', label: 'Unknown' },
              { value: 'School', label: 'School' },
              { value: 'Home', label: 'Home' },
              { value: 'Institution', label: 'Institution' },
              { value: 'Online', label: 'Online' },
              { value: 'Public Place', label: 'Public Place' },
              { value: 'Other', label: 'Other' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        isCaregiverAware: {
          required: false,
          default: {
            name: 'isCaregiverAware',
            label: 'Is caregiver aware?',
            type: FormInputType.MixedCheckbox,
          },
        },
        incidentWitnessed: {
          required: false,
          default: {
            name: 'incidentWitnessed',
            label: 'Was the incident witnessed by anyone?',
            type: FormInputType.MixedCheckbox,
          },
        },
        abuseReportedElsewhere: {
          required: false,
          default: {
            name: 'abuseReportedElsewhere',
            label: 'Has abuse been reported elsewhere?',
            type: FormInputType.MixedCheckbox,
          },
        },
        whereElseBeenReported: {
          required: false,
          default: {
            name: 'whereElseBeenReported',
            label: 'Where else the incident has been reported?',
            type: FormInputType.MixedCheckbox,
          },
        },
      },
    },
    NoteForm: {
      definitionFilePath: './caseForms/NoteForm.json',
      items: {
        note: {
          required: false,
          default: {
            name: 'note',
            label: 'Note',
            type: FormInputType.Textarea,
            placeholder: 'Type here to add note...',
            rows: 20,
            width: 500,
          },
        },
      },
    },
    PerpetratorForm: {
      definitionFilePath: './caseForms/PerpetratorForm.json',
      items: {
        firstName: {
          required: false,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: false,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        relationshipToChild: {
          required: false,
          default: {
            name: 'relationshipToChild',
            label: 'Relationship to child',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Caregiver', label: 'Caregiver' },
              { value: 'Friend', label: 'Friend' },
              { value: 'Grandparent', label: 'Grandparent' },
              { value: 'Neighbour', label: 'Neighbour' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Partner', label: 'Partner' },
              {
                value: 'Person in a position of responsibility',
                label: 'Person in a position of responsibility',
              },
              { value: 'Sibling', label: 'Sibling' },
              { value: 'Stranger', label: 'Stranger' },
              { value: 'Other', label: 'Other' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        streetAddress: {
          required: false,
          default: {
            name: 'streetAddress',
            label: 'Street Address',
            type: FormInputType.Input,
          },
        },
        province: {
          required: false,
          default: {
            name: 'province',
            label: 'Province',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: false,
          default: {
            name: 'district',
            label: 'District',
            type: FormInputType.DependentSelect,
            dependsOn: 'province',
            defaultOption: { value: '', label: '' },
            options: {
              District1: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
              District2: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
            },
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        phone1: {
          required: false,
          default: {
            name: 'phone1',
            label: 'Phone #1',
            type: FormInputType.Input,
          },
        },
        gender: {
          required: false,
          default: {
            name: 'gender',
            label: 'Gender',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Boy', label: 'Boy' },
              { value: 'Girl', label: 'Girl' },
              { value: 'Non-Binary', label: 'Non-Binary' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        age: {
          required: false,
          default: {
            name: 'age',
            label: 'Age',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              ...generateAgeRangeOptions(0, 60),
              { value: '>60', label: '>60' },
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Other', label: 'Other' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        language: {
          required: false,
          default: {
            name: 'language',
            label: 'Language',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'language1', label: 'language1' },
            ],
          },
        },
        ethnicity: {
          required: false,
          default: {
            name: 'ethnicity',
            label: 'Ethnicity',
            type: FormInputType.Input,
          },
        },
      },
    },
    ReferralForm: {
      definitionFilePath: './caseForms/ReferralForm.json',
      items: {
        date: {
          required: false,
          default: {
            name: 'date',
            label: 'Date',
            type: FormInputType.DateInput,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        referredTo: {
          required: false,
          default: {
            name: 'referredTo',
            label: 'Referred To',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Clinic', label: 'Clinic' },
              { value: 'Hospital', label: 'Hospital' },
              { value: 'Social Welfare', label: 'Social Welfare' },
              { value: 'Police', label: 'Police' },
              { value: 'Religious leader', label: 'Religious leader' },
              { value: 'Other', label: 'Other' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        comment: {
          required: false,
          default: {
            name: 'comments',
            label: 'Comments',
            type: FormInputType.Textarea,
          },
        },
      },
    },
    DocumentForm: {
      definitionFilePath: './caseForms/DocumentForm.json',
      items: {},
    },
    CaseSummaryForm: {
      definitionFilePath: './caseForms/CaseSummaryForm.json',
      items: {},
    },
  },
  tabbedForms: {
    CallerInformationTab: {
      definitionFilePath: './tabbedForms/CallerInformationTab.json',
      items: {
        firstName: {
          required: false,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: false,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        relationshipToChild: {
          required: false,
          default: {
            name: 'relationshipToChild',
            label: 'Relationship to child',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'Caregiver', label: 'Caregiver' },
              { value: 'Friend', label: 'Friend' },
              { value: 'Grandparent', label: 'Grandparent' },
              { value: 'Neighbour', label: 'Neighbour' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Partner', label: 'Partner' },
              {
                value: 'Person in a position of responsibility',
                label: 'Person in a position of responsibility',
              },
              { value: 'Sibling', label: 'Sibling' },
              { value: 'Stranger', label: 'Stranger' },
              { value: 'Other', label: 'Other' },
            ],
          },
        },
        streetAddress: {
          required: false,
          default: {
            name: 'streetAddress',
            label: 'Street Address',
            type: FormInputType.Input,
          },
        },
        province: {
          required: false,
          default: {
            name: 'province',
            label: 'Province',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: false,
          default: {
            name: 'district',
            label: 'District',
            type: FormInputType.DependentSelect,
            dependsOn: 'province',
            defaultOption: { value: '', label: '' },
            options: {
              District1: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
              District2: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
            },
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        phone1: {
          required: false,
          default: {
            name: 'phone1',
            label: 'Phone #1',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        gender: {
          required: false,
          default: {
            name: 'gender',
            label: 'Gender',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'Boy', label: 'Boy' },
              { value: 'Girl', label: 'Girl' },
              { value: 'Non-Binary', label: 'Non-Binary' },
            ],
          },
        },
        age: {
          required: false,
          default: {
            name: 'age',
            label: 'Age',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              ...generateAgeRangeOptions(0, 25),
              { value: '>25', label: '>25' },
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Other', label: 'Other' },
            ],
          },
        },
        language: {
          required: false,
          default: {
            name: 'language',
            label: 'Language',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'language1', label: 'language1' },
            ],
          },
        },
        ethnicity: {
          required: false,
          default: {
            name: 'ethnicity',
            label: 'Ethnicity',
            type: FormInputType.Input,
          },
        },
      },
    },
    CaseInformationTab: {
      definitionFilePath: './tabbedForms/CaseInformationTab.json',
      items: {
        callSummary: {
          required: true,
          default: {
            name: 'callSummary',
            label: 'Contact Summary',
            type: FormInputType.Textarea,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        repeatCaller: {
          required: false,
          default: {
            name: 'repeatCaller',
            label: 'Repeat Caller?',
            type: FormInputType.MixedCheckbox,
          },
        },
        actionTaken: {
          required: false,
          default: {
            name: 'actionTaken',
            label: 'Action Taken',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: ' ' },
              { value: 'Action taken', label: 'Action taken' },
              { value: 'Other', label: 'Other' },
            ],
          },
        },
        okForCaseWorkerToCall: {
          required: false,
          default: {
            name: 'okForCaseWorkerToCall',
            label: 'Ok for case worker to call?',
            type: FormInputType.MixedCheckbox,
          },
        },
        didYouDiscussRightsWithTheChild: {
          required: false,
          default: {
            name: 'didYouDiscussRightsWithTheChild',
            label: 'Did you discuss rights with the child?',
            type: FormInputType.MixedCheckbox,
          },
        },
      },
    },
    ChildInformationTab: {
      definitionFilePath: './tabbedForms/ChildInformationTab.json',
      items: {
        firstName: {
          required: false,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: false,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        age: {
          required: true,
          default: {
            name: 'age',
            label: 'Age',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Unborn', label: 'Unborn' },
              ...generateAgeRangeOptions(0, 25),
              { value: '>25', label: '>25' },
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Other', label: 'Other' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        gender: {
          required: true,
          default: {
            name: 'gender',
            label: 'Gender',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Boy', label: 'Boy' },
              { value: 'Girl', label: 'Girl' },
              { value: 'Non-Binary', label: 'Non-Binary' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        streetAddress: {
          required: false,
          default: {
            name: 'streetAddress',
            label: 'Street Address',
            type: FormInputType.Input,
          },
        },
        province: {
          required: false,
          default: {
            name: 'province',
            label: 'Province',
            type: FormInputType.Select,
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: false,
          default: {
            name: 'district',
            label: 'District',
            type: FormInputType.DependentSelect,
            dependsOn: 'province',
            defaultOption: { value: '', label: '' },
            options: {
              District1: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
              District2: [
                { value: 'Subdistrict1', label: 'Subdistrict1' },
                { value: 'Unknown', label: 'Unknown' },
              ],
            },
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        phone1: {
          required: false,
          default: {
            name: 'phone1',
            label: 'Phone #1',
            type: FormInputType.Input,
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        language: {
          required: false,
          default: {
            name: 'language',
            label: 'Language',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'language1', label: 'language1' },
            ],
          },
        },
        ethnicity: {
          required: false,
          default: {
            name: 'ethnicity',
            label: 'Ethnicity',
            type: FormInputType.Input,
          },
        },
        schoolName: {
          required: false,
          default: {
            name: 'schoolName',
            label: 'School Name',
            type: FormInputType.Input,
          },
        },
        gradeLevel: {
          required: false,
          default: {
            name: 'gradeLevel',
            label: 'Grade Level',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'Grade 1 to 4', label: 'Grade 1 to 4' },
              { value: 'Grade 5 to 7', label: 'Grade 5 to 7' },
              { value: 'Grade 8 to 9', label: 'Grade 8 to 9' },
              { value: 'Grade 10 to 12', label: 'Grade 10 to 12' },
              { value: 'Out of school', label: 'Out of school' },
            ],
          },
        },
        livingSituation: {
          required: false,
          default: {
            name: 'livingSituation',
            label: 'Living Situation',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'Alternative care', label: 'Alternative care' },
              {
                value: 'Group residential facility',
                label: 'Group residential facility',
              },
              {
                value: 'Homeless or marginally housed',
                label: 'Homeless or marginally housed',
              },
              { value: 'In detention', label: 'In detention' },
              { value: 'Living independently', label: 'Living independently' },
              { value: 'With parent(s)', label: 'With parent(s)' },
              { value: 'With relatives', label: 'With relatives' },
              { value: 'Other', label: 'Other' },
            ],
          },
        },
        hivPositive: {
          required: false,
          default: {
            name: 'hivPositive',
            label: 'Child HIV Positive?',
            type: FormInputType.MixedCheckbox,
          },
        },
        livingInConflictZone: {
          required: false,
          default: {
            name: 'livingInConflictZone',
            label: 'Child living in conflict zone',
            type: FormInputType.MixedCheckbox,
          },
        },
        inConflictWithTheLaw: {
          required: false,
          default: {
            name: 'inConflictWithTheLaw',
            label: 'Child in conflict with the law',
            type: FormInputType.MixedCheckbox,
          },
        },
        livingInPoverty: {
          required: false,
          default: {
            name: 'livingInPoverty',
            label: 'Child living in poverty',
            type: FormInputType.MixedCheckbox,
          },
        },
        memberOfAnEthnic: {
          required: false,
          default: {
            name: 'memberOfAnEthnic',
            label: 'Child member of an ethnic, racial or religious minority',
            type: FormInputType.MixedCheckbox,
          },
        },
        childWithDisability: {
          required: false,
          default: {
            name: 'childWithDisability',
            label: 'Child with disability',
            type: FormInputType.MixedCheckbox,
          },
        },
        LGBTQI: {
          required: false,
          default: {
            name: 'LGBTQI+',
            label: 'LGBTQI+ / SOGIESC child',
            type: FormInputType.MixedCheckbox,
          },
        },
        childOnTheMove: {
          required: false,
          default: {
            name: 'childOnTheMove',
            label: 'Child on the move',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'Involuntary', label: 'Involuntary' },
              { value: 'Voluntary', label: 'Voluntary' },
            ],
          },
        },
        region: {
          required: false,
          default: {
            name: 'region',
            label: 'Region',
            type: FormInputType.Select,
            options: [
              { value: 'Unknown', label: '' },
              { value: 'Cities', label: 'Cities' },
              { value: 'Rural areas', label: 'Rural areas' },
              {
                value: 'Town & semi-dense areas',
                label: 'Town & semi-dense areas',
              },
            ],
          },
        },
      },
    },
    IssueCategorizationTab: {
      required: true,
      default: {
        'Example Helpline': {
          'Missing children': {
            color: '#BBE3FF',
            subcategories: [
              { label: 'Child abduction' },
              { label: 'Lost, unaccounted for or otherwise missing child' },
              { label: 'Runaway' },
              { label: 'Unspecified/Other' },
            ],
          },
          Violence: {
            color: '#F5A623',
            subcategories: [
              { label: 'Bullying' },
              { label: 'Child/Early/Forced marriage' },
              { label: 'Child labour' },
              { label: 'Commercial sexual exploitation (offline)' },
              { label: 'Female Genital Mutilation (FGM)' },
              { label: 'Gender-based harmful traditional practices (other than FGM)' },
              { label: 'Harmful traditional practices other than child marriage and FGM' },
              { label: 'Mental/Emotional violence' },
              { label: 'Neglect (or negligent treatment)' },
              { label: 'Online sexual abuse' },
              { label: 'Online sexual exploitation' },
              { label: 'Physical violence' },
              { label: 'Sexual violence' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Mental Health': {
            color: '#F8E900',
            subcategories: [
              { label: 'Addictive behaviours and substance use' },
              { label: 'Behavioural problems' },
              { label: 'Concerns about the self' },
              { label: 'Emotional distress – anger problems' },
              { label: 'Emotional distress – fear and anxiety problems' },
              { label: 'Emotional distress – mood problems' },
              { label: 'Neurodevelopmental concerns' },
              { label: 'Problems with eating behaviour' },
              { label: 'Self-harming behaviour' },
              { label: 'Suicidal thoughts and suicide attempts' },
              { label: 'Traumatic distress' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Physical Health': {
            color: '#E86B6B',
            subcategories: [
              { label: 'COVID-19' },
              { label: 'General medical or lifestyle concerns' },
              { label: 'Medical or lifestyle information about HIV/AIDS' },
              { label: 'Male circumcision' },
              { label: 'Pregnancy and maternal care' },
              { label: 'Sexual and reproductive health' },
              { label: 'Nutrition' },
              { label: 'Unspecified/Other' },
            ],
          },
          Accessibility: {
            color: '#8055BA',
            subcategories: [
              { label: 'Education' },
              { label: 'Essential needs' },
              { label: 'General healthcare services' },
              { label: 'Legal services and advice' },
              { label: 'Mental health services' },
              { label: 'Sexual health services' },
              { label: 'Socio-economical services' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Discrimination and Exclusion': {
            color: '#B971AF',
            subcategories: [
              { label: 'Ethnicity/nationality' },
              { label: 'Financial situation' },
              { label: 'Gender' },
              { label: 'Gender identity or expression and sexual orientation' },
              { label: 'Health' },
              { label: 'Philosophical or religious beliefs' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Family Relationships': {
            color: '#239613',
            subcategories: [
              { label: 'Adoption, fostering, and extended family placement' },
              { label: 'Relationship to caregiver' },
              { label: 'Family health and wellbeing' },
              { label: 'Relationship with sibling(s)' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Peer Relationships': {
            color: '#9AD703',
            subcategories: [
              { label: 'Friends and friendships' },
              { label: 'Partner relationships' },
              { label: 'Classmates/colleagues relationships' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Education and Occupation': {
            color: '#55AFAF',
            subcategories: [
              { label: 'Academic issues' },
              { label: 'Teacher and school problems' },
              { label: 'Problems at work' },
              { label: 'Unspecified/Other' },
            ],
          },
          Sexuality: {
            color: '#506BA5',
            subcategories: [
              { label: 'Sexual orientation and gender identity' },
              { label: 'Sexual behaviours' },
              { label: 'Unspecified/Other' },
            ],
          },
          'Non-Counselling contacts': {
            color: '#767777',
            subcategories: [
              { label: 'Complaints about the child helpline' },
              { label: 'Questions by parents' },
              { label: 'Questions about the child helpline' },
              { label: 'Questions about other services' },
              { label: '"Thank you for your assistance"' },
              { label: 'Unspecified/Other' },
            ],
          },
        },
      },
      definitionFilePath: './tabbedForms/IssueCategorizationTab.json',
    },
  },
  callTypeButtons: {
    definitionFilePath: './CallTypeButtons.json',
    items: {
      child: {
        required: false,
        default: {
          name: 'child',
          label: 'Child calling about self',
          type: FormInputType.Button,
          category: 'data',
        },
      },
      caller: {
        required: false,
        default: {
          name: 'caller',
          label: 'Someone calling about a child',
          type: FormInputType.Button,
          category: 'data',
        },
      },
      silent: {
        required: false,
        default: {
          name: 'silent',
          label: 'Silent',
          type: FormInputType.Button,
          category: 'non-data',
        },
      },
      blank: {
        required: false,
        default: {
          name: 'blank',
          label: 'Blank',
          type: FormInputType.Button,
          category: 'non-data',
        },
      },
      joke: {
        required: false,
        default: {
          name: 'joke',
          label: 'Joke',
          type: FormInputType.Button,
          category: 'non-data',
        },
      },
      hangup: {
        required: false,
        default: {
          name: 'hangup',
          label: 'Hang up',
          type: FormInputType.Button,
          category: 'non-data',
        },
      },
      wrongnumber: {
        required: false,
        default: {
          name: 'wrongnumber',
          label: 'Wrong Number',
          type: FormInputType.Button,
          category: 'non-data',
        },
      },
      abusive: {
        required: false,
        default: {
          name: 'abusive',
          label: 'Abusive',
          type: FormInputType.Button,
          category: 'non-data',
        },
      },
    },
  },
  layoutVersion: {
    definitionFilePath: './LayoutDefinitions.json',
    required: true,
    default: {
      contact: {
        callerInformation: {},
        childInformation: {},
        caseInformation: {
          splitFormAt: 4,
        },
      },
      case: {
        households: {
          splitFormAt: 7,
        },
        perpetrators: {
          splitFormAt: 7,
        },
        incidents: {
          previewFields: ['date', 'duration', 'location'],
          layout: {
            date: {
              includeLabel: false,
              format: 'date',
            },
            duration: {
              includeLabel: true,
            },
            location: {
              includeLabel: true,
            },
          },
          splitFormAt: 3,
        },
        referrals: {
          splitFormAt: 2,
        },
        documents: {
          splitFormAt: 1,
        },
      },
    },
  },
  caseSectionTypes: {
    definitionFilePath: './CaseSections.json',
    required: true,
  },
  helplineInformation: {
    definitionFilePath: './HelplineInformation.json',
    required: true,
  },
  cannedResponses: {
    required: true,
    definitionFilePath: './CannedResponses.json',
    default: [],
  },
  insights: {
    oneToOneConfigSpec: {
      required: true,
      definitionFilePath: './insights/oneToOneConfigSpec.json',
    },
    oneToManyConfigSpecs: {
      required: true,
      definitionFilePath: './insights/oneToManyConfigSpecs.json',
      default: [],
    },
  },
  caseStatus: {
    required: false,
    definitionFilePath: './CaseStatus.json',
    default: {
      open: {
        value: 'open',
        label: 'Open',
        color: 'green',
        transitions: ['closed'],
      },
      closed: {
        value: 'closed',
        label: 'Closed',
        color: 'red',
        transitions: ['open'],
      },
    },
  },
};
