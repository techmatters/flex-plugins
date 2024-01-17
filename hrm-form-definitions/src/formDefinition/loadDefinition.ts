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

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import path from 'path';
import {
  CallTypeButtonsDefinitions,
  CannedResponsesDefinitions,
  DefinitionVersion,
  FormDefinition,
  FormItemDefinition,
  FormItemJsonDefinition,
  HelplineDefinitions,
  HelplineEntry,
  isDependentSelectDefinitionWithReferenceOptions,
  isSelectDefinitionWithReferenceOptions,
  LayoutVersion,
  CategoriesDefinition,
  ProfileSectionDefinition,
  ProfileBlockDefinition,
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
  huV1 = 'hu-v1', // Kek Vonal v1
  thV1 = 'th-v1', // Childline Thailand v1
  clV1 = 'cl-v1', // Línea Libre (CL) v1
  coV1 = 'co-v1', // Te Guío (CO) v1
  zwV1 = 'zw-v1', // Childline Zimbabwe v1
  plV1 = 'pl-v1', // Telefon Zaufania (PL) v1
  roV1 = 'ro-v1', // Telefonul Copilului Romania v1
  mtV1 = 'mt-v1', // Kellimni Malta v1
  nzV1 = 'nz-v1', // Youthline (NZ) v1
}

const expandFormDefinition = (
  itemJsonDefs: FormItemJsonDefinition[],
  referenceData: Record<string, any>,
): FormDefinition =>
  itemJsonDefs.map((json: FormItemJsonDefinition): FormItemDefinition => {
    if (
      isDependentSelectDefinitionWithReferenceOptions(json) ||
      isSelectDefinitionWithReferenceOptions(json)
    ) {
      const { optionsReferenceKey, ...restOfJson } = json;
      const options = referenceData[optionsReferenceKey];
      if (!options) {
        throw new Error(
          `Reference key '${optionsReferenceKey}' for form item '${json.name}' not found.`,
        );
      }

      return { ...restOfJson, options };
    }
    return json;
  });

/**
 * Fetches a definition file.
 *
 * If it fails to fetch it:
 * - Returns a given placeholder value, or
 * - Throws an error
 */
const fetchDefinitionGivenConfig = async <T>(
  baseUrl: string,
  jsonPath: string,
  placeholder?: T,
) => {
  const baseUrlObj = new URL(baseUrl);

  const url = new URL(path.join(baseUrlObj.pathname, jsonPath), baseUrlObj.origin);
  const response = await fetch(url.toString());

  if (response.ok) {
    const json = await response.json();
    return json as T;
  }

  if (response.status === 404) {
    if (placeholder) {
      // eslint-disable-next-line no-console
      console.log(`Could not find definition for: ${url}. Using placeholder instead.`);
      return placeholder;
    }
  }
  throw new Error(
    `Error response from form definitions service [${url}]: ${response.statusText} (${response.status}).`,
  );
};
/**
 * Returns an object that exposes the function:
 * - fetchDefinition<T>(jsonPath: string, placeholder?: T)
 */
const buildFetchDefinition = (baseUrl: string) => ({
  fetchDefinition: <T>(jsonPath: string, placeholder?: T) =>
    fetchDefinitionGivenConfig(baseUrl, jsonPath, placeholder),
});

type IssueCategorizationTabModuleType = {
  [helpline: string]: CategoriesDefinition;
};

export async function loadDefinition(baseUrl: string): Promise<DefinitionVersion> {
  const { fetchDefinition } = buildFetchDefinition(baseUrl);

  // Placeholder for prepopulateKeys
  const prepopulateKeysEmpty: DefinitionVersion['prepopulateKeys'] = {
    survey: { ChildInformationTab: [], CallerInformationTab: [] },
    preEngagement: {
      ChildInformationTab: [],
      CallerInformationTab: [],
      CaseInformationTab: [],
    },
  };

  /**
   * Currently the following constants are order sensitive.
   * It's very easy to make a human mistake and place one at the wrong order.
   *
   * TODO:
   * We should come up with a function that resolves all promises concurrently and
   * returns an object instead of an array.
   */
  const [
    layoutVersion,
    householdForm,
    incidentForm,
    noteForm,
    perpetratorForm,
    referralForm,
    documentForm,
    callerInformationTab,
    caseInformationTab,
    childInformationTab,
    issueCategorizationTab,
    contactlessTaskTab,
    callTypeButtons,
    helplineInformation,
    cannedResponses,
    oneToOneConfigSpec,
    oneToManyConfigSpecs,
    caseStatus,
    prepopulateKeys,
    referenceData,
    blockedEmojis,
    profileSections,
    profileBlockDurations,
  ] = await Promise.all([
    fetchDefinition<LayoutVersion>('LayoutDefinitions.json'),
    fetchDefinition<FormItemJsonDefinition[]>('caseForms/HouseholdForm.json'),
    fetchDefinition<FormItemJsonDefinition[]>('caseForms/IncidentForm.json'),
    fetchDefinition<FormItemJsonDefinition[]>('caseForms/NoteForm.json'),
    fetchDefinition<FormItemJsonDefinition[]>('caseForms/PerpetratorForm.json'),
    fetchDefinition<FormItemJsonDefinition[]>('caseForms/ReferralForm.json'),
    fetchDefinition<FormItemJsonDefinition[]>('caseForms/DocumentForm.json'),
    fetchDefinition<FormItemJsonDefinition[]>('tabbedForms/CallerInformationTab.json'),
    fetchDefinition<FormItemJsonDefinition[]>('tabbedForms/CaseInformationTab.json'),
    fetchDefinition<FormItemJsonDefinition[]>('tabbedForms/ChildInformationTab.json'),
    fetchDefinition<IssueCategorizationTabModuleType>('tabbedForms/IssueCategorizationTab.json'),
    fetchDefinition<DefinitionVersion['tabbedForms']['ContactlessTaskTab']>(
      'tabbedForms/ContactlessTaskTab.json',
      {},
    ),
    fetchDefinition<CallTypeButtonsDefinitions>('CallTypeButtons.json'),
    fetchDefinition<HelplineDefinitions>('HelplineInformation.json'),
    fetchDefinition<CannedResponsesDefinitions>('CannedResponses.json', []),
    fetchDefinition<OneToOneConfigSpec>('insights/oneToOneConfigSpec.json'),
    fetchDefinition<OneToManyConfigSpecs>('insights/oneToManyConfigSpecs.json'),
    fetchDefinition<DefinitionVersion['caseStatus']>('CaseStatus.json'),
    fetchDefinition<DefinitionVersion['prepopulateKeys']>(
      'PrepopulateKeys.json',
      prepopulateKeysEmpty,
    ),
    fetchDefinition<Record<string, any>>('ReferenceData.json', {}),
    fetchDefinition<string[]>('BlockedEmojis.json', []),
    fetchDefinition<ProfileSectionDefinition[]>('profileForms/Sections.json', []),
    fetchDefinition<ProfileBlockDefinition[]>('profileForms/BlockDurations.json', []),
  ]);

  const { helplines } = helplineInformation;
  const defaultHelpline =
    helplineInformation.helplines.find((helpline: HelplineEntry) => helpline.default)?.value ||
    helplines[0].value;
  return {
    caseForms: {
      HouseholdForm: expandFormDefinition(householdForm, referenceData),
      IncidentForm: expandFormDefinition(incidentForm, referenceData),
      NoteForm: expandFormDefinition(noteForm, referenceData),
      PerpetratorForm: expandFormDefinition(perpetratorForm, referenceData),
      ReferralForm: expandFormDefinition(referralForm, referenceData),
      DocumentForm: expandFormDefinition(documentForm, referenceData),
    },
    tabbedForms: {
      CallerInformationTab: expandFormDefinition(callerInformationTab, referenceData),
      CaseInformationTab: expandFormDefinition(caseInformationTab, referenceData),
      ChildInformationTab: expandFormDefinition(childInformationTab, referenceData),
      IssueCategorizationTab: (helpline: string) =>
        issueCategorizationTab[helpline] || issueCategorizationTab[defaultHelpline],
      ContactlessTaskTab: contactlessTaskTab,
    },
    callTypeButtons,
    layoutVersion,
    helplineInformation,
    cannedResponses,
    insights: {
      oneToOneConfigSpec,
      oneToManyConfigSpecs,
    },
    caseStatus,
    prepopulateKeys,
    referenceData,
    blockedEmojis,
    profileForms: {
      Sections: profileSections,
      BlockDurations: profileBlockDurations,
    },
  };
}
