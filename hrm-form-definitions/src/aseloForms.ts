import {
  DefinitionFileSpecification,
  DefinitionSpecification,
  FormDefinitionSpecification,
  FormItemDefinitionSpecification,
} from './specification';
import { OneToManyConfigSpecs, OneToOneConfigSpec, SelectOption } from './formDefinition';

type FormFileSpecification = FormDefinitionSpecification & DefinitionFileSpecification;
type JsonFileSpecification<T = any> = DefinitionSpecification<T> & DefinitionFileSpecification;
type FormItemFileSpecification = FormItemDefinitionSpecification & DefinitionFileSpecification;
type CaseStatus = {
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
          required: true,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: true,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        relationshipToChild: {
          required: true,
          default: {
            name: 'relationshipToChild',
            label: 'Relationship to child',
            type: 'select',
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
            type: 'input',
          },
        },
        province: {
          required: true,
          default: {
            name: 'province',
            label: 'Province',
            type: 'select',
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: true,
          default: {
            name: 'district',
            label: 'District',
            type: 'dependent-select',
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
            type: 'input',
          },
        },
        gender: {
          required: true,
          default: {
            name: 'gender',
            label: 'Gender',
            type: 'select',
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
          required: true,
          default: {
            name: 'age',
            label: 'Age',
            type: 'select',
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
            type: 'select',
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
            type: 'input',
          },
        },
      },
    },
    IncidentForm: {
      definitionFilePath: './caseForms/IncidentForm.json',
      items: {
        date: {
          required: true,
          default: {
            name: 'date',
            label: 'Date',
            type: 'date-input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        duration: {
          required: true,
          default: {
            name: 'duration',
            label: 'Duration',
            type: 'select',
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
          required: true,
          default: {
            name: 'location',
            label: 'Location',
            type: 'select',
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
            type: 'mixed-checkbox',
          },
        },
        incidentWitnessed: {
          required: false,
          default: {
            name: 'incidentWitnessed',
            label: 'Was the incident witnessed by anyone?',
            type: 'mixed-checkbox',
          },
        },
        abuseReportedElsewhere: {
          required: false,
          default: {
            name: 'abuseReportedElsewhere',
            label: 'Has abuse been reported elsewhere?',
            type: 'mixed-checkbox',
          },
        },
        whereElseBeenReported: {
          required: false,
          default: {
            name: 'whereElseBeenReported',
            label: 'Where else the incident has been reported?',
            type: 'mixed-checkbox',
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
            type: 'textarea',
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
          required: true,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: true,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        relationshipToChild: {
          required: true,
          default: {
            name: 'relationshipToChild',
            label: 'Relationship to child',
            type: 'select',
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
            type: 'input',
          },
        },
        province: {
          required: true,
          default: {
            name: 'province',
            label: 'Province',
            type: 'select',
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: true,
          default: {
            name: 'district',
            label: 'District',
            type: 'dependent-select',
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
            type: 'input',
          },
        },
        gender: {
          required: true,
          default: {
            name: 'gender',
            label: 'Gender',
            type: 'select',
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
          required: true,
          default: {
            name: 'age',
            label: 'Age',
            type: 'select',
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
            type: 'select',
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
            type: 'input',
          },
        },
      },
    },
    ReferralForm: {
      definitionFilePath: './caseForms/ReferralForm.json',
      items: {
        date: {
          required: true,
          default: {
            name: 'date',
            label: 'Date',
            type: 'date-input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        referredTo: {
          required: true,
          default: {
            name: 'referredTo',
            label: 'Referred To',
            type: 'select',
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
            type: 'textarea',
          },
        },
      },
    },
    DocumentForm: {
      definitionFilePath: './caseForms/DocumentForm.json',
      items: {},
    },
  },
  tabbedForms: {
    CallerInformationTab: {
      definitionFilePath: './tabbedForms/CallerInformationTab.json',
      items: {
        firstName: {
          required: true,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: true,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        relationshipToChild: {
          required: false,
          default: {
            name: 'relationshipToChild',
            label: 'Relationship to child',
            type: 'select',
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
            type: 'input',
          },
        },
        province: {
          required: true,
          default: {
            name: 'province',
            label: 'Province',
            type: 'select',
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: true,
          default: {
            name: 'district',
            label: 'District',
            type: 'dependent-select',
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
          required: true,
          default: {
            name: 'phone1',
            label: 'Phone #1',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        gender: {
          required: false,
          default: {
            name: 'gender',
            label: 'Gender',
            type: 'select',
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
            type: 'select',
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
            type: 'select',
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
            type: 'input',
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
            type: 'textarea',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        repeatCaller: {
          required: false,
          default: {
            name: 'repeatCaller',
            label: 'Repeat Caller?',
            type: 'mixed-checkbox',
          },
        },
        actionTaken: {
          required: false,
          default: {
            name: 'actionTaken',
            label: 'Action Taken',
            type: 'select',
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
            type: 'mixed-checkbox',
          },
        },
        didYouDiscussRightsWithTheChild: {
          required: false,
          default: {
            name: 'didYouDiscussRightsWithTheChild',
            label: 'Did you discuss rights with the child?',
            type: 'mixed-checkbox',
          },
        },
      },
    },
    ChildInformationTab: {
      definitionFilePath: './tabbedForms/ChildInformationTab.json',
      items: {
        firstName: {
          required: true,
          default: {
            name: 'firstName',
            label: 'First Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        lastName: {
          required: true,
          default: {
            name: 'lastName',
            label: 'Last Name',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        age: {
          required: true,
          default: {
            name: 'age',
            label: 'Age',
            type: 'select',
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
            type: 'select',
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
            type: 'input',
          },
        },
        province: {
          required: true,
          default: {
            name: 'province',
            label: 'Province',
            type: 'select',
            options: [
              { value: '', label: '' },
              { value: 'Central', label: 'Central' },
              { value: 'Unknown', label: 'Unknown' },
            ],
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        district: {
          required: true,
          default: {
            name: 'district',
            label: 'District',
            type: 'dependent-select',
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
          required: true,
          default: {
            name: 'phone1',
            label: 'Phone #1',
            type: 'input',
            required: { value: true, message: 'RequiredFieldError' },
          },
        },
        language: {
          required: false,
          default: {
            name: 'language',
            label: 'Language',
            type: 'select',
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
            type: 'input',
          },
        },
        schoolName: {
          required: false,
          default: {
            name: 'schoolName',
            label: 'School Name',
            type: 'input',
          },
        },
        gradeLevel: {
          required: false,
          default: {
            name: 'gradeLevel',
            label: 'Grade Level',
            type: 'select',
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
            type: 'select',
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
            type: 'mixed-checkbox',
          },
        },
        livingInConflictZone: {
          required: false,
          default: {
            name: 'livingInConflictZone',
            label: 'Child living in conflict zone',
            type: 'mixed-checkbox',
          },
        },
        inConflictWithTheLaw: {
          required: false,
          default: {
            name: 'inConflictWithTheLaw',
            label: 'Child in conflict with the law',
            type: 'mixed-checkbox',
          },
        },
        livingInPoverty: {
          required: false,
          default: {
            name: 'livingInPoverty',
            label: 'Child living in poverty',
            type: 'mixed-checkbox',
          },
        },
        memberOfAnEthnic: {
          required: false,
          default: {
            name: 'memberOfAnEthnic',
            label: 'Child member of an ethnic, racial or religious minority',
            type: 'mixed-checkbox',
          },
        },
        childWithDisability: {
          required: false,
          default: {
            name: 'childWithDisability',
            label: 'Child with disability',
            type: 'mixed-checkbox',
          },
        },
        LGBTQI: {
          required: false,
          default: {
            name: 'LGBTQI+',
            label: 'LGBTQI+ / SOGIESC child',
            type: 'mixed-checkbox',
          },
        },
        childOnTheMove: {
          required: false,
          default: {
            name: 'childOnTheMove',
            label: 'Child on the move',
            type: 'select',
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
            type: 'select',
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
              'Child abduction',
              'Lost, unaccounted for or otherwise missing child',
              'Runaway',
              'Unspecified/Other',
            ],
          },
          Violence: {
            color: '#F5A623',
            subcategories: [
              'Bullying',
              'Child/Early/Forced marriage',
              'Child labour',
              'Commercial sexual exploitation (offline)',
              'Female Genital Mutilation (FGM)',
              'Gender-based harmful traditional practices (other than FGM)',
              'Harmful traditional practices other than child marriage and FGM',
              'Mental/Emotional violence',
              'Neglect (or negligent treatment)',
              'Online sexual abuse',
              'Online sexual exploitation',
              'Physical violence',
              'Sexual violence',
              'Unspecified/Other',
            ],
          },
          'Mental Health': {
            color: '#F8E900',
            subcategories: [
              'Addictive behaviours and substance use',
              'Behavioural problems',
              'Concerns about the self',
              'Emotional distress – anger problems',
              'Emotional distress – fear and anxiety problems',
              'Emotional distress – mood problems',
              'Neurodevelopmental concerns',
              'Problems with eating behaviour',
              'Self-harming behaviour',
              'Suicidal thoughts and suicide attempts',
              'Traumatic distress',
              'Unspecified/Other',
            ],
          },
          'Physical Health': {
            color: '#E86B6B',
            subcategories: [
              'COVID-19',
              'General medical or lifestyle concerns',
              'Medical or lifestyle information about HIV/AIDS',
              'Male circumcision',
              'Pregnancy and maternal care',
              'Sexual and reproductive health',
              'Nutrition',
              'Unspecified/Other',
            ],
          },
          Accessibility: {
            color: '#8055BA',
            subcategories: [
              'Education',
              'Essential needs',
              'General healthcare services',
              'Legal services and advice',
              'Mental health services',
              'Sexual health services',
              'Socio-economical services',
              'Unspecified/Other',
            ],
          },
          'Discrimination and Exclusion': {
            color: '#B971AF',
            subcategories: [
              'Ethnicity/nationality',
              'Financial situation',
              'Gender',
              'Gender identity or expression and sexual orientation',
              'Health',
              'Philosophical or religious beliefs',
              'Unspecified/Other',
            ],
          },
          'Family Relationships': {
            color: '#239613',
            subcategories: [
              'Adoption, fostering, and extended family placement',
              'Relationship to caregiver',
              'Family health and wellbeing',
              'Relationship with sibling(s)',
              'Unspecified/Other',
            ],
          },
          'Peer Relationships': {
            color: '#9AD703',
            subcategories: [
              'Friends and friendships',
              'Partner relationships',
              'Classmates/colleagues relationships',
              'Unspecified/Other',
            ],
          },
          'Education and Occupation': {
            color: '#55AFAF',
            subcategories: [
              'Academic issues',
              'Teacher and school problems',
              'Problems at work',
              'Unspecified/Other',
            ],
          },
          Sexuality: {
            color: '#506BA5',
            subcategories: [
              'Sexual orientation and gender identity',
              'Sexual behaviours',
              'Unspecified/Other',
            ],
          },
          'Non-Counselling contacts': {
            color: '#767777',
            subcategories: [
              'Complaints about the child helpline',
              'Questions by parents',
              'Questions about the child helpline',
              'Questions about other services',
              '"Thank you for your assistance"',
              'Unspecified/Other',
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
          type: 'button',
          category: 'data',
        },
      },
      caller: {
        required: false,
        default: {
          name: 'caller',
          label: 'Someone calling about a child',
          type: 'button',
          category: 'data',
        },
      },
      silent: {
        required: false,
        default: {
          name: 'silent',
          label: 'Silent',
          type: 'button',
          category: 'non-data',
        },
      },
      blank: {
        required: false,
        default: {
          name: 'blank',
          label: 'Blank',
          type: 'button',
          category: 'non-data',
        },
      },
      joke: {
        required: false,
        default: {
          name: 'joke',
          label: 'Joke',
          type: 'button',
          category: 'non-data',
        },
      },
      hangup: {
        required: false,
        default: {
          name: 'hangup',
          label: 'Hang up',
          type: 'button',
          category: 'non-data',
        },
      },
      wrongnumber: {
        required: false,
        default: {
          name: 'wrongnumber',
          label: 'Wrong Number',
          type: 'button',
          category: 'non-data',
        },
      },
      abusive: {
        required: false,
        default: {
          name: 'abusive',
          label: 'Abusive',
          type: 'button',
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
  helplineInformation: {
    definitionFilePath: './HelplineInformation.json',
    required: true,
    default: [],
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
