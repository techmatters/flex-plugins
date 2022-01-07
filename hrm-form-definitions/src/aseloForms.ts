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
      items: {},
    },
    IncidentForm: {
      definitionFilePath: './caseForms/IncidentForm.json',
      items: {},
    },
    NoteForm: {
      definitionFilePath: './caseForms/NoteForm.json',
      items: {},
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
      },
    },
    ReferralForm: {
      definitionFilePath: './caseForms/ReferralForm.json',
      items: {},
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
              ...generateAgeRangeOptions(0, 60),
              { value: '>60', label: '>60' },
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
      },
    },
    IssueCategorizationTab: {
      required: true,
      default: {},
      definitionFilePath: './tabbedForms/IssueCategorizationTab.json',
    },
  },
  callTypeButtons: {
    definitionFilePath: './CallTypeButtons.json',
    items: {
      child: {
        required: true,
        default: {
          name: 'child',
          label: 'Child calling about self',
          type: 'button',
          category: 'data',
        },
      },
      caller: {
        required: true,
        default: {
          name: 'caller',
          label: 'Someone calling about a child',
          type: 'button',
          category: 'data',
        },
      },
    },
  },
  layoutVersion: {
    definitionFilePath: './LayoutDefinitions.json',
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
    required: true,
    definitionFilePath: './CaseStatus.json',
    default: {},
  },
};
