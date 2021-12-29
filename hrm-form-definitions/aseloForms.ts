import {
  DefinitionFileSpecification,
  DefinitionSpecification,
  FormDefinitionSpecification, FormItemDefinitionSpecification
} from './specification';

type FormFileSpecification = FormDefinitionSpecification & DefinitionFileSpecification
type JsonFileSpecification<T = any> = DefinitionSpecification<T> & DefinitionFileSpecification
type FormItemFileSpecification = FormItemDefinitionSpecification & DefinitionFileSpecification

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
  cannedResponses: JsonFileSpecification<{label: string, text: string}[]>;
  insights: {
    oneToOneConfigSpec: JsonFileSpecification;
    oneToManyConfigSpecs: JsonFileSpecification<[]>;
  };
  caseStatus: JsonFileSpecification<Record<string, {
    "value": string,
    "label": string,
    "color": string,
    "transitions": string[]
  }>>;
};

export const aseloFormTemplates: AseloFormTemplateDefinitions =
  {
    caseForms: {
      HouseholdForm: {
        definitionFilePath: './caseForms/HouseholdForm.json',
        items:{}
      },
      IncidentForm: {
        definitionFilePath: './caseForms/IncidentForm.json',
        items:{}
      },
      NoteForm: {
        definitionFilePath: './caseForms/NoteForm.json',
        items:{}
      },
      PerpetratorForm: {
        definitionFilePath: './caseForms/PerpetratorForm.json',
        items:{}
      },
      ReferralForm: {
        definitionFilePath: './caseForms/ReferralForm.json',
        items:{}
      },
      DocumentForm: {
        definitionFilePath: './caseForms/HouseholdForm.json',
        items:{}
      }
    },
    tabbedForms: {
      CallerInformationTab: {
        definitionFilePath: './tabbedForms/CallerInformationTab.json',
        items:{}
      },
      CaseInformationTab: {
        definitionFilePath: './tabbedForms/CaseInformationTab.json',
        items:{}
      },
      ChildInformationTab: {
        definitionFilePath: './tabbedForms/ChildInformationTab.json',
        items:{}
      },
      IssueCategorizationTab : {
        required: true,
        default: {},
        definitionFilePath: './tabbedForms/IssueCategorizationTab.json',
      }
    },
    callTypeButtons: {
      definitionFilePath: './CallTypeButtons.json',
      items: {}
    },
    layoutVersion: {
      definitionFilePath: './LayoutDefinition.json',
      required: true
    },
    helplineInformation: {
      definitionFilePath: './HelplineInformation.json',
      required: true
    },
    cannedResponses: {
      required: true,
      definitionFilePath: './CannedResponses.json',
      default: []
    },
    insights: {
      oneToOneConfigSpec: {
        required: true,
        definitionFilePath: './insights/oneToOneConfigSpec.json',
      },
      oneToManyConfigSpecs: {
        required: true,
        definitionFilePath: './insights/oneToManyConfigSpecs.json',
        default: []
      },
    },
    caseStatus: {
      required: true,
      definitionFilePath: './CaseStatus.json',
      default: {}
    }
  };