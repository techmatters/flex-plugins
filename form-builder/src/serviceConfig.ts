/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * The helpline's Flex service configuration, as written in the repo
 * (twilio-iac/helplines/<code>/configs/service-configuration). The repo is the source of truth:
 * Aselo staff apply it to Twilio with make service-config-plan / service-config-apply.
 *
 * What each environment gets is worked out the way manageServiceConfig.py does it: the shared
 * defaults.json, then the helpline's common.json, then <environment>.json, merged with
 * deepmerge's always_merger (objects merge, lists add up, anything else is replaced), and
 * settings set to null removed.
 */
import featureFlagsSource from '../../plugin-hrm-form/src/types/FeatureFlags.ts?raw';
import type { DefinitionFileMap } from './definitions';
import { isSameJson } from './changes';
import type { ValidationIssue } from './validation';
import {
  isServiceConfigPath,
  repoServiceConfigDir,
  SERVICE_CONFIG_FILE_NAMES,
  ServiceConfigFileName,
  serviceConfigPath,
} from '../server/filePaths';

export type ConfigObject = Record<string, unknown>;
export type ServiceConfigEnvironment = Exclude<ServiceConfigFileName, 'common'>;
// Where a value can come from: Aselo's shared defaults, or one of the helpline's files
export type ConfigLayer = 'defaults' | ServiceConfigFileName;

export const isConfigObject = (value: unknown): value is ConfigObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const getServiceConfigFile = (files: DefinitionFileMap, name: ServiceConfigFileName) => {
  const file = files[serviceConfigPath(name)];
  return isConfigObject(file) ? file : undefined;
};

export const hasServiceConfig = (files: DefinitionFileMap) => Object.keys(files).some(isServiceConfigPath);

/**
 * The environments to show: staging and production always (a file is created when something
 * is set there), development only for helplines that have one.
 */
export const serviceConfigEnvironments = (files: DefinitionFileMap): ServiceConfigEnvironment[] => [
  'staging',
  'production',
  ...(getServiceConfigFile(files, 'development') ? (['development'] as const) : []),
];

// deepmerge's always_merger, as used by manageServiceConfig.py
const mergeInto = (base: unknown, next: unknown): unknown => {
  if (isConfigObject(base) && isConfigObject(next)) {
    const merged: ConfigObject = { ...base };
    Object.entries(next).forEach(([key, value]) => {
      merged[key] = key in merged ? mergeInto(merged[key], value) : value;
    });
    return merged;
  }
  if (Array.isArray(base) && Array.isArray(next)) return [...base, ...next];
  return next;
};

// remove_empty in manageServiceConfig.py: settings set to null are dropped
const removeNulls = (value: ConfigObject): ConfigObject =>
  Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== null)
      .map(([key, item]) => [key, isConfigObject(item) ? removeNulls(item) : item]),
  );

export const layersFor = (environment: ServiceConfigEnvironment): ConfigLayer[] => ['defaults', 'common', environment];

const layerValue = (files: DefinitionFileMap, defaults: ConfigObject | undefined, layer: ConfigLayer) =>
  layer === 'defaults' ? defaults : getServiceConfigFile(files, layer);

export const mergedServiceConfig = (
  files: DefinitionFileMap,
  defaults: ConfigObject | undefined,
  environment: ServiceConfigEnvironment,
): ConfigObject =>
  layersFor(environment).reduce<ConfigObject>((merged, layer) => {
    const config = layerValue(files, defaults, layer);
    return config ? removeNulls(mergeInto(merged, config) as ConfigObject) : merged;
  }, {});

export const getIn = (node: unknown, keys: string[]): unknown =>
  keys.reduce<unknown>((current, key) => (isConfigObject(current) ? current[key] : undefined), node);

export const setIn = (node: ConfigObject, [key, ...rest]: string[], value: unknown): ConfigObject =>
  rest.length === 0
    ? { ...node, [key]: value }
    : { ...node, [key]: setIn(isConfigObject(node[key]) ? (node[key] as ConfigObject) : {}, rest, value) };

// Removes a setting, and any object left empty by removing it
export const deleteIn = (node: ConfigObject, [key, ...rest]: string[]): ConfigObject => {
  if (!(key in node)) return node;
  const { [key]: child, ...others } = node;
  if (rest.length === 0 || !isConfigObject(child)) return rest.length === 0 ? others : node;
  const updated = deleteIn(child, rest);
  if (updated === child) return node;
  return Object.keys(updated).length === 0 ? others : { ...node, [key]: updated };
};

/**
 * What counts as one setting: each feature flag, each attribute, each ui_attribute and each
 * other top-level key. Anything deeper (e.g. postStudioFlows) is edited as one value.
 */
const CONTAINERS = ['', 'attributes', 'ui_attributes', 'attributes.feature_flags'];

const collectSettingKeys = (config: unknown, prefix: string[] = [], found = new Set<string>()) => {
  if (!isConfigObject(config)) return found;
  Object.entries(config).forEach(([key, value]) => {
    const keys = [...prefix, key];
    if (CONTAINERS.includes(keys.join('.')) && isConfigObject(value)) collectSettingKeys(value, keys, found);
    else found.add(JSON.stringify(keys));
  });
  return found;
};

export type SettingGroup = 'featureFlags' | 'attributes' | 'uiAttributes' | 'other';

export const SETTING_GROUPS: { key: SettingGroup; title: string }[] = [
  { key: 'featureFlags', title: 'Feature flags' },
  { key: 'attributes', title: 'Attributes' },
  { key: 'uiAttributes', title: 'Flex UI' },
  { key: 'other', title: 'Other Flex settings' },
];

export const groupOf = (keys: string[]): SettingGroup => {
  if (keys[0] === 'attributes' && keys[1] === 'feature_flags' && keys.length === 3) return 'featureFlags';
  if (keys[0] === 'attributes' && keys.length === 2) return 'attributes';
  if (keys[0] === 'ui_attributes' && keys.length === 2) return 'uiAttributes';
  return 'other';
};

export type SettingRow = {
  keys: string[];
  path: string;
  group: SettingGroup;
  // The value written in each file (undefined: not set there; null: removed there)
  byLayer: Partial<Record<ConfigLayer, unknown>>;
  // What each environment ends up with, and which files that comes from
  effective: Partial<Record<ServiceConfigEnvironment, { value: unknown; from: ConfigLayer[] }>>;
};

const ALL_LAYERS: ConfigLayer[] = ['defaults', ...SERVICE_CONFIG_FILE_NAMES];

// The files a value comes from: objects and lists add up across files, anything else is the last one
const sourcesOf = (row: Pick<SettingRow, 'byLayer'>, environment: ServiceConfigEnvironment, value: unknown) => {
  const setters = layersFor(environment).filter((layer) => {
    const set = row.byLayer[layer];
    return set !== undefined && set !== null;
  });
  if (setters.length <= 1) return setters;
  const adds = (layer: ConfigLayer) =>
    (Array.isArray(value) && Array.isArray(row.byLayer[layer])) || (isConfigObject(value) && isConfigObject(row.byLayer[layer]));
  return adds(setters[setters.length - 1]) ? setters.filter(adds) : setters.slice(-1);
};

export const getSettingRows = (files: DefinitionFileMap, defaults: ConfigObject | undefined): SettingRow[] => {
  const environments = serviceConfigEnvironments(files);
  const keySet = new Set<string>();
  ALL_LAYERS.forEach((layer) => collectSettingKeys(layerValue(files, defaults, layer), [], keySet));
  const merged = Object.fromEntries(environments.map((env) => [env, mergedServiceConfig(files, defaults, env)]));

  return [...keySet]
    .map((json) => JSON.parse(json) as string[])
    .map((keys) => {
      const byLayer = Object.fromEntries(
        ALL_LAYERS.map((layer) => [layer, getIn(layerValue(files, defaults, layer), keys)]).filter(
          ([, value]) => value !== undefined,
        ),
      ) as SettingRow['byLayer'];
      const effective: SettingRow['effective'] = {};
      environments.forEach((env) => {
        const value = getIn(merged[env], keys);
        effective[env] = { value, from: value === undefined ? [] : sourcesOf({ byLayer }, env, value) };
      });
      return { keys, path: keys.join('.'), group: groupOf(keys), byLayer, effective };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
};

// The helpline sets it (in any of its own files), rather than only getting Aselo's default
export const isSetByHelpline = (row: SettingRow) => SERVICE_CONFIG_FILE_NAMES.some((name) => name in row.byLayer);

export const differsBetweenEnvironments = (row: SettingRow) => {
  const values = Object.values(row.effective).map((effective) => JSON.stringify(effective?.value));
  return new Set(values).size > 1;
};

/** Writes a setting into one file (creating the file if needed), or removes it with `undefined`. */
export const setServiceConfigValue = (
  files: DefinitionFileMap,
  name: ServiceConfigFileName,
  keys: string[],
  value: unknown,
): DefinitionFileMap => {
  const filePath = serviceConfigPath(name);
  const current = getServiceConfigFile(files, name) ?? {};
  const updated = value === undefined ? deleteIn(current, keys) : setIn(current, keys, value);
  if (value === undefined && updated === current) return files;
  return { ...files, [filePath]: updated };
};

export const setServiceConfigFile = (files: DefinitionFileMap, name: ServiceConfigFileName, config: ConfigObject) => ({
  ...files,
  [serviceConfigPath(name)]: config,
});

export const parseSettingPath = (text: string): string[] | undefined => {
  const keys = text.trim().split('.');
  return keys.every((key) => /^[A-Za-z0-9_$-]+$/.test(key) || /^\$\{[A-Za-z0-9_.]+\}$/.test(key)) ? keys : undefined;
};

// --- What the settings mean ----------------------------------------------------------------

/**
 * The feature flags' descriptions, from the comments in the Flex plugin's FeatureFlags.ts, e.g.
 *   enable_canned_responses: boolean; // Enables Canned Responses
 *   // enable_lex_v2 - only used in Twilio Lambda
 */
export const parseFeatureFlagDescriptions = (source: string): Record<string, string> => {
  const descriptions: Record<string, string> = {};
  source.split(/\r?\n/).forEach((line) => {
    const declared = line.match(/^\s*(\/\/\s*)?([a-z0-9_]+):\s*boolean;\s*(?:\/\/\s*(.*))?$/);
    if (declared) {
      const [, commentedOut, flag, comment] = declared;
      const description = comment?.trim() ?? '';
      descriptions[flag] = commentedOut ? `${description}${description ? ' ' : ''}(not read by the Flex plugin)`.trim() : description;
      return;
    }
    const note = line.match(/^\s*\/\/\s*([a-z0-9_]+)\s+-\s+(.*)$/);
    if (note) descriptions[note[1]] = note[2].charAt(0).toUpperCase() + note[2].slice(1);
  });
  return descriptions;
};

const FEATURE_FLAG_DESCRIPTIONS = parseFeatureFlagDescriptions(featureFlagsSource);

const ATTRIBUTE_DESCRIPTIONS: Record<string, string> = {
  'attributes.definitionVersion':
    'Which form definitions counselors use, e.g. “usnm-v1” for form-definitions/usnm/v1.',
  'attributes.helplineLanguage': 'The language of the Flex UI and the forms’ translations.',
  'attributes.permissionConfig':
    'The HRM permission rules: what counselors and supervisors can do with contacts, cases and profiles.',
  'attributes.form_definitions_base_url': 'Where Flex loads the form definitions from.',
  'attributes.resources_base_url': 'The resources service, for the referrals search. Empty: no resources search.',
  'attributes.logo_url': 'The logo in Flex’s header.',
  'attributes.pdfImagesSource': 'Where the images on printed cases come from (helpline-logo.png).',
  'attributes.hrm_api_version': 'The HRM API version Flex calls.',
  'attributes.multipleOfficeSupport': 'Show the counselor’s office on cases, for helplines with several offices.',
  'attributes.contacts_waiting_channels': 'The channels counted in “contacts waiting” on the counselor’s screen.',
  'attributes.enableClientProfiles': 'Client profiles: counselors see each person’s past contacts, cases and flags.',
  'attributes.enableConferencing': 'Counselors can add other people to a call.',
  'attributes.conferencing_enable_manual_dial': 'Counselors can dial a number to add to a call.',
  'attributes.conferencingHoldOnDial': 'The caller is put on hold while another person is dialled in.',
  'attributes.enableExternalRecordings': 'Call recordings are stored in Aselo’s S3 bucket, not in Twilio.',
  'attributes.external_recordings_enabled': 'Call recordings are stored outside Twilio (read by the Flex plugin).',
  'attributes.enableUnmaskingCalls': 'Supervisors can see callers’ phone numbers.',
  'attributes.preventSendingAttachmentsFromFlex': 'Counselors can’t send files from Flex.',
  'attributes.hideAddToNewCaseButton': 'Hides “Add to new case” when saving a contact.',
  'attributes.enforceZeroTranscriptRetention': 'Transcripts aren’t kept after the conversation.',
  'attributes.contact_save_frequency': 'When contacts are saved while counselors fill them in.',
  'attributes.postStudioFlows':
    'Which Studio flow runs after a conversation, per queue (e.g. the post-call survey). ${…} placeholders become SIDs when applied.',
  'attributes.serverless_base_url': 'Set from SSM when applied; a value written here is replaced.',
  'attributes.hrm_base_url': 'Filled in when applied (hrm-<environment>.tl.techmatters.org); a value written here wins.',
  'attributes.assets_bucket_url': 'Filled in when applied; a value written here wins.',
  'attributes.environment': 'Filled in when applied; a value written here wins.',
  'attributes.helpline_code': 'Filled in when applied; a value written here wins.',
  'attributes.aws_region': 'Filled in when applied; a value written here wins.',
  'attributes.WARNING': 'Shown to anyone looking at the configuration in Twilio: it’s managed from the repo.',
  'ui_attributes.colorTheme': 'Flex’s colours.',
  call_recording_enabled: 'Twilio records calls.',
  outbound_call_flows: 'Outbound calls from Flex: caller ID, queue and workflow.',
};

export const describeSetting = (row: Pick<SettingRow, 'keys' | 'path' | 'group'>) =>
  row.group === 'featureFlags' ? FEATURE_FLAG_DESCRIPTIONS[row.keys[2]] : ATTRIBUTE_DESCRIPTIONS[row.path];

// Known settings not set anywhere yet, offered when adding one
export const knownSettingPaths = () => [
  ...Object.keys(FEATURE_FLAG_DESCRIPTIONS).map((flag) => `attributes.feature_flags.${flag}`),
  ...Object.keys(ATTRIBUTE_DESCRIPTIONS),
];

// --- How applying treats some settings (see manageServiceConfig.py) ---------------------------

// Replaced from SSM on every apply
const SSM_FIELDS = ['attributes.serverless_base_url'];
// Never sent to Twilio
const EXCLUDED_FIELDS = [
  'flex_instance_sid',
  'flex_service_instance_sid',
  'runtime_domain',
  'flex_insights_hr',
  'taskrouter_workspace_sid',
  'service_version',
  'taskrouter_offline_activity_sid',
  'status',
];
// Replaced as a whole on apply; everything else is merged into what Twilio has
const OVERRIDE_FIELDS = ['attributes', 'ui_attributes.colorTheme'];

const isReplacedOnApply = (keys: string[]) =>
  OVERRIDE_FIELDS.some((field) => keys.join('.') === field || keys.join('.').startsWith(`${field}.`));

export const applyNoteFor = (keys: string[]): string | undefined => {
  const path = keys.join('.');
  if (SSM_FIELDS.includes(path)) return 'Always replaced from SSM when applied, so a value here has no effect.';
  if (EXCLUDED_FIELDS.includes(keys[0])) return 'Never sent to Twilio when applied.';
  return undefined;
};

export const hasPlaceholder = (value: unknown) => /\$\{(task_queues|workflow_sids|studio_flow_sids)\.[A-Za-z0-9_]+\}/.test(JSON.stringify(value) ?? '');

// --- Review --------------------------------------------------------------------------------

export const describeValue = (value: unknown): string => {
  if (value === undefined) return 'not set';
  if (value === null) return 'removed';
  if (value === true) return 'on';
  if (value === false) return 'off';
  if (typeof value === 'string') return value === '' ? '“” (empty)' : `“${value}”`;
  const text = JSON.stringify(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
};

const changedFileNames = (originalFiles: DefinitionFileMap, draftFiles: DefinitionFileMap) =>
  SERVICE_CONFIG_FILE_NAMES.filter(
    (name) => !isSameJson(getServiceConfigFile(originalFiles, name), getServiceConfigFile(draftFiles, name)),
  );

const settingChanges = (before: ConfigObject | undefined, after: ConfigObject | undefined) => {
  const keys = new Set([...collectSettingKeys(before)].concat([...collectSettingKeys(after)]));
  return [...keys]
    .map((json) => JSON.parse(json) as string[])
    .map((settingKeys) => ({ keys: settingKeys, before: getIn(before, settingKeys), after: getIn(after, settingKeys) }))
    .filter((change) => !isSameJson(change.before, change.after))
    .sort((a, b) => a.keys.join('.').localeCompare(b.keys.join('.')));
};

export const summarizeServiceConfigChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] =>
  changedFileNames(originalFiles, draftFiles).map((name) => ({
    title: `Service configuration: ${name}.json`,
    lines: settingChanges(getServiceConfigFile(originalFiles, name), getServiceConfigFile(draftFiles, name)).map(
      ({ keys, before, after }) => {
        const path = keys.join('.');
        if (before === undefined) return `${path}: added, ${describeValue(after)}`;
        if (after === undefined) return `${path}: removed (was ${describeValue(before)})`;
        return `${path}: ${describeValue(before)} → ${describeValue(after)}`;
      },
    ),
  }));

export const validateServiceConfig = (
  code: string,
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const changed = changedFileNames(originalFiles, draftFiles);
  if (changed.length === 0) return [];
  // common.json reaches every environment
  const environments = changed.includes('common')
    ? serviceConfigEnvironments(draftFiles)
    : (changed as ServiceConfigEnvironment[]);
  const issues: ValidationIssue[] = [
    {
      severity: 'warning',
      message: `The service configuration changed (${repoServiceConfigDir(code)}). After the PR is merged, run make service-config-plan then make service-config-apply with HL=${code} for ${environments
        .map((env) => `HL_ENV=${env}`)
        .join(', ')}.`,
    },
  ];
  changed.forEach((name) => {
    settingChanges(getServiceConfigFile(originalFiles, name), getServiceConfigFile(draftFiles, name)).forEach(
      ({ keys, after }) => {
        const path = keys.join('.');
        const note = after !== undefined ? applyNoteFor(keys) : undefined;
        if (note) issues.push({ severity: 'warning', message: `${name}.json sets ${path}: ${note}` });
        if (after === undefined && !isReplacedOnApply(keys)) {
          issues.push({
            severity: 'warning',
            message: `${name}.json no longer sets ${path}, but applying doesn’t remove it from Twilio (only attributes and ui_attributes.colorTheme are replaced as a whole). Remove it in the Twilio console too if it should go.`,
          });
        }
      },
    );
  });
  return issues;
};
