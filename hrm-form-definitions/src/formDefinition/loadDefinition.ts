/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import {
  CallTypeButtonsDefinitions,
  CannedResponsesDefinitions,
  DefinitionVersion,
  FormDefinition,
  HelplineDefinitions,
  HelplineEntry,
  LayoutVersion,
} from './types';
import { OneToManyConfigSpecs, OneToOneConfigSpec } from './insightsConfig';

export enum DefinitionVersionId {
  demoV1 = 'demo-v1', // Demo v1
  v1 = 'v1', // Zambia V1
  brV1 = 'br-v1', // Safernet Brasil v1
  etV1 = 'et-v1', // Ethiopia v1
  inV1 = 'in-v1', // Aarambh Trustline v1
  mwV1 = 'mw-v1', // Malawi v1
  zaV1 = 'za-v1', // South Africa v1
  jmV1 = 'jm-v1', // SafeSpot v1
  caV1 = 'ca-v1', // Kids Help Phone Canada v1
  phV1 = 'ph-v1', // ECPAT Phillippines v1
  ukV1 = 'uk-v1', // Revenge Porn UK v1
  ukrV1 = 'ukr-v1', // International Ukrainian Helpline v1
  thV1 = 'th-v1', // Childline Thailand v1
}

// Using a variable for the root of the dynamic import confuses webpack :-(
// const DEFINITION_JSON_ROOT = '../../form-definitions/';

export async function loadDefinition(version: DefinitionVersionId): Promise<DefinitionVersion> {
  /*
   * Unfortuntately I could not get lazy loading to work, which would have been nice because only the form definitions used by that helpline would be loeded.
   * It appears to be an issue with the module loader, when the bundle was split across multiple files for lazy loading, the additional bundle JS files were not loaded at runtime.
   * Not sure if this is a Twilio Flex specific issue or just misconfiguration - but loading the modules eagerly gets around it.
   */
  const layoutDefinitionsModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/LayoutDefinitions.json`
  );
  const householdFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/HouseholdForm.json`
  );
  const incidentFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/IncidentForm.json`
  );
  const noteFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/NoteForm.json`
  );
  const perpetratorFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/PerpetratorForm.json`
  );
  const referralFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/ReferralForm.json`
  );
  const documentFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/DocumentForm.json`
  );
  const caseSummaryFormModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/caseForms/CaseSummaryForm.json`
  );
  const callerInformationTabModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/tabbedForms/CallerInformationTab.json`
  );
  const caseInformationTabModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/tabbedForms/CaseInformationTab.json`
  );
  const childInformationTabModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/tabbedForms/ChildInformationTab.json`
  );
  const issueCategorizationTabModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/tabbedForms/IssueCategorizationTab.json`
  );

  let contactlessTaskTabModule;
  try {
    contactlessTaskTabModule = await import(
      /* webpackMode: "eager" */ `../../form-definitions/${version}/tabbedForms/ContactlessTaskTab.json`
    );
  } catch (err) {
    contactlessTaskTabModule = {};
  }

  const callTypeButtonsModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/CallTypeButtons.json`
  );
  const helplineInformationModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/HelplineInformation.json`
  );
  const cannedResponsesModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/CannedResponses.json`
  );
  const oneToOneConfigSpecModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/insights/oneToOneConfigSpec.json`
  );
  const oneToManyConfigSpecsModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/insights/oneToManyConfigSpecs.json`
  );
  const caseStatusModule = await import(
    /* webpackMode: "eager" */ `../../form-definitions/${version}/CaseStatus.json`
  );

  let prepopulateKeys;
  try {
    prepopulateKeys = await import(
      /* webpackMode: "eager" */ `../../form-definitions/${version}/PrepopulateKeys.json`
    );
  } catch (err) {
    prepopulateKeys = { ChildInformationTab: [], CallerInformationTab: [] };
  }

  const { helplines } = helplineInformationModule.default;
  const defaultHelpline =
    helplineInformationModule.default.helplines.find((helpline: HelplineEntry) => helpline.default)
      .value || helplines[0].value;
  return {
    caseForms: {
      HouseholdForm: householdFormModule.default as FormDefinition,
      IncidentForm: incidentFormModule.default as FormDefinition,
      NoteForm: noteFormModule.default as FormDefinition,
      PerpetratorForm: perpetratorFormModule.default as FormDefinition,
      ReferralForm: referralFormModule.default as FormDefinition,
      DocumentForm: documentFormModule.default as FormDefinition,
      CaseSummaryForm: caseSummaryFormModule.default as FormDefinition,
    },
    tabbedForms: {
      CallerInformationTab: callerInformationTabModule.default as FormDefinition,
      CaseInformationTab: caseInformationTabModule.default as FormDefinition,
      ChildInformationTab: childInformationTabModule.default as FormDefinition,
      IssueCategorizationTab: (helpline: string) =>
        issueCategorizationTabModule.default[helpline] ||
        issueCategorizationTabModule.default[defaultHelpline],
      ContactlessTaskTab: contactlessTaskTabModule,
    },
    callTypeButtons: callTypeButtonsModule.default as CallTypeButtonsDefinitions,
    layoutVersion: layoutDefinitionsModule.default as LayoutVersion,
    helplineInformation: helplineInformationModule.default as HelplineDefinitions,
    cannedResponses: cannedResponsesModule.default as CannedResponsesDefinitions,
    insights: {
      oneToOneConfigSpec: oneToOneConfigSpecModule.default as unknown as OneToOneConfigSpec,
      oneToManyConfigSpecs: oneToManyConfigSpecsModule.default as OneToManyConfigSpecs,
    },
    caseStatus: caseStatusModule.default as DefinitionVersion['caseStatus'],
    prepopulateKeys,
  };
}
