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

// @vitest-environment jsdom

import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../../server/definitionsApi';
import { loadPostFlowChoices } from '../../../server/postStudioFlowChoices';
import type { DefinitionFileMap } from '../../definitions';
import { formDefinitionsDir, helplinesConfigDir } from '../../testing/workspaceHarness';
import { ServiceConfigEditor } from './ServiceConfigEditor';

let usnm: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
});
afterEach(cleanup);

// The config's choices, plus a language added on a board (not in the config yet)
const loadChoices = async (code: string) => {
  const choices = await loadPostFlowChoices({ helplinesConfigDir }, code);
  return {
    ...choices,
    flows: [...choices.flows, { key: 'post_call_survey_fr', environments: [], boards: ['Survey'] }],
  };
};

let files: DefinitionFileMap;
const Editor = () => {
  const [current, setCurrent] = useState<DefinitionFileMap>(usnm.files);
  files = current;
  return (
    <ServiceConfigEditor
      code="usnm"
      draftFiles={current}
      originalFiles={usnm.files}
      defaults={usnm.serviceConfigDefaults}
      onChangeFiles={(updater) => setCurrent(updater)}
      loadPostFlowChoices={loadChoices}
    />
  );
};

const postStudioFlows = (file: string) =>
  (files[`service-configuration/${file}.json`] as { attributes?: { postStudioFlows?: object } } | undefined)?.attributes
    ?.postStudioFlows;

describe('post-call surveys (postStudioFlows)', () => {
  test("USNM's are listed; one is added for staging, changed and removed", async () => {
    render(<Editor />);
    const section = within(screen.getByRole('region', { name: 'Post-call surveys' }));
    // Its 10 queues, in common.json (both environments)
    expect(section.getAllByRole('button', { name: /^Remove .* in common\.json$/ })).toHaveLength(10);

    // Only post_call_survey_* flows (not USNM's plain post_call_survey)
    const flow = section.getByRole('combobox', { name: 'Survey flow' }) as HTMLSelectElement;
    await waitFor(() => expect(flow.options.length).toBeGreaterThan(1));
    expect([...flow.options].map((option) => option.textContent)).toEqual([
      'Choose…',
      'post_call_survey_en',
      'post_call_survey_es',
      'post_call_survey_fr (on a board, not in the config yet)',
    ]);
    // Both kinds of trigger
    expect(
      [...(section.getByRole('combobox', { name: 'Survey trigger' }) as HTMLSelectElement).options].map((o) => o.value),
    ).toEqual(['inProgressCall', 'rest']);

    // Already in common.json for that queue
    fireEvent.change(section.getByRole('combobox', { name: 'Survey queue' }), {
      target: { value: '${task_queues.en_std}' },
    });
    fireEvent.change(flow, { target: { value: 'post_call_survey_en' } });
    fireEvent.click(section.getByRole('button', { name: 'Add survey' }));
    expect(section.getByText(/common\.json already has a survey for/)).toBeTruthy();

    // A flow not in the config yet: said before adding
    fireEvent.change(flow, { target: { value: 'post_call_survey_fr' } });
    fireEvent.change(section.getByRole('combobox', { name: 'Survey environments' }), { target: { value: 'staging' } });
    expect(section.getByText(/staging\.hcl has no post_call_survey_fr studio flow yet/)).toBeTruthy();

    // In staging only, during the call
    fireEvent.change(flow, { target: { value: 'post_call_survey_es' } });
    fireEvent.change(section.getByRole('combobox', { name: 'Survey trigger' }), {
      target: { value: 'inProgressCall' },
    });
    fireEvent.click(section.getByRole('button', { name: 'Add survey' }));
    expect(postStudioFlows('staging')).toEqual({
      '${task_queues.en_std}': {
        flowTrigger: 'inProgressCall',
        studioFlowSid: '${studio_flow_sids.post_call_survey_es}',
      },
    });

    // Changed in the list, then removed (the file's attributes stay)
    const label = /in staging\.json$/;
    fireEvent.change(section.getByRole('combobox', { name: new RegExp(`^When, for .*${label.source}`) }), {
      target: { value: 'rest' },
    });
    expect(postStudioFlows('staging')).toEqual({
      '${task_queues.en_std}': { flowTrigger: 'rest', studioFlowSid: '${studio_flow_sids.post_call_survey_es}' },
    });
    fireEvent.click(section.getByRole('button', { name: new RegExp(`^Remove .*${label.source}`) }));
    expect(postStudioFlows('staging')).toBeUndefined();
  });
});
