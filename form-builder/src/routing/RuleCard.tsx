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
 * One rule of a workflow, as a card: its name, the task conditions (which tasks it takes: groups of
 * conditions picked from lists, any group can match) and the worker conditions (the steps, in order:
 * queue, who, priority, what if nobody takes it). Skills are chips: pick them, or drag them from the
 * skills bar onto a step. A second tab shows the rule as it's written for TaskRouter.
 */
import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { ArrowDown, ArrowUp, GripVertical, Trash2, X } from 'lucide-react';
import type { Condition, MoveOn, Role, RoutingDesign, Rule, Target } from './model';
import { ATTRIBUTE_LABELS, attributeLabel, valueLabel, VALUE_LABELS } from './model';
import { writeRule } from './convert';
import { describeOrderBy, levelOrder } from './describe';
import { hasBlock, newTarget, rolesOf, setRoles, setSkills, skillsOf, toggleBlock, updateTarget } from './edit';
import { isOfflineContactsRule } from './routingChecks';
import { familyOf } from './ConditionChip';

export const SKILL_MIME = 'application/x-aselo-skill';

type Props = {
  rule: Rule;
  index: number;
  design: RoutingDesign;
  readOnly: boolean;
  selected: boolean;
  onChange: (rule: Rule) => void;
  onRemove: () => void;
  onSelect: () => void;
};

const OPERATORS: { value: '==' | '!=' | 'IN' | 'NOT IN'; label: string }[] = [
  { value: '==', label: 'is' },
  { value: '!=', label: 'is not' },
  { value: 'IN', label: 'is one of' },
  { value: 'NOT IN', label: 'is none of' },
];

// The values seen for an attribute anywhere in the design, to choose from
const knownValues = (design: RoutingDesign, attribute: string) => {
  const values = new Set<string>();
  design.workflows.forEach((workflow) =>
    workflow.rules.forEach((rule) =>
      rule.when.flat().forEach((condition) => {
        if (condition.kind === 'compare' && condition.attribute === attribute) {
          condition.values.forEach((value) => typeof value === 'string' && values.add(value));
        }
      }),
    ),
  );
  if (attribute === 'channelType')
    ['voice', 'sms', 'web', 'voicemail', 'whatsapp', 'facebook', 'instagram'].forEach((value) => values.add(value));
  return [...values].sort();
};

// The attributes the design's conditions already use (generic or the helpline's own)
const usedAttributes = (design: RoutingDesign) => {
  const attributes = new Set<string>();
  design.workflows.forEach((workflow) =>
    workflow.rules.forEach((rule) =>
      rule.when.flat().forEach((condition) => condition.kind === 'compare' && attributes.add(condition.attribute)),
    ),
  );
  return [...attributes].sort();
};

const OTHER = '__other';
const ATTRIBUTE_NAME = /^[A-Za-z_][\w.]*$/;

// The generic task attributes, the ones this design uses, or one typed in (a helpline's own)
const AttributePicker = ({
  attribute,
  design,
  readOnly,
  onChange,
}: {
  attribute: string;
  design: RoutingDesign;
  readOnly: boolean;
  onChange: (attribute: string) => void;
}) => {
  const [typing, setTyping] = useState(false);
  if (typing) {
    const commit = (value: string) => {
      if (ATTRIBUTE_NAME.test(value.trim())) onChange(value.trim());
      setTyping(false);
    };
    return (
      <input
        type="text"
        className="routing-attribute-input"
        defaultValue={attribute}
        aria-label="Task attribute"
        placeholder="e.g. clinical, preEngagementData.area"
        autoFocus
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(e.currentTarget.value);
          if (e.key === 'Escape') setTyping(false);
        }}
      />
    );
  }
  const choices = [...new Set([...Object.keys(ATTRIBUTE_LABELS), ...usedAttributes(design), attribute])];
  return (
    <select
      value={attribute}
      aria-label="Task detail"
      disabled={readOnly}
      title={ATTRIBUTE_LABELS[attribute] ? attribute : "This helpline's own task attribute"}
      onChange={(e) => (e.target.value === OTHER ? setTyping(true) : onChange(e.target.value))}
    >
      {choices.map((choice) => (
        <option key={choice} value={choice}>
          {ATTRIBUTE_LABELS[choice] ? attributeLabel(choice) : `${choice} (helpline's own)`}
        </option>
      ))}
      <option value={OTHER}>Other (type it)…</option>
    </select>
  );
};

const ConditionRow = ({
  condition,
  design,
  readOnly,
  onChange,
  onRemove,
}: {
  condition: Condition;
  design: RoutingDesign;
  readOnly: boolean;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}) => {
  if (condition.kind === 'custom') {
    return (
      <li className="routing-condition custom">
        <span className="routing-chip custom" title="A condition the designer shows as written">
          Custom
        </span>
        <input
          type="text"
          value={condition.expression}
          aria-label="Custom condition"
          disabled={readOnly}
          onChange={(e) => onChange({ kind: 'custom', expression: e.target.value })}
        />
        {!readOnly && (
          <button type="button" className="icon-button" aria-label="Remove condition" onClick={onRemove}>
            <X size={14} />
          </button>
        )}
      </li>
    );
  }
  const values = knownValues(design, condition.attribute);
  const listId = `values-${condition.attribute}`;
  const single = condition.operator === '==' || condition.operator === '!=';
  return (
    <li className="routing-condition" data-family={familyOf(condition.attribute)}>
      <AttributePicker
        attribute={condition.attribute}
        design={design}
        readOnly={readOnly}
        onChange={(attribute) => onChange({ ...condition, attribute })}
      />
      <select
        value={condition.operator}
        aria-label="How it compares"
        disabled={readOnly}
        onChange={(e) => {
          const operator = e.target.value as typeof condition.operator;
          const multiple = operator === 'IN' || operator === 'NOT IN';
          onChange({
            ...condition,
            operator,
            values: multiple ? condition.values : condition.values.slice(0, 1),
          });
        }}
      >
        {OPERATORS.map((operator) => (
          <option key={operator.value} value={operator.value}>
            {operator.label}
          </option>
        ))}
      </select>
      <span className="routing-values">
        {condition.values.map((value, index) => (
          <span key={`${String(value)}-${index}`} className="routing-chip value">
            {valueLabel(value)}
            {!readOnly && !(single && condition.values.length === 1) && (
              <button
                type="button"
                aria-label={`Remove ${valueLabel(value)}`}
                onClick={() => onChange({ ...condition, values: condition.values.filter((_, i) => i !== index) })}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!readOnly && (!single || condition.values.length === 0) && (
          <>
            <input
              type="text"
              list={listId}
              aria-label="Add a value"
              placeholder="Add…"
              onKeyDown={(e) => {
                const input = e.currentTarget;
                if (e.key === 'Enter' && input.value.trim()) {
                  e.preventDefault();
                  onChange({ ...condition, values: [...condition.values, input.value.trim()] });
                  input.value = '';
                }
              }}
              onChange={(e) => {
                // Picking one of the suggestions adds it straight away
                if (values.includes(e.target.value)) {
                  onChange({ ...condition, values: [...condition.values, e.target.value] });
                  e.target.value = '';
                }
              }}
            />
            <datalist id={listId}>
              {values.map((value) => (
                <option key={value} value={value} label={VALUE_LABELS[value]} />
              ))}
            </datalist>
          </>
        )}
        {!readOnly && single && condition.values.length === 1 && (
          <select
            value={String(condition.values[0])}
            aria-label="Value"
            onChange={(e) => onChange({ ...condition, values: [e.target.value] })}
          >
            {[...new Set([String(condition.values[0]), ...values])].map((value) => (
              <option key={value} value={value}>
                {valueLabel(value)}
              </option>
            ))}
          </select>
        )}
      </span>
      {!readOnly && (
        <button type="button" className="icon-button" aria-label="Remove condition" onClick={onRemove}>
          <X size={14} />
        </button>
      )}
    </li>
  );
};

const ROLE_CHOICES: { value: string; label: string; roles?: Role[] }[] = [
  { value: 'agent', label: 'Counselors', roles: ['agent'] },
  { value: 'agent,supervisor', label: 'Counselors or supervisors', roles: ['agent', 'supervisor'] },
  { value: 'supervisor', label: 'Supervisors', roles: ['supervisor'] },
  { value: '', label: 'Anyone' },
];

const moveOnValue = (moveOn: MoveOn) =>
  moveOn.kind === 'skip' ? (/^1\s*==\s*1$/.test(moveOn.expression) ? 'skip' : 'custom') : moveOn.kind;

const TargetRow = ({
  target,
  step,
  last,
  design,
  offlineRule,
  readOnly,
  onChange,
  onMove,
  onRemove,
}: {
  target: Target;
  step: number;
  last: boolean;
  design: RoutingDesign;
  // The rule is the Offline Contacts one
  offlineRule: boolean;
  readOnly: boolean;
  onChange: (target: Target) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) => {
  const skills = skillsOf(target);
  const roles = rolesOf(target);
  const addSkill = (skill: string) => {
    if (!skill || skills.includes(skill)) return;
    onChange(setSkills(target, [...skills, skill]));
  };
  const custom = target.who.filter((block) => block.kind === 'custom');
  const levelChoices = design.skills
    .filter((skill) => skill.levels)
    .flatMap((skill) => [levelOrder(skill.name, 'DESC'), levelOrder(skill.name, 'ASC')]);
  if (target.orderBy && !levelChoices.includes(target.orderBy)) levelChoices.push(target.orderBy);
  return (
    <li
      className="routing-target-row"
      onDragOver={(e) => {
        if (!readOnly && e.dataTransfer.types.includes(SKILL_MIME)) e.preventDefault();
      }}
      onDrop={(e) => {
        const skill = e.dataTransfer.getData(SKILL_MIME);
        if (skill && !readOnly) addSkill(skill);
      }}
    >
      <div className="routing-target-head">
        <span className="routing-step">{step + 1}</span>
        <label>
          Queue{' '}
          <select
            value={target.queue}
            disabled={readOnly}
            onChange={(e) => onChange({ ...target, queue: e.target.value })}
          >
            <option value="">Choose…</option>
            {!design.queues.some((queue) => queue.key === target.queue) && target.queue && (
              <option value={target.queue}>{target.queue}</option>
            )}
            {design.queues.map((queue) => (
              <option key={queue.key} value={queue.key}>
                {queue.name}
              </option>
            ))}
          </select>
        </label>
        {!readOnly && (
          <span className="routing-target-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Move up"
              disabled={step === 0}
              onClick={() => onMove(-1)}
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Move down"
              disabled={last}
              onClick={() => onMove(1)}
            >
              <ArrowDown size={14} />
            </button>
            <button type="button" className="icon-button" aria-label="Remove step" onClick={onRemove}>
              <Trash2 size={14} />
            </button>
          </span>
        )}
      </div>

      {target.knownWorker ? (
        <p className="field-hint">Offered to the counselor it was transferred to ({target.knownWorker}).</p>
      ) : (
        <>
          <div className="routing-who">
            <select
              value={roles?.join(',') ?? ''}
              aria-label="Who"
              disabled={readOnly}
              onChange={(e) =>
                onChange(setRoles(target, ROLE_CHOICES.find((choice) => choice.value === e.target.value)?.roles))
              }
            >
              {ROLE_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
            <span>with</span>
            {skills.length === 0 && <span className="field-hint">any skills</span>}
            {skills.map((skill) => (
              <span key={skill} className="routing-chip skill">
                {skill}
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() =>
                      onChange(
                        setSkills(
                          target,
                          skills.filter((other) => other !== skill),
                        ),
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {!readOnly && (
              <select value="" aria-label="Add a skill" onChange={(e) => addSkill(e.target.value)}>
                <option value="">+ skill</option>
                {design.skills
                  .filter((skill) => !skills.includes(skill.name))
                  .map((skill) => (
                    <option key={skill.name} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <div className="routing-switches">
            {(
              [
                [{ kind: 'notWaitingOffline' }, 'Not busy with an offline contact'],
                [{ kind: 'voiceChatExclusive' }, 'Never a call and a chat at the same time'],
                [{ kind: 'voicemailOneAtATime' }, 'One voicemail at a time'],
                [{ kind: 'transfers', ignoreAgent: true }, 'Transfers go where sent, not back'],
              ] as const
            ).map(([block, label]) => (
              <label key={block.kind} className="field-checkbox">
                <input
                  type="checkbox"
                  checked={hasBlock(target, block.kind)}
                  disabled={readOnly}
                  onChange={(e) => onChange(toggleBlock(target, block, e.target.checked))}
                />
                <span>{label}</span>
              </label>
            ))}
            {(
              [
                ['offlineContactOwner', 'Only the counselor who recorded the offline contact'],
                ['targetWorker', 'Only the counselor it was sent to'],
              ] as const
            )
              .filter(([kind]) => hasBlock(target, kind))
              .map(([kind, label]) => (
                <label key={kind} className="field-checkbox">
                  <input
                    type="checkbox"
                    checked
                    disabled={readOnly}
                    onChange={() => onChange(toggleBlock(target, { kind }, false))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            {hasBlock(target, 'offlineContactAlternative') && (
              <label
                className={`field-checkbox ${offlineRule ? '' : 'routing-warning'}`}
                title={
                  offlineRule
                    ? undefined
                    : 'Offline contacts should be caught by the Offline Contacts rule; here this is probably a leftover'
                }
              >
                <input
                  type="checkbox"
                  checked
                  disabled={readOnly}
                  onChange={() => onChange(toggleBlock(target, { kind: 'offlineContactAlternative' }, false))}
                />
                <span>
                  …or the offline contact the counselor is recording
                  {!offlineRule && ' (not expected outside the Offline Contacts rule)'}
                </span>
              </label>
            )}
          </div>
          {custom.length > 0 && (
            <ul className="routing-conditions">
              {target.who.map((block, index) =>
                block.kind === 'custom' ? (
                  <li key={index} className="routing-condition custom">
                    <span className="routing-chip custom" title="A worker condition written as TaskRouter reads it">
                      Custom
                    </span>
                    <input
                      type="text"
                      value={block.expression}
                      aria-label="Custom worker condition"
                      placeholder="e.g. worker.routing.skills HAS task.language"
                      disabled={readOnly}
                      onChange={(e) =>
                        onChange({
                          ...target,
                          who: target.who.map((candidate, i) =>
                            i === index ? { kind: 'custom', expression: e.target.value } : candidate,
                          ),
                        })
                      }
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Remove custom worker condition"
                        onClick={() => onChange({ ...target, who: target.who.filter((_, i) => i !== index) })}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </li>
                ) : null,
              )}
            </ul>
          )}
          {!readOnly && (
            <button
              type="button"
              className="link-button"
              onClick={() => onChange({ ...target, who: [...target.who, { kind: 'custom', expression: '' }] })}
            >
              + Custom worker condition
            </button>
          )}
        </>
      )}

      <div className="routing-target-foot">
        <label>
          Priority{' '}
          <input
            type="number"
            value={target.priority ?? ''}
            placeholder="0"
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                ...target,
                priority: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
        </label>
        <label>
          If nobody takes it{' '}
          <select
            value={moveOnValue(target.moveOn)}
            disabled={readOnly}
            onChange={(e) => {
              const value = e.target.value;
              const moveOn: MoveOn =
                value === 'skip'
                  ? { kind: 'skip', expression: '1==1' }
                  : value === 'timeout'
                    ? {
                        kind: 'timeout',
                        seconds: target.moveOn.kind === 'timeout' ? target.moveOn.seconds : 120,
                      }
                    : value === 'custom'
                      ? target.moveOn
                      : { kind: 'wait' };
              onChange({ ...target, moveOn });
            }}
          >
            <option value="skip">right away, try the next step</option>
            <option value="timeout">after a while, try the next step</option>
            <option value="wait">wait here until someone takes it</option>
            {moveOnValue(target.moveOn) === 'custom' && <option value="custom">custom (as written)</option>}
          </select>
        </label>
        {!target.knownWorker && (levelChoices.length > 0 || target.orderBy) && (
          <label>
            Prefer{' '}
            <select
              value={target.orderBy ?? ''}
              disabled={readOnly}
              onChange={(e) => onChange({ ...target, orderBy: e.target.value || undefined })}
            >
              <option value="">no one in particular</option>
              {levelChoices.map((orderBy) => (
                <option key={orderBy} value={orderBy}>
                  {describeOrderBy(orderBy)!.replace(/^Prefer:? (the )?/, '')}
                </option>
              ))}
            </select>
          </label>
        )}
        {target.moveOn.kind === 'timeout' && (
          <label>
            <input
              type="number"
              min={1}
              value={target.moveOn.seconds}
              disabled={readOnly}
              aria-label="Seconds"
              onChange={(e) =>
                onChange({
                  ...target,
                  moveOn: { kind: 'timeout', seconds: Number(e.target.value) },
                })
              }
            />{' '}
            seconds
          </label>
        )}
      </div>
    </li>
  );
};

const NEW_CONDITION: Condition = {
  kind: 'compare',
  attribute: 'channelType',
  operator: '==',
  values: ['voice'],
};

// The task conditions: groups of conditions that must all match; any group can (… or …)
const TaskConditions = ({
  rule,
  design,
  readOnly,
  onChange,
}: {
  rule: Rule;
  design: RoutingDesign;
  readOnly: boolean;
  onChange: (rule: Rule) => void;
}) => {
  // A group left empty goes (one empty group alone would mean every task)
  const setGroup = (groupIndex: number, group: Condition[]) =>
    onChange({
      ...rule,
      when: rule.when
        .map((candidate, i) => (i === groupIndex ? group : candidate))
        .filter((candidate) => candidate.length > 0),
    });
  const several = rule.when.length > 1;
  return (
    <>
      {rule.when.length === 0 && <p className="field-hint">Every task (no conditions).</p>}
      {rule.when.map((group, groupIndex) => (
        <div key={groupIndex} className="routing-condition-group">
          {groupIndex > 0 && <div className="routing-or-divider">or</div>}
          <div className={several ? 'routing-group-card' : undefined}>
            {several && (
              <div className="routing-group-title">
                <span>Alternative {groupIndex + 1}: all of these</span>
                {!readOnly && (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove alternative ${groupIndex + 1}`}
                    onClick={() => setGroup(groupIndex, [])}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            <ul className="routing-conditions">
              {group.map((condition, conditionIndex) => (
                <ConditionRow
                  key={conditionIndex}
                  condition={condition}
                  design={design}
                  readOnly={readOnly}
                  onChange={(changed) =>
                    setGroup(
                      groupIndex,
                      group.map((candidate, i) => (i === conditionIndex ? changed : candidate)),
                    )
                  }
                  onRemove={() =>
                    setGroup(
                      groupIndex,
                      group.filter((_, i) => i !== conditionIndex),
                    )
                  }
                />
              ))}
            </ul>
            {!readOnly && (
              <button
                type="button"
                className="link-button"
                onClick={() => setGroup(groupIndex, [...group, structuredClone(NEW_CONDITION)])}
              >
                + and…
              </button>
            )}
          </div>
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          className="link-button"
          onClick={() => onChange({ ...rule, when: [...rule.when, [structuredClone(NEW_CONDITION)]] })}
        >
          {rule.when.length === 0 ? '+ Add a condition' : '+ Or another set of conditions'}
        </button>
      )}
    </>
  );
};

export const RuleCard = ({ rule, index, design, readOnly, selected, onChange, onRemove, onSelect }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: rule.id,
    disabled: readOnly,
  });
  const [view, setView] = useState<'design' | 'json'>('design');
  const offlineRule = isOfflineContactsRule(rule);
  const setTarget = (target: Target) => onChange(updateTarget(rule, target.id, () => target));
  const moveTarget = (from: number, to: number) => {
    const targets = [...rule.targets];
    const [moved] = targets.splice(from, 1);
    targets.splice(to, 0, moved);
    onChange({ ...rule, targets });
  };
  return (
    <li
      ref={setNodeRef}
      id={`rule-${rule.id}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`routing-rule-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="routing-rule-head">
        {!readOnly && (
          <button type="button" className="drag-handle" aria-label="Drag to reorder" {...attributes} {...listeners}>
            <GripVertical size={16} />
          </button>
        )}
        <span className="routing-rule-number">{index + 1}</span>
        <input
          type="text"
          className="routing-rule-name"
          value={rule.name}
          placeholder="Name this rule"
          aria-label="Rule name"
          disabled={readOnly}
          onChange={(e) => onChange({ ...rule, name: e.target.value })}
        />
        <span className="routing-rule-tabs" role="tablist" aria-label="View">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'design'}
            className={view === 'design' ? 'active' : ''}
            onClick={() => setView('design')}
          >
            Rule
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'json'}
            className={view === 'json' ? 'active' : ''}
            onClick={() => setView('json')}
          >
            JSON
          </button>
        </span>
        {!readOnly && (
          <button type="button" className="icon-button" aria-label="Remove rule" onClick={onRemove}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {view === 'json' ? (
        <div className="routing-section">
          <p className="field-hint">The filter as it will be written in the workflow template, for TaskRouter.</p>
          <pre className="routing-json" aria-label="Filter JSON">
            {JSON.stringify(writeRule(rule), null, 2)}
          </pre>
        </div>
      ) : (
        <>
          <div className="routing-section">
            <h4>
              Task conditions <span className="field-hint">which tasks this rule takes</span>
            </h4>
            <TaskConditions rule={rule} design={design} readOnly={readOnly} onChange={onChange} />
          </div>
          <div className="routing-section">
            <h4>
              Worker conditions <span className="field-hint">who it's offered to, step by step</span>
            </h4>
            <ol className="routing-targets">
              {rule.targets.map((target, step) => (
                <TargetRow
                  key={target.id}
                  target={target}
                  step={step}
                  last={step === rule.targets.length - 1}
                  design={design}
                  offlineRule={offlineRule}
                  readOnly={readOnly}
                  onChange={setTarget}
                  onMove={(direction) => moveTarget(step, step + direction)}
                  onRemove={() =>
                    onChange({
                      ...rule,
                      targets: rule.targets.filter((candidate) => candidate.id !== target.id),
                    })
                  }
                />
              ))}
            </ol>
            {!readOnly && (
              <button
                type="button"
                className="link-button"
                onClick={() =>
                  onChange({
                    ...rule,
                    targets: [...rule.targets, newTarget(rule.targets[rule.targets.length - 1]?.queue)],
                  })
                }
              >
                + Add a step
              </button>
            )}
          </div>
        </>
      )}
    </li>
  );
};
