import LayoutDefinitions from './LayoutDefinitions.json';
import HouseholdForm from './caseForms/HouseholdForm.json';
import IncidentForm from './caseForms/IncidentForm.json';
import NoteForm from './caseForms/NoteForm.json';
import PerpetratorForm from './caseForms/PerpetratorForm.json';
import ReferralForm from './caseForms/ReferralForm.json';
import CallerInformationTab from './tabbedForms/CallerInformationTab.json';
import CaseInformationTab from './tabbedForms/CaseInformationTab.json';
import ChildInformationTab from './tabbedForms/ChildInformationTab.json';
import IssueCategorizationTab from './tabbedForms/IssueCategorizationTab.json';
import CallTypeButtons from './CallTypeButtons.json';
import oneToOneConfigSpec from './insights/oneToOneConfigSpec.json';
import oneToManyConfigSpecs from './insights/oneToManyConfigSpecs.json';
import type {
  DefinitionVersion,
  LayoutVersion,
  FormDefinition,
  CallTypeButtonsDefinitions,
} from '../../components/common/forms/types';
import type { OneToOneConfigSpec, OneToManyConfigSpecs } from '../../insightsConfig/types';
import CaseStatus from './CaseStatus.json';

const version: DefinitionVersion = {
  caseForms: {
    HouseholdForm: HouseholdForm as FormDefinition,
    IncidentForm: IncidentForm as FormDefinition,
    NoteForm: NoteForm as FormDefinition,
    PerpetratorForm: PerpetratorForm as FormDefinition,
    ReferralForm: ReferralForm as FormDefinition,
  },
  tabbedForms: {
    CallerInformationTab: CallerInformationTab as FormDefinition,
    CaseInformationTab: CaseInformationTab as FormDefinition,
    ChildInformationTab: ChildInformationTab as FormDefinition,
    IssueCategorizationTab,
  },
  callTypeButtons: CallTypeButtons as CallTypeButtonsDefinitions,
  layoutVersion: LayoutDefinitions as LayoutVersion,
  cannedResponses: CannedResponses as CannedResponsesDefinitions,
  insights: {
    oneToOneConfigSpec: (oneToOneConfigSpec as unknown) as OneToOneConfigSpec,
    oneToManyConfigSpecs: oneToManyConfigSpecs as OneToManyConfigSpecs,
  },
  caseStatus: CaseStatus as DefinitionVersion['caseStatus'],
};

export default version;
