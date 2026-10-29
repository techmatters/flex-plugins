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
 * The routing designer's other pages: queues, skills and capacity, test a task, and check.
 */
import { useState } from 'react';
import { CircleAlert, Trash2, TriangleAlert, X } from 'lucide-react';
import type { Condition, Queue, QueueWorkers, RoutingDesign, Workflow } from './model';
import { attributeLabel, valueLabel } from './model';
import {
  attributesOf,
  describeCondition,
  describeConditions,
  GroupResult,
  describeMoveOn,
  describeQueueWorkers,
  describeWho,
  queueName,
  TaskAttributes,
  testTask,
} from './describe';
import { renameSkill, setCapacity } from './edit';
import type { RoutingIssue } from './routingChecks';
import { SKILL_MIME } from './RuleCard';

type PanelProps = {
  design: RoutingDesign;
  readOnly: boolean;
  onChange: (design: RoutingDesign) => void;
};

// The skills, as chips that can be dragged onto a step or a queue
export const SkillsBar = ({ design }: { design: RoutingDesign }) => (
  <div className="routing-skills-bar" aria-label="Skills">
    <span className="field-hint">Skills (drag onto a step or a queue):</span>
    {design.skills.map((skill) => (
      <span
        key={skill.name}
        className="routing-chip skill"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(SKILL_MIME, skill.name);
          e.dataTransfer.effectAllowed = 'copy';
        }}
      >
        {skill.name}
      </span>
    ))}
    {design.skills.length === 0 && <span className="field-hint">none yet (add them under Skills &amp; capacity)</span>}
  </div>
);

// ---------------------------------------------------------------------------------------------
// Queues

const WorkersEditor = ({
  workers,
  design,
  readOnly,
  onChange,
}: {
  workers: QueueWorkers;
  design: RoutingDesign;
  readOnly: boolean;
  onChange: (workers: QueueWorkers) => void;
}) => {
  if (workers.kind !== 'skills') {
    return (
      <div className="routing-who">
        <select
          value={workers.kind}
          disabled={readOnly}
          aria-label="Who can work in it"
          onChange={(e) => onChange(e.target.value === 'skills' ? { kind: 'skills', allOf: [] } : { kind: 'nobody' })}
        >
          <option value="skills">Counselors with skills</option>
          <option value="nobody">Nobody (a holding queue)</option>
          {workers.kind === 'custom' && <option value="custom">Custom (as written)</option>}
        </select>
        {workers.kind === 'custom' && (
          <input
            type="text"
            value={workers.expression}
            aria-label="Custom condition"
            disabled={readOnly}
            onChange={(e) => onChange({ kind: 'custom', expression: e.target.value })}
          />
        )}
      </div>
    );
  }
  const setGroup = (index: number, group: string[]) =>
    onChange({
      kind: 'skills',
      allOf: workers.allOf
        .map((candidate, i) => (i === index ? group : candidate))
        .filter((candidate) => candidate.length > 0),
    });
  return (
    <div className="routing-queue-groups">
      <select
        value="skills"
        disabled={readOnly}
        aria-label="Who can work in it"
        onChange={(e) => onChange(e.target.value === 'nobody' ? { kind: 'nobody' } : workers)}
      >
        <option value="skills">Counselors with</option>
        <option value="nobody">Nobody (a holding queue)</option>
      </select>
      {workers.allOf.map((group, index) => (
        <span key={index} className="routing-group">
          {index > 0 && <span className="routing-and">and</span>}
          <span
            className="routing-group-box"
            onDragOver={(e) => {
              if (!readOnly && e.dataTransfer.types.includes(SKILL_MIME)) e.preventDefault();
            }}
            onDrop={(e) => {
              const skill = e.dataTransfer.getData(SKILL_MIME);
              if (skill && !group.includes(skill)) setGroup(index, [...group, skill]);
            }}
          >
            {group.map((skill, skillIndex) => (
              <span key={skill} className="routing-chip skill">
                {skillIndex > 0 && <span className="routing-or">or</span>}
                {skill}
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() =>
                      setGroup(
                        index,
                        group.filter((other) => other !== skill),
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {!readOnly && (
              <select
                value=""
                aria-label="Add a skill to this group"
                onChange={(e) => e.target.value && setGroup(index, [...group, e.target.value])}
              >
                <option value="">+ or…</option>
                {design.skills
                  .filter((skill) => !group.includes(skill.name))
                  .map((skill) => (
                    <option key={skill.name} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
              </select>
            )}
          </span>
        </span>
      ))}
      {!readOnly && (
        <select
          value=""
          aria-label="Add a skill they also need"
          onChange={(e) => e.target.value && onChange({ kind: 'skills', allOf: [...workers.allOf, [e.target.value]] })}
        >
          <option value="">{workers.allOf.length === 0 ? '+ skill' : '+ and…'}</option>
          {design.skills.map((skill) => (
            <option key={skill.name} value={skill.name}>
              {skill.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export const QueuesPanel = ({ design, readOnly, onChange }: PanelProps) => {
  const [newName, setNewName] = useState('');
  const setQueue = (key: string, queue: Queue) =>
    onChange({
      ...design,
      queues: design.queues.map((candidate) => (candidate.key === key ? queue : candidate)),
    });
  const used = (key: string) =>
    design.workflows.some((workflow) =>
      workflow.rules.some((rule) => rule.targets.some((target) => target.queue === key)),
    );
  const add = () => {
    const name = newName.trim();
    if (!name) return;
    let key =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || 'queue';
    while (design.queues.some((queue) => queue.key === key)) key = `${key}_2`;
    onChange({
      ...design,
      queues: [...design.queues, { key, name, workers: { kind: 'skills', allOf: [] } }],
    });
    setNewName('');
  };
  return (
    <div className="routing-panel" role="region" aria-label="Queues">
      <SkillsBar design={design} />
      <p className="field-hint">Where tasks wait for a counselor, and who can work in each one.</p>
      <ul className="routing-queue-list">
        {design.queues.map((queue) => (
          <li key={queue.key}>
            <div className="routing-queue-head">
              <input
                type="text"
                value={queue.name}
                aria-label="Queue name"
                disabled={readOnly}
                onChange={(e) => setQueue(queue.key, { ...queue, name: e.target.value })}
              />
              <code className="field-hint">{queue.key}</code>
              {!readOnly && !used(queue.key) && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${queue.name}`}
                  onClick={() =>
                    onChange({
                      ...design,
                      queues: design.queues.filter((candidate) => candidate.key !== queue.key),
                    })
                  }
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <WorkersEditor
              workers={queue.workers}
              design={design}
              readOnly={readOnly}
              onChange={(workers) => setQueue(queue.key, { ...queue, workers })}
            />
            <span className="field-hint">{describeQueueWorkers(queue.workers)}</span>
          </li>
        ))}
      </ul>
      {!readOnly && (
        <div className="routing-add">
          <input
            type="text"
            value={newName}
            placeholder="New queue's name"
            aria-label="New queue's name"
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="button" className="secondary-button" disabled={!newName.trim()} onClick={add}>
            Add a queue
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Skills and capacity

export const SkillsPanel = ({ design, readOnly, onChange }: PanelProps) => {
  const [newSkill, setNewSkill] = useState('');
  const add = () => {
    const name = newSkill.trim();
    if (!name || design.skills.some((skill) => skill.name === name)) return;
    onChange({ ...design, skills: [...design.skills, { name }] });
    setNewSkill('');
  };
  return (
    <div className="routing-panel" role="region" aria-label="Skills and capacity">
      <h3>Skills</h3>
      <p className="field-hint">
        What counselors can be given in Flex (Teams view). The same skills have to exist in each Flex account; the
        export lists them.
      </p>
      <p className="field-hint">
        <strong>Levels</strong>: counselors also get a level of the skill (a number, set in Flex). A step can then
        prefer counselors by level (&quot;Prefer&quot; on the step), e.g. the most experienced first.
      </p>
      <ul className="routing-skill-list">
        {design.skills.map((skill) => (
          <li key={skill.name}>
            <input
              type="text"
              defaultValue={skill.name}
              aria-label="Skill name"
              disabled={readOnly}
              onBlur={(e) => {
                const name = e.target.value.trim();
                if (name && name !== skill.name) onChange(renameSkill(design, skill.name, name));
              }}
            />
            <input
              type="text"
              value={skill.description ?? ''}
              placeholder="What it means (optional)"
              aria-label="What it means"
              disabled={readOnly}
              onChange={(e) =>
                onChange({
                  ...design,
                  skills: design.skills.map((candidate) =>
                    candidate.name === skill.name
                      ? { ...candidate, description: e.target.value || undefined }
                      : candidate,
                  ),
                })
              }
            />
            <label
              className="field-checkbox"
              title="Counselors get a level of this skill in Flex; steps can then prefer the highest or lowest level first"
            >
              <input
                type="checkbox"
                checked={Boolean(skill.levels)}
                disabled={readOnly}
                onChange={(e) =>
                  onChange({
                    ...design,
                    skills: design.skills.map((candidate) =>
                      candidate.name === skill.name
                        ? { ...candidate, levels: e.target.checked || undefined }
                        : candidate,
                    ),
                  })
                }
              />
              <span>Levels</span>
            </label>
            {!readOnly && (
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${skill.name}`}
                onClick={() =>
                  onChange({
                    ...design,
                    skills: design.skills.filter((candidate) => candidate.name !== skill.name),
                  })
                }
              >
                <X size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <div className="routing-add">
          <input
            type="text"
            value={newSkill}
            placeholder="New skill"
            aria-label="New skill"
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button type="button" className="secondary-button" disabled={!newSkill.trim()} onClick={add}>
            Add a skill
          </button>
        </div>
      )}

      <h3>Capacity</h3>
      <p className="field-hint">How much a counselor handles at once. These apply to every step they concern.</p>
      <label className="field-checkbox">
        <input
          type="checkbox"
          checked={design.capacity.voiceAndChatExclusive}
          disabled={readOnly}
          onChange={(e) => onChange(setCapacity(design, { voiceAndChatExclusive: e.target.checked }))}
        />
        <span>Never a call and a chat at the same time</span>
      </label>
      <label className="field-checkbox">
        <input
          type="checkbox"
          checked={design.capacity.voicemailOneAtATime}
          disabled={readOnly}
          onChange={(e) => onChange(setCapacity(design, { voicemailOneAtATime: e.target.checked }))}
        />
        <span>One voicemail at a time (taken whatever else they're handling)</span>
      </label>
      <label className="field">
        <span className="field-label">Chats a counselor can have at once</span>
        <input
          type="number"
          min={1}
          value={design.capacity.maxChats ?? ''}
          placeholder="Not set here"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...design,
              capacity: {
                ...design.capacity,
                maxChats: e.target.value ? Number(e.target.value) : undefined,
              },
            })
          }
        />
        <span className="field-hint">The counselors&apos; maxMessageCapacity in Flex; listed in the export.</span>
      </label>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Test a task

// The details most contacts are told apart by come first; transfers and offline contacts are tucked
// away under "More details"
const MAIN_ATTRIBUTES = [
  'channelType',
  'service',
  'serviceLanguage',
  'routingAttributes.service',
  'routingAttributes.serviceLanguage',
];
const DETAIL_ATTRIBUTES = ['transferTargetType', 'targetSid', 'isContactlessTask'];

const QUEUE_REFERENCE = /^\$\{task_queues(?:\.([\w-]+)|\[["']([^"']+)["']\])\}$/;

const testValueLabel = (design: RoutingDesign, value: string | number | boolean) => {
  const queue = typeof value === 'string' ? value.match(QUEUE_REFERENCE) : undefined;
  return queue ? `queue ${queueName(design, queue[1] ?? queue[2])}` : valueLabel(value);
};

// Why a rule didn't take the task: the first condition that failed, in each alternative
const whyNot = (design: RoutingDesign, groups: GroupResult[]) =>
  groups
    .map((group) => group.conditions.find((condition) => condition.result === false)?.condition)
    .filter((condition): condition is Condition => Boolean(condition))
    .map((condition) => `needs ${describeCondition(condition)}`)
    .join('; or ');

export const TestTaskPanel = ({
  design,
  onShowRule,
}: {
  design: RoutingDesign;
  onShowRule?: (workflow: string, ruleId: string) => void;
}) => {
  const workflows = design.workflows.filter((workflow) => !workflow.templateText);
  const [workflowKey, setWorkflowKey] = useState(workflows[0]?.key ?? '');
  const [task, setTask] = useState<TaskAttributes>({});
  const workflow = workflows.find((candidate) => candidate.key === workflowKey);
  if (!workflow) return <p className="field-hint">No workflows to test.</p>;
  const attributes = attributesOf(workflow);
  const order = (attribute: string) =>
    MAIN_ATTRIBUTES.includes(attribute) ? MAIN_ATTRIBUTES.indexOf(attribute) : MAIN_ATTRIBUTES.length;
  const main = Object.entries(attributes)
    .filter(([attribute]) => !DETAIL_ATTRIBUTES.includes(attribute))
    .sort(([a], [b]) => order(a) - order(b));
  const details = Object.entries(attributes).filter(([attribute]) => DETAIL_ATTRIBUTES.includes(attribute));
  const result = testTask(workflow, task);
  const matchedIndex = result.matched ? workflow.rules.indexOf(result.matched) : -1;
  const skipped = result.checked.filter((check) => check.rule !== result.matched);

  const set = (attribute: string, value?: string | number | boolean) =>
    setTask((current) => {
      const next = { ...current };
      if (value === undefined) delete next[attribute];
      else next[attribute] = value;
      return next;
    });
  const row = ([attribute, values]: [string, (string | number | boolean)[]]) => (
    <div key={attribute} className="routing-test-row">
      <span className="routing-test-label">{attributeLabel(attribute)}</span>
      <span className="routing-test-choices">
        <button
          type="button"
          className={`routing-test-choice ${task[attribute] === undefined ? 'active' : ''}`}
          aria-pressed={task[attribute] === undefined}
          onClick={() => set(attribute)}
        >
          Any
        </button>
        {values.map((value) => (
          <button
            key={String(value)}
            type="button"
            className={`routing-test-choice ${task[attribute] === value ? 'active' : ''}`}
            aria-pressed={task[attribute] === value}
            onClick={() => set(attribute, value)}
          >
            {testValueLabel(design, value)}
          </button>
        ))}
      </span>
    </div>
  );
  const described = Object.entries(task)
    .map(([attribute, value]) => `${attributeLabel(attribute)}: ${testValueLabel(design, value)}`)
    .join(' · ');

  return (
    <div className="routing-panel routing-test" role="region" aria-label="Test a task">
      <p className="field-hint">
        Pretend a contact arrives: pick what it looks like, and see which rule takes it and who is offered it.
      </p>
      {workflows.length > 1 && (
        <>
          <h3>1. Where it arrives</h3>
          <div className="routing-test-choices">
            {workflows.map((candidate) => (
              <button
                key={candidate.key}
                type="button"
                className={`routing-test-choice ${candidate.key === workflowKey ? 'active' : ''}`}
                aria-pressed={candidate.key === workflowKey}
                onClick={() => setWorkflowKey(candidate.key)}
              >
                {workflowLabel(candidate)}
              </button>
            ))}
          </div>
        </>
      )}
      <h3>{workflows.length > 1 ? '2. ' : ''}The contact</h3>
      {main.length === 0 && <p className="field-hint">This workflow&apos;s rules don&apos;t look at the contact.</p>}
      {main.map(row)}
      {details.length > 0 && (
        <details className="routing-test-more">
          <summary>More details: transfers and offline contacts</summary>
          {details.map(row)}
        </details>
      )}
      {Object.keys(task).length > 0 && (
        <button type="button" className="link-button" onClick={() => setTask({})}>
          Start over
        </button>
      )}

      <h3>{workflows.length > 1 ? '3. ' : ''}What happens</h3>
      <div className="routing-test-result" role="status">
        <p className="routing-test-contact">{described ? `A contact with ${described}` : 'Any contact'}</p>
        {result.matched ? (
          <>
            <p>
              is taken by rule {matchedIndex + 1}, <strong>{result.matched.name || 'unnamed'}</strong>
              {onShowRule && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onShowRule(workflow.key, result.matched!.id)}
                  >
                    (show it)
                  </button>
                </>
              )}
              , and offered:
            </p>
            <ol className="routing-test-timeline">
              {result.matched.targets.map((target, index) => (
                <li key={target.id}>
                  <span>
                    in <strong>{queueName(design, target.queue)}</strong> to{' '}
                    {target.knownWorker ? 'the counselor it was transferred to' : describeWho(target.who).toLowerCase()}
                    {target.priority !== undefined ? ` (priority ${target.priority})` : ''}.
                  </span>
                  <span className="field-hint">
                    {index === result.matched!.targets.length - 1 && target.moveOn.kind !== 'wait'
                      ? 'If nobody takes it, it leaves this rule.'
                      : `${describeMoveOn(target.moveOn)}.`}
                  </span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>
            isn&apos;t taken by any rule: TaskRouter would send it to the workflow&apos;s default queue (if there is
            one).
          </p>
        )}
        {skipped.length > 0 && (
          <details>
            <summary>
              {result.matched ? `Rules before it (${skipped.length})` : `Rules tried (${skipped.length})`}
            </summary>
            <ul className="routing-test-steps">
              {skipped.map(({ rule, groups, matched }) => (
                <li key={rule.id} className={matched === 'unknown' ? 'unknown' : 'no'}>
                  {matched === 'unknown' ? '?' : '✗'} <strong>{rule.name || 'unnamed'}</strong>:{' '}
                  {matched === 'unknown'
                    ? "has a custom condition that can't be tried here; assumed not to match"
                    : whyNot(design, groups) || describeConditions(rule.when)}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Check

export const CheckList = ({ issues, onShow }: { issues: RoutingIssue[]; onShow: (issue: RoutingIssue) => void }) => (
  <div className="routing-panel" role="region" aria-label="Check">
    <p className="flow-check-summary">
      {issues.length === 0
        ? 'Nothing to fix.'
        : `${issues.filter((issue) => issue.severity === 'error').length} errors, ${issues.filter((issue) => issue.severity === 'warning').length} warnings`}
    </p>
    <ul className="flow-issue-list">
      {issues.map((issue) => (
        <li key={issue.key} className={`flow-issue ${issue.severity}`}>
          <span className="flow-issue-icon">
            {issue.severity === 'error' ? <CircleAlert size={15} /> : <TriangleAlert size={15} />}
          </span>
          <button type="button" className="link-button flow-issue-message" onClick={() => onShow(issue)}>
            {issue.message}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export const workflowLabel = (workflow: Workflow) => workflow.name || workflow.key;
