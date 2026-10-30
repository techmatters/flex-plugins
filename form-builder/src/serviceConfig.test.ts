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

import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';
import { DefinitionFiles, loadDefinitionFiles } from '../server/definitionsApi';
import {
  ConfigObject,
  describeSetting,
  getSettingRows,
  mergedServiceConfig,
  parseFeatureFlagDescriptions,
  serviceConfigEnvironments,
  setServiceConfigValue,
  summarizeServiceConfigChanges,
  validateServiceConfig,
} from './serviceConfig';
import { getFeatures, getPermissionConfig, setFeature, summarizeFeatureChanges } from './helplineFeatures';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const formDefinitionsDir = path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions');
const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');

let usnm: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
});

const files = (common: ConfigObject, staging?: ConfigObject, production?: ConfigObject) => ({
  'service-configuration/common.json': common,
  ...(staging ? { 'service-configuration/staging.json': staging } : {}),
  ...(production ? { 'service-configuration/production.json': production } : {}),
});

describe('merging, as manageServiceConfig.py does', () => {
  test('defaults, then common, then the environment; objects merge, lists add up, null removes', () => {
    const defaults = { attributes: { a: 1, list: ['sms'], gone: 'x', feature_flags: { f: true } } };
    const merged = mergedServiceConfig(
      files({ attributes: { list: ['voice'], feature_flags: { g: false } } }, { attributes: { a: 2, gone: null } }),
      defaults,
      'staging',
    );
    expect(merged).toEqual({ attributes: { a: 2, list: ['sms', 'voice'], feature_flags: { f: true, g: false } } });
  });

  test('reads a real helpline: files, environments and what production gets', () => {
    expect(Object.keys(usnm.files).filter((key) => key.startsWith('service-configuration/')).sort()).toEqual([
      'service-configuration/common.json',
      'service-configuration/production.json',
      'service-configuration/staging.json',
    ]);
    expect(serviceConfigEnvironments(usnm.files)).toEqual(['staging', 'production']);
    const production = mergedServiceConfig(usnm.files, usnm.serviceConfigDefaults, 'production');
    expect((production.attributes as ConfigObject).definitionVersion).toBe('usnm-v1');
    expect(getPermissionConfig(usnm.files, usnm.serviceConfigDefaults)).toBe('usnm');
  });
});

describe('settings', () => {
  test('each setting shows what each environment gets, and from which file', () => {
    const rows = getSettingRows(usnm.files, usnm.serviceConfigDefaults);
    const row = (settingPath: string) => rows.find((item) => item.path === settingPath)!;

    // Aselo's default, overridden by the helpline
    expect(row('attributes.feature_flags.enable_canned_responses').effective.production).toEqual({
      value: false,
      from: ['common'],
    });
    // Only the defaults set it
    expect(row('attributes.seenOnboarding').effective.staging?.from).toEqual(['defaults']);
    // Set per environment
    expect(row('attributes.form_definitions_base_url').effective.staging?.value).toContain('assets-staging');
    expect(row('attributes.form_definitions_base_url').effective.production?.from).toEqual(['production']);
    // Objects deeper than one attribute are one setting
    expect(row('attributes.postStudioFlows').group).toBe('attributes');
    expect(rows.some((item) => item.path.startsWith('attributes.postStudioFlows.'))).toBe(false);
    expect(row('outbound_call_flows').effective.staging?.value).toBeUndefined();
  });

  test('feature flags are described from the Flex plugin’s FeatureFlags.ts', () => {
    expect(
      parseFeatureFlagDescriptions(
        [
          '  enable_canned_responses: boolean; // Enables Canned Responses',
          '  // enable_lex_v2 - only used in Twilio Lambda',
          '  // use_twilio_lambda_janitor: boolean; // Use the lambda for janitor jobs',
          '  use_new_dispatcher_path: boolean;',
        ].join('\n'),
      ),
    ).toEqual({
      enable_canned_responses: 'Enables Canned Responses',
      enable_lex_v2: 'Only used in Twilio Lambda',
      use_twilio_lambda_janitor: 'Use the lambda for janitor jobs (not read by the Flex plugin)',
      use_new_dispatcher_path: '',
    });
    expect(
      describeSetting({ keys: ['attributes', 'feature_flags', 'enable_emoji_picker'], path: '', group: 'featureFlags' }),
    ).toBe('Enables Emoji Picker');
  });

  test('setting and removing values, per file', () => {
    const start = files({ attributes: { a: 1 } });
    const added = setServiceConfigValue(start, 'staging', ['attributes', 'feature_flags', 'enable_lex'], true);
    expect(added['service-configuration/staging.json']).toEqual({ attributes: { feature_flags: { enable_lex: true } } });
    const removed = setServiceConfigValue(added, 'staging', ['attributes', 'feature_flags', 'enable_lex'], undefined);
    expect(removed['service-configuration/staging.json']).toEqual({});
    // Removing what isn't there changes nothing
    expect(setServiceConfigValue(start, 'common', ['attributes', 'b'], undefined)).toBe(start);
  });
});

describe('features', () => {
  test('are switched where the helpline sets them, else in common.json', () => {
    const start = files(
      { attributes: { helplineLanguage: 'en' } },
      undefined,
      { attributes: { feature_flags: { enable_canned_responses: true } } },
    );
    const defaults = { attributes: { enableClientProfiles: true, feature_flags: { enable_canned_responses: true } } };
    expect(getFeatures(start, defaults)).toEqual({
      enableClientProfiles: true,
      enableCannedResponses: true,
      usePrepopulateMappings: false,
    });

    const updated = setFeature(setFeature(start, 'enableCannedResponses', false), 'enableClientProfiles', false);
    expect(updated['service-configuration/production.json']).toEqual({
      attributes: { feature_flags: { enable_canned_responses: false } },
    });
    expect(updated['service-configuration/common.json']).toEqual({
      attributes: { helplineLanguage: 'en', enableClientProfiles: false, feature_flags: { enable_client_profiles: false } },
    });
    expect(getFeatures(updated, defaults)).toMatchObject({ enableClientProfiles: false, enableCannedResponses: false });
    expect(summarizeFeatureChanges(start, updated)).toEqual([
      { title: 'Helpline features', lines: ['Client profiles: switched off', 'Canned responses: switched off'] },
    ]);
  });
});

describe('review', () => {
  test('lists each file’s changed settings and says how to apply them', () => {
    const before = files({ attributes: { a: true, b: 'x' }, call_recording_enabled: true }, { attributes: {} });
    const after = files({ attributes: { a: false, c: 3 } }, { attributes: { serverless_base_url: 'https://x' } });
    expect(summarizeServiceConfigChanges(before, after)).toEqual([
      {
        title: 'Service configuration: common.json',
        lines: ['attributes.a: on → off', 'attributes.b: removed (was “x”)', 'attributes.c: added, 3', 'call_recording_enabled: removed (was on)'],
      },
      { title: 'Service configuration: staging.json', lines: ['attributes.serverless_base_url: added, “https://x”'] },
    ]);
    const messages = validateServiceConfig('xx', before, after).map((issue) => issue.message);
    // common.json changed, so every environment needs applying
    expect(messages[0]).toMatch(/make service-config-plan then make service-config-apply with HL=xx for HL_ENV=staging, HL_ENV=production/);
    expect(messages.some((message) => /serverless_base_url.*replaced from SSM/.test(message))).toBe(true);
    // Outside attributes, removing from the repo doesn't remove it from Twilio
    expect(messages.some((message) => /no longer sets call_recording_enabled/.test(message))).toBe(true);
    expect(messages.some((message) => /no longer sets attributes\.b/.test(message))).toBe(false);
    expect(validateServiceConfig('xx', before, before)).toEqual([]);
  });
});
