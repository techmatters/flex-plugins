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
