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
/* eslint-disable no-restricted-syntax */
import * as path from 'path';
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
  ProfileFlagDurationDefinition,
  ProfileSectionDefinition,
  LocalizedStringMap,
  FullyQualifiedFieldReference,
} from './types';
import { OneToManyConfigSpecs, OneToOneConfigSpec } from './insightsConfig';
import { LayoutVersion } from './layoutVersion';

// Type representing the JSON form where single fields don't need to be wrapped in arrays
type PrepopulateMappingJson = {
  formSelector?: { selectorType: string; parameter: any };
  survey: Record<
    string,
    (FullyQualifiedFieldReference[] | FullyQualifiedFieldReference)[] | FullyQualifiedFieldReference
  >;
  preEngagement: Record<
    string,
    (FullyQualifiedFieldReference[] | FullyQualifiedFieldReference)[] | FullyQualifiedFieldReference
  >;
};

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

  if (response?.ok) {
    const json = await response.json();
    return json as T;
  }

  if (response?.status === 404) {
    if (placeholder) {
      // eslint-disable-next-line no-console
      console.log(`Could not find definition for: ${url}. Using placeholder instead.`);
      return placeholder;
    }
  }
  throw new Error(
    `Error response from form definitions service [${url}]:\n` +
      `${response?.statusText ?? 'No response'}\n` +
      `(${response?.status ?? 'undefined'})`,
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

  // Placeholder for prepopulateMappings
  const prepopulateMappingsEmpty: DefinitionVersion['prepopulateMappings'] = {
    survey: {},
    preEngagement: {},
  };

  const expandPrepopulateMappings = ({
    formSelector,
    ...sourceSets
  }: PrepopulateMappingJson): DefinitionVersion['prepopulateMappings'] => {
    const expandedMapping: DefinitionVersion['prepopulateMappings'] = prepopulateMappingsEmpty;
    for (const [sourceSetName, sourceSetFields] of Object.entries(sourceSets)) {
      const targetObj =
        expandedMapping[
          sourceSetName as keyof Omit<DefinitionVersion['prepopulateMappings'], 'formSelector'>
        ];
      for (const [sourceField, sourceFieldMappings] of Object.entries(sourceSetFields)) {
        targetObj[sourceField] = targetObj[sourceField] ?? [];
        const andFields = Array.isArray(sourceFieldMappings)
          ? sourceFieldMappings
          : [sourceFieldMappings];
        for (const andFieldEntry of andFields) {
          const orFields = Array.isArray(andFieldEntry) ? andFieldEntry : [andFieldEntry];
          targetObj[sourceField].push(orFields);
        }
      }
    }
    return { ...expandedMapping, formSelector };
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
    caseFilters,
    caseStatus,
    caseOverview,
    prepopulateKeys,
    prepopulateMappings,
    referenceData,
    blockedEmojis,
    profileSections,
    profileFlagDurations,
    messages,
    substitutions,
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
    fetchDefinition<DefinitionVersion['caseFilters']>('CaseFilters.json'),
    fetchDefinition<DefinitionVersion['caseStatus']>('CaseStatus.json'),
    fetchDefinition<DefinitionVersion['caseOverview']>('caseForms/CaseOverview.json'),
    fetchDefinition<DefinitionVersion['prepopulateKeys']>(
      'PrepopulateKeys.json',
      prepopulateKeysEmpty,
    ),
    fetchDefinition<PrepopulateMappingJson>('PrepopulateMappings.json', prepopulateMappingsEmpty),
    fetchDefinition<Record<string, any>>('ReferenceData.json', {}),
    fetchDefinition<string[]>('BlockedEmojis.json', []),
    fetchDefinition<ProfileSectionDefinition[]>('profileForms/Sections.json', []),
    fetchDefinition<ProfileFlagDurationDefinition[]>('profileForms/FlagDurations.json', []),
    fetchDefinition<LocalizedStringMap>('customStrings/Messages.json', {}),
    fetchDefinition<LocalizedStringMap>('customStrings/Substitutions.json', {}),
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
    caseFilters,
    caseStatus,
    caseOverview,
    prepopulateKeys,
    prepopulateMappings: expandPrepopulateMappings(prepopulateMappings),
    referenceData,
    blockedEmojis,
    insights: {
      oneToOneConfigSpec,
      oneToManyConfigSpecs,
    },
    profileForms: {
      Sections: profileSections,
      FlagDurations: profileFlagDurations,
    },
    customStrings: {
      Messages: messages,
      Substitutions: substitutions,
    },
  };
}
