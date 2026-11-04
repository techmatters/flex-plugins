// @vitest-environment jsdom

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

import { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { RoutingDesign, Rule } from '@tech-matters/form-builder-shared/routing/model';
import { RuleCard } from './RuleCard';
import { routingChecks } from './routingChecks';

afterEach(cleanup);

const transfers: Rule = {
  id: 'r1',
  name: 'Transfers to Spanish',
  when: [[{ kind: 'compare', attribute: 'transferTargetType', operator: '==', values: ['queue'] }]],
  targets: [{ id: 't1', queue: 'childhelp_spanish', who: [], moveOn: { kind: 'wait' } }],
};

const design: RoutingDesign = {
  schemaVersion: 1,
  helpline: 'usch',
  skills: [],
  capacity: { voiceAndChatExclusive: true, voicemailOneAtATime: true },
  queues: [
    { key: 'master', name: 'Master', workers: { kind: 'nobody' } },
    // Just created in the designer: no rule names it yet
    { key: 'childhelp_spanish', name: 'Childhelp Spanish', workers: { kind: 'nobody' } },
  ],
  workflows: [{ key: 'master', name: 'Master', rules: [transfers] }],
} as RoutingDesign;

let latest: Rule = transfers;
const Card = ({ start }: { start: Rule }) => {
  const [rule, setRule] = useState(start);
  latest = rule;
  return (
    <DndContext>
      <SortableContext items={[rule.id]}>
        <ul>
          <RuleCard
            rule={rule}
            index={0}
            design={{ ...design, workflows: [{ ...design.workflows[0], rules: [rule] }] }}
            readOnly={false}
            selected
            expanded
            onToggle={() => {}}
            onChange={setRule}
            onRemove={() => {}}
            onSelect={() => {}}
          />
        </ul>
      </SortableContext>
    </DndContext>
  );
};

describe('a rule card', () => {
  test('"Transferred to" picks a queue, new ones too, and writes it as TaskRouter reads it', () => {
    render(
      <Card
        start={{
          ...transfers,
          when: [
            [
              ...transfers.when[0],
              { kind: 'compare', attribute: 'targetSid', operator: '==', values: [] },
            ],
          ],
        }}
      />,
    );
    // No value yet: it's an error, and never written as "undefined"
    expect(
      routingChecks({ ...design, workflows: [{ ...design.workflows[0], rules: [latest] }] }),
    ).toContainEqual(expect.objectContaining({ key: 'r1-novalue', severity: 'error' }));

    const add = screen.getByRole('combobox', { name: 'Add a queue' });
    expect(within(add).getByRole('option', { name: 'Childhelp Spanish' })).toBeTruthy();
    fireEvent.change(add, { target: { value: '${task_queues.childhelp_spanish}' } });

    expect(latest.when[0][1]).toMatchObject({
      attribute: 'targetSid',
      values: ['${task_queues.childhelp_spanish}'],
    });
    // Shown by its name, and changed from the same list
    expect(
      (screen.getByRole('combobox', { name: 'Transferred to queue' }) as HTMLSelectElement).value,
    ).toBe('${task_queues.childhelp_spanish}');
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    const json = screen.getByLabelText('Filter JSON').textContent ?? '';
    expect(json).toContain("targetSid == '${task_queues.childhelp_spanish}'");
    expect(json).not.toContain('undefined');
  });

  test('a value typed for a condition counts when leaving the box, without Enter', () => {
    render(
      <Card
        start={{
          ...transfers,
          when: [[{ kind: 'compare', attribute: 'service', operator: 'IN', values: [] }]],
        }}
      />,
    );
    const typed = screen.getByRole('combobox', { name: 'Add a value' });
    fireEvent.change(typed, { target: { value: 'Advocates' } });
    fireEvent.blur(typed);
    expect(latest.when[0][0]).toMatchObject({ values: ['Advocates'] });
  });
});
