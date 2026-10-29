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

import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import {
  readConditions,
  readQueueWorkers,
  readWho,
  writeConditions,
  writeQueueWorkers,
  writeWho,
} from '../src/routing/expressions';
import { generateRouting } from '../src/routing/generate';
import { routingChecks } from '../src/routing/routingChecks';
import { readHelplineConfigs } from './flowImport';
import { parseHcl, parseTemplate } from './hcl';
import { importRouting } from './routingImport';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');
const codes = readdirSync(helplinesDir).filter(
  (code) =>
    /^[a-z0-9]+$/.test(code) &&
    (existsSync(path.join(helplinesDir, code, 'staging.hcl')) ||
      existsSync(path.join(helplinesDir, code, 'production.hcl'))),
);

describe('reading TaskRouter expressions', () => {
  test("a target's expression becomes blocks: skills, roles, capacity, transfers", () => {
    const expression =
      "(   worker.waitingOfflineContact != true   AND   (     (       task.channelType == 'voice'       AND       worker.channel.chat.assigned_tasks == 0     )     OR     (       task.channelType == 'chat'       AND       worker.channel.voice.assigned_tasks == 0     )   )   AND    (      'Calls' IN worker.routing.skills      AND      'Spanish' IN worker.routing.skills     AND     'TYA' IN worker.routing.skills   )    AND    (      worker.roles HAS 'agent'   )    AND   (     (       task.transferTargetType == 'worker'       AND       task.targetSid == worker.sid     )     OR     (       task.transferTargetType != 'worker'       AND       worker.sid != task.ignoreAgent     )   ) )";
    expect(readWho(expression)).toEqual([
      { kind: 'notWaitingOffline' },
      { kind: 'voiceChatExclusive' },
      { kind: 'skills', skills: ['Calls', 'Spanish', 'TYA'] },
      { kind: 'roles', roles: ['agent'] },
      { kind: 'transfers', ignoreAgent: true },
    ]);
    // Written back from blocks, it reads the same
    expect(readWho(writeWho(readWho(expression))!)).toEqual(readWho(expression));
    // "...or the offline contact the counselor is recording" is a block of its own
    const withOffline = `${expression} OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)`;
    expect(readWho(withOffline)).toEqual([...readWho(expression), { kind: 'offlineContactAlternative' }]);
    expect(readWho(writeWho(readWho(withOffline))!)).toEqual(readWho(withOffline));
    // The Offline Contacts rule's step: only the counselor who recorded it
    const owner = '(task.targetSid == worker.sid AND task.isContactlessTask == true)';
    expect(readWho(owner)).toEqual([{ kind: 'offlineContactOwner' }]);
    expect(writeWho(readWho(owner))).toBe(owner);
    expect(readWho('worker.sid == task.targetSid')).toEqual([{ kind: 'targetWorker' }]);
    // A custom condition left empty in the editor isn't written
    expect(writeWho([{ kind: 'notWaitingOffline' }, { kind: 'custom', expression: ' ' }])).toBe(
      '(worker.waitingOfflineContact != true)',
    );
    // What isn't a block is kept as written
    expect(readWho('worker.routing.skills HAS task.language')).toEqual([
      { kind: 'custom', expression: 'worker.routing.skills HAS task.language' },
    ]);
  });

  test("a rule's conditions, and a queue's workers", () => {
    expect(readConditions("channelType IN ['sms','web'] AND service=='fcg' AND serviceLanguage == 'english'")).toEqual([
      [
        { kind: 'compare', attribute: 'channelType', operator: 'IN', values: ['sms', 'web'] },
        { kind: 'compare', attribute: 'service', operator: '==', values: ['fcg'] },
        { kind: 'compare', attribute: 'serviceLanguage', operator: '==', values: ['english'] },
      ],
    ]);
    expect(readConditions('isContactlessTask == true')).toEqual([
      [{ kind: 'compare', attribute: 'isContactlessTask', operator: '==', values: [true] }],
    ]);
    expect(readConditions('1==1')).toEqual([]);
    expect(writeConditions(readConditions("channelType == 'voice' AND service == 'tya'"))).toBe(
      "channelType == 'voice' AND service == 'tya'",
    );
    // Alternatives (… OR …) are groups of conditions
    const alternatives =
      "(channelType IN ['voice'] AND service =='ChildHelp' ) OR  (targetSid=='${task_queues.master}' AND channelType IN ['voice'] )";
    expect(readConditions(alternatives)).toEqual([
      [
        { kind: 'compare', attribute: 'channelType', operator: 'IN', values: ['voice'] },
        { kind: 'compare', attribute: 'service', operator: '==', values: ['ChildHelp'] },
      ],
      [
        {
          kind: 'compare',
          attribute: 'targetSid',
          operator: '==',
          values: ['${task_queues.master}'],
        },
        { kind: 'compare', attribute: 'channelType', operator: 'IN', values: ['voice'] },
      ],
    ]);
    expect(readConditions(writeConditions(readConditions(alternatives)))).toEqual(readConditions(alternatives));
    expect(
      readQueueWorkers("(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS') AND routing.skills HAS 'TYA'"),
    ).toEqual({
      kind: 'skills',
      allOf: [['Calls', 'SMS'], ['TYA']],
    });
    expect(readQueueWorkers('1=0')).toEqual({ kind: 'nobody' });
    expect(writeQueueWorkers({ kind: 'skills', allOf: [['Calls', 'SMS'], ['TYA']] })).toBe(
      "(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS') AND routing.skills HAS 'TYA'",
    );
  });
});

describe('a routing design from a live helpline', () => {
  test('USNM: workflows, queues, skills and capacity', async () => {
    const { design, report } = await importRouting(helplinesDir, 'usnm');
    expect(design.workflows.map((workflow) => [workflow.key, workflow.shared])).toEqual([
      ['master', false],
      ['sms', false],
      ['queue_transfers', true],
      ['survey', true],
    ]);
    expect(design.queues.find((queue) => queue.key === 'es_tya')).toMatchObject({
      name: 'Spanish TYA',
      workers: { kind: 'skills', allOf: [['Calls', 'SMS'], ['TYA'], ['Spanish']] },
    });
    expect(report.skills).toEqual(['Calls', 'FCG', 'SMS', 'Spanish', 'TYA', 'Voicemail']);
    expect(design.capacity).toMatchObject({
      voiceAndChatExclusive: true,
      voicemailOneAtATime: true,
    });

    const esTya = design.workflows[0].rules.find((rule) => rule.name === 'ES TYA Call')!;
    expect(esTya.when).toEqual([
      [
        { kind: 'compare', attribute: 'channelType', operator: '==', values: ['voice'] },
        { kind: 'compare', attribute: 'service', operator: '==', values: ['tya'] },
        { kind: 'compare', attribute: 'serviceLanguage', operator: '==', values: ['spanish'] },
      ],
    ]);
    expect(esTya.targets.map((target) => [target.queue, target.priority, target.moveOn.kind])).toEqual([
      ['es_tya', 60, 'skip'],
      ['es_tya', 60, 'wait'],
    ]);
    expect(esTya.targets[1].who).toContainEqual({ kind: 'roles', roles: ['agent', 'supervisor'] });
  });

  test('unchanged, it gives back the live workflows and queues, for every helpline', async () => {
    let workflows = 0;
    for (const code of codes) {
      const { design } = await importRouting(helplinesDir, code);
      const generated = generateRouting(design);
      for (const workflow of generated.workflows) {
        const originalText = readFileSync(path.join(helplinesDir, workflow.template!), 'utf8');
        // Built by template code (%{ for ... }): kept exactly as written
        if (originalText.includes('%{')) expect(workflow.text, `${code} ${workflow.key}`).toBe(originalText);
        else expect(parseTemplate(workflow.text), `${code} ${workflow.key}`).toEqual(parseTemplate(originalText));
        workflows += 1;
      }
      const { configs, environments } = await readHelplineConfigs(helplinesDir, code);
      const config = configs[environments[0]]!;
      if (design.queues.length > 0) {
        expect(parseHcl(generated.queuesBlock).attributes.task_queues, code).toEqual(config.task_queues);
      }
      if (design.workflows.length > 0 && design.workflows.length === Object.keys(config.workflows ?? {}).length) {
        expect(parseHcl(generated.workflowsBlock).attributes.workflows, code).toEqual(config.workflows);
      }
    }
    expect(workflows).toBeGreaterThan(20);
  }, 60_000);

  test('USCH: alternatives, offline-contact leftovers, skill levels', async () => {
    const { design } = await importRouting(helplinesDir, 'usch');
    const rule = design.workflows
      .flatMap((workflow) => workflow.rules)
      .find((candidate) => candidate.name === 'Childhelp - ChatText - Spanish')!;
    expect(rule.when).toHaveLength(2);
    expect(rule.targets[0].who).toContainEqual({ kind: 'offlineContactAlternative' });
    expect(rule.targets[0].who).toContainEqual({ kind: 'skills', skills: ['ChatText', 'Spanish'] });
    expect(design.skills.find((skill) => skill.name === 'ChatText')).toEqual({
      name: 'ChatText',
      levels: true,
    });
    const issues = routingChecks(design);
    expect(issues.some((issue) => issue.ruleId === rule.id && issue.key.endsWith('-offline'))).toBe(true);
    expect(issues.some((issue) => issue.key.endsWith('-levels'))).toBe(false);
  });

  test('changes are written from the blocks: a new skill, a new rule order', async () => {
    const { design } = await importRouting(helplinesDir, 'usnm');
    const [calls] = design.workflows;
    const rule = calls.rules.find((candidate) => candidate.name === 'ES TYA Call')!;
    const skills = rule.targets[0].who.find((block) => block.kind === 'skills')!;
    if (skills.kind === 'skills') skills.skills.push('Crisis');
    calls.rules = [rule, ...calls.rules.filter((candidate) => candidate !== rule)];

    const written = parseTemplate(generateRouting(design).workflows[0].text) as {
      task_routing: {
        filters: { filter_friendly_name: string; targets: { expression: string }[] }[];
      };
    };
    const [first] = written.task_routing.filters;
    expect(first.filter_friendly_name).toBe('ES TYA Call');
    expect(first.targets[0].expression).toContain("'Crisis' IN worker.routing.skills");
    expect(readWho(first.targets[0].expression)).toContainEqual({
      kind: 'skills',
      skills: ['Calls', 'Spanish', 'TYA', 'Crisis'],
    });
    // The other target wasn't changed: as it was
    expect(first.targets[1].expression).toMatch(/^\(\s+worker\.waitingOfflineContact/);
  });
});
