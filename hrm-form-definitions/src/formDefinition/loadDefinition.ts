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
  CaseSectionTypeDefinitions,
  CaseSectionTypeJsonEntry,
  CategoriesDefinition,
  DefinitionVersion,
  FormDefinition,
  FormItemDefinition,
  FormItemJsonDefinition,
  HelplineDefinitions,
  HelplineEntry,
  isDependentSelectDefinitionWithReferenceOptions,
  isSelectDefinitionWithReferenceOptions,
  LayoutVersion,
  ProfileFlagDurationDefinition,
  ProfileSectionDefinition,
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
  huV1 = 'hu-v1', // Kek Vonal v1
  thV1 = 'th-v1', // Childline Thailand v1
  clV1 = 'cl-v1', // Línea Libre (CL) v1
  coV1 = 'co-v1', // Te Guío (CO) v1
  zwV1 = 'zw-v1', // Childline Zimbabwe v1
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

const loadAndExpandCaseSections = async (
  caseSectionsJsonDefinition: Record<string, CaseSectionTypeJsonEntry>,
  referenceData: Record<string, any>,
  fetchDefinition: <T>(jsonPath: string, placeholder?: T) => Promise<T>,
): Promise<CaseSectionTypeDefinitions> => {
  const caseSectionJsonEntries = Object.entries(caseSectionsJsonDefinition);
  const caseSectionExpandedEntries = await Promise.all(
    caseSectionJsonEntries.map(
      async ([key, value]) =>
        [
          key,
          {
            label: value.label,
            form: expandFormDefinition(
              await fetchDefinition<FormItemJsonDefinition[]>(value.formPath),
              referenceData,
            ),
          },
        ] as const,
    ),
  );
  return Object.fromEntries(caseSectionExpandedEntries);
};

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
    callerInformationTab,
    caseInformationTab,
    childInformationTab,
    issueCategorizationTab,
    contactlessTaskTab,
    callTypeButtons,
    helplineInformation,
    caseSections,
    cannedResponses,
    oneToOneConfigSpec,
    oneToManyConfigSpecs,
    caseStatus,
    prepopulateKeys,
    referenceData,
    blockedEmojis,
    profileSections,
    profileFlagDurations,
  ] = await Promise.all([
    fetchDefinition<LayoutVersion>('LayoutDefinitions.json'),
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
    fetchDefinition<Record<string, CaseSectionTypeJsonEntry>>('CaseSections.json'),
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
    fetchDefinition<ProfileFlagDurationDefinition[]>('profileForms/FlagDurations.json', []),
  ] as const);
  const expandedCaseSections: CaseSectionTypeDefinitions = await loadAndExpandCaseSections(
    caseSections,
    referenceData,
    fetchDefinition,
  );
  const { helplines } = helplineInformation;
  const defaultHelpline =
    helplineInformation.helplines.find((helpline: HelplineEntry) => helpline.default)?.value ||
    helplines[0].value;
  return {
    // Legacy hardcoded case forms
    caseForms: {
      HouseholdForm: expandedCaseSections.household.form,
      IncidentForm: expandedCaseSections.incident.form,
      NoteForm: expandedCaseSections.note.form,
      PerpetratorForm: expandedCaseSections.perpetrator.form,
      ReferralForm: expandedCaseSections.referral.form,
      DocumentForm: expandedCaseSections.document.form,
    },
    caseSectionTypes: expandedCaseSections,
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
      FlagDurations: profileFlagDurations,
    },
  };
}
