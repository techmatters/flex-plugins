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
  FlexUILocaleEntry,
} from './types';
import {
  LegacyOneToManyConfigSpec,
  OneToManyConfigSpecs,
  OneToOneConfigSpec,
} from './insightsConfig';
import { LayoutVersion } from './layoutVersion';
import cloneDeep from 'lodash/cloneDeep';

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

  const url =
    typeof window === 'undefined'
      ? new URL(path.join(baseUrlObj.pathname, jsonPath), baseUrlObj.origin)
      : new URL([baseUrlObj.pathname, jsonPath].join('/'), baseUrlObj.origin);
  const response = await fetch(url.toString());

  if (response?.ok) {
    const bodyText = await response.text();
    try {
      const json = JSON.parse(bodyText);
      return json as T;
    } catch (e) {
      console.error(`Could not parse response for ${url}:`, bodyText);
      throw e;
    }
  }

  if (response?.status === 404) {
    if (placeholder !== undefined) {
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
export const buildFetchDefinition = (baseUrl: string) => ({
  fetchDefinition: <T>(jsonPath: string, placeholder?: T) =>
    fetchDefinitionGivenConfig(baseUrl, jsonPath, placeholder),
});

type IssueCategorizationTabModuleType = {
  [helpline: string]: CategoriesDefinition;
};

type DefinitionVersionFileToType = {
  layoutVersion: LayoutVersion;
  callerInformationTab: FormItemJsonDefinition[];
  caseInformationTab: FormItemJsonDefinition[];
  childInformationTab: FormItemJsonDefinition[];
  issueCategorizationTab: IssueCategorizationTabModuleType;
  contactlessTaskTab: DefinitionVersion['tabbedForms']['ContactlessTaskTab'];
  callTypeButtons: CallTypeButtonsDefinitions;
  helplineInformation: HelplineDefinitions;
  caseSections: Record<string, CaseSectionTypeJsonEntry>;
  cannedResponses: CannedResponsesDefinitions;
  oneToOneConfigSpec: OneToOneConfigSpec;
  oneToManyConfigSpecs: OneToManyConfigSpecs;
  postSurveySpecs: LegacyOneToManyConfigSpec[];
  caseFilters: DefinitionVersion['caseFilters'];
  caseStatus: DefinitionVersion['caseStatus'];
  caseOverview: DefinitionVersion['caseOverview'];
  prepopulateKeys: DefinitionVersion['prepopulateKeys'];
  prepopulateMappings: PrepopulateMappingJson;
  referenceData: Record<string, any>;
  blockedEmojis: string[];
  profileSections: ProfileSectionDefinition[];
  profileFlagDurations: ProfileFlagDurationDefinition[];
  messages: LocalizedStringMap;
  substitutions: LocalizedStringMap;
  postSurveyMessages: Record<string, string>;
  flexUiLocales: FlexUILocaleEntry[];
  customLinks: DefinitionVersion['customLinks'];
};

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

const definitionVersionFileToLocation: {
  [k in keyof DefinitionVersionFileToType]: {
    location: string;
    placeholder?: DefinitionVersionFileToType[k];
  };
} = {
  layoutVersion: { location: 'LayoutDefinitions.json' },
  callerInformationTab: { location: 'tabbedForms/CallerInformationTab.json' },
  caseInformationTab: { location: 'tabbedForms/CaseInformationTab.json' },
  childInformationTab: { location: 'tabbedForms/ChildInformationTab.json' },
  issueCategorizationTab: { location: 'tabbedForms/IssueCategorizationTab.json' },
  contactlessTaskTab: { location: 'tabbedForms/ContactlessTaskTab.json', placeholder: {} },
  callTypeButtons: { location: 'CallTypeButtons.json' },
  helplineInformation: { location: 'HelplineInformation.json' },
  caseSections: { location: 'CaseSections.json' },
  cannedResponses: { location: 'CannedResponses.json', placeholder: [] },
  oneToOneConfigSpec: { location: 'insights/oneToOneConfigSpec.json' },
  oneToManyConfigSpecs: { location: 'insights/oneToManyConfigSpecs.json' },
  postSurveySpecs: { location: 'insights/postSurvey.json', placeholder: [] },
  caseFilters: { location: 'CaseFilters.json' },
  caseStatus: { location: 'CaseStatus.json' },
  caseOverview: { location: 'caseForms/CaseOverview.json' },
  prepopulateKeys: { location: 'PrepopulateKeys.json', placeholder: prepopulateKeysEmpty },
  prepopulateMappings: {
    location: 'PrepopulateMappings.json',
    placeholder: prepopulateMappingsEmpty,
  },
  referenceData: { location: 'ReferenceData.json', placeholder: {} },
  blockedEmojis: { location: 'BlockedEmojis.json', placeholder: [] },
  profileSections: { location: 'profileForms/Sections.json', placeholder: [] },
  profileFlagDurations: { location: 'profileForms/FlagDurations.json', placeholder: [] },
  messages: { location: 'customStrings/Messages.json', placeholder: {} },
  substitutions: { location: 'customStrings/Substitutions.json', placeholder: {} },
  postSurveyMessages: { location: 'customStrings/postSurveyMessages.json', placeholder: {} },
  flexUiLocales: { location: 'FlexUiLocales.json', placeholder: [] },
  customLinks: { location: 'CustomLinks.json', placeholder: [] },
};

const definitionVersionFileKeys = Object.keys(
  definitionVersionFileToLocation,
) as (keyof DefinitionVersionFileToType)[];

const loadDefinitionSingleFile =
  (fetchDefinition: ReturnType<typeof buildFetchDefinition>['fetchDefinition']) =>
  async <P extends keyof DefinitionVersionFileToType>({
    file,
  }: {
    file: P;
  }): Promise<DefinitionVersionFileToType[P]> => {
    return fetchDefinition<DefinitionVersionFileToType[P]>(
      definitionVersionFileToLocation[file].location,
      definitionVersionFileToLocation[file].placeholder,
    );
  };

const loadDefinitionAllFiles = async <K extends keyof DefinitionVersionFileToType>(
  fetchDefinition: ReturnType<typeof buildFetchDefinition>['fetchDefinition'],
): Promise<{ [P in K]: DefinitionVersionFileToType[P] }> => {
  const entries = await Promise.all(
    definitionVersionFileKeys.map(
      async (file) => [file, await loadDefinitionSingleFile(fetchDefinition)({ file })] as const,
    ),
  );
  // typecast is needed here because Object.fromEntries loses type info
  return Object.fromEntries(entries) as { [P in K]: DefinitionVersionFileToType[P] };
};

export async function loadDefinition(baseUrl: string): Promise<DefinitionVersion> {
  const { fetchDefinition } = buildFetchDefinition(baseUrl);

  const expandPrepopulateMappings = ({
    formSelector,
    ...sourceSets
  }: PrepopulateMappingJson): DefinitionVersion['prepopulateMappings'] => {
    const expandedMapping: DefinitionVersion['prepopulateMappings'] =
      cloneDeep(prepopulateMappingsEmpty);
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

  const {
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
    postSurveySpecs,
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
    postSurveyMessages,
    flexUiLocales,
    customLinks,
  } = await loadDefinitionAllFiles(fetchDefinition);

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
      postSurveySpecs,
    },
    profileForms: {
      Sections: profileSections,
      FlagDurations: profileFlagDurations,
    },
    customStrings: {
      Messages: messages,
      Substitutions: substitutions,
      postSurveyMessages,
    },
    flexUiLocales,
    customLinks,
  };
}
