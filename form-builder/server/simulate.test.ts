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
 * The simulator on flows imported from live helplines: their splits run on their own conditions.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import { answer, startRun } from '../src/flows/simulate';
import { importHelpline } from './flowImport';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

describe('simulating imported flows', () => {
  test("usnm's voice flow: pressing 2 for Spanish takes the Spanish welcome, on the live split's conditions", async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const content = boards.find(({ content: candidate }) =>
      candidate.objects.some((object) => object.studioName === 'split_voice_language'),
    )!.content;
    const trigger = content.objects.find((object) => object.type === 'incoming')!;
    const nameOf = (id?: string) => content.objects.find((object) => object.id === id)?.studioName;

    let run = startRun(content, trigger.id);
    // Up to the language menu, in opening hours
    for (
      let turn = 0;
      turn < 20 && run.prompt && nameOf(run.prompt.objectId) !== 'gather_input_voice_language';
      turn += 1
    ) {
      const { prompt } = run;
      // Open, and otherwise on along the way that's connected
      const connected =
        prompt.kind === 'choose'
          ? prompt.exits.filter((exit) =>
              content.connections.some((connection) => connection.from === prompt.objectId && connection.exit === exit),
            )
          : [];
      run =
        prompt.kind === 'choose'
          ? answer(content, run, { kind: 'exit', exit: prompt.exits.includes('open') ? 'open' : connected[0] })
          : answer(content, run, { kind: 'digits', digits: '1' });
    }
    expect(run.ended).toBeUndefined();
    expect(run.prompt).toMatchObject({ kind: 'dialpad' });
    run = answer(content, run, { kind: 'digits', digits: '2' });
    const split = run.steps.find((step) => nameOf(step.objectId) === 'split_voice_language')!;
    expect(split.exit).toBe('2');
    expect(split.note).toContain('= “2”');
    const after = run.steps[run.steps.indexOf(split) + 1];
    expect(nameOf(after.objectId)).toBe('play_message_voice_es_welcome');
  });
});
