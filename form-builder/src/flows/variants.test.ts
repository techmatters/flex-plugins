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

import { describe, expect, test } from 'vitest';
import { variantInLanguage } from './model';
import { approvalOf } from './recordings';

describe('another language for flows sharing a template', () => {
  test("the main flow's entry, with its language and recordings folder changed", () => {
    const main = {
      key: 'post_call_survey_en',
      label: 'English',
      recordingsFolder: 'post_call_survey_en',
      flowVars: {
        staging: {
          post_survey_assets_url: 'https://recordings.tl.techmatters.org/usvc/staging/post_call_survey_en',
          gather_language: 'en-US',
          thanks_text: 'Thank you',
        },
      },
    };
    expect(variantInLanguage(main, 'fr-CA', 'French (Canada)')).toEqual({
      key: 'post_call_survey_fr',
      label: 'French (Canada)',
      recordingsFolder: 'post_call_survey_fr',
      flowVars: {
        staging: {
          post_survey_assets_url: 'https://recordings.tl.techmatters.org/usvc/staging/post_call_survey_fr',
          gather_language: 'fr-CA',
          thanks_text: 'Thank you',
        },
      },
      added: true,
    });
    // A key without a language ending gets one
    expect(
      variantInLanguage({ key: 'survey', label: 'Survey', recordingsFolder: 'survey' }, 'es-US', 'Spanish'),
    ).toEqual({ key: 'survey_es', label: 'Spanish', recordingsFolder: 'survey_es', added: true });
  });
});

describe('approved check', () => {
  const approved = { by: 'Aselo person', at: '2026-11-02T00:00:00Z', script: 'Hi' };
  test('a messaging script approved while unchanged; voice once its recording is', () => {
    const message = { type: 'sendMessage' as const, message: { channel: 'sms' as const, script: 'Hi', approved } };
    expect(approvalOf(message)).toBe('Approved');
    expect(approvalOf({ ...message, message: { ...message.message, script: 'Hello' } })).toBeUndefined();
    const voice = {
      type: 'playMessage' as const,
      studioName: 'play_message_voice_en_hi',
      message: { channel: 'voice' as const, script: 'Hi' },
    };
    const staging = { etag: 'a', size: 1, lastModified: '', url: 'https://x/a.mp3' };
    expect(approvalOf(voice, undefined, [{ fileName: 'play_message_voice_en_hi.mp3', staging }])).toBeUndefined();
    expect(
      approvalOf(voice, undefined, [{ fileName: 'play_message_voice_en_hi.mp3', staging, approvedBy: 'Aselo person' }]),
    ).toBe('Approved');
    expect(
      approvalOf(voice, undefined, [
        { fileName: 'play_message_voice_en_hi.mp3', staging, production: staging, approvedBy: 'x' },
      ]),
    ).toBe('Published');
    expect(approvalOf({ type: 'decision' as const })).toBeUndefined();
  });
});
