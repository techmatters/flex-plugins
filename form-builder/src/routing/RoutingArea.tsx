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
 * The Routing area (docs/routing-designer.md): a helpline's TaskRouter design. Pick the helpline;
 * if it has no design yet, Aselo staff import it from the live config (or anyone starts empty).
 * Saved automatically, with the same "someone else changed it" check as boards.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowLeft, Download } from 'lucide-react';
import type { RoutingImport } from '../../server/routingImport';
import type { FromBranch } from '../../server/branches';
import { BranchPicker, ImportedFrom } from '../components/BranchPicker';
import type { DesignStatus } from '../designStatus';
import { DESIGN_STATUSES, STATUS_AFTER_CHANGE } from '../designStatus';
import { DesignStatusBadge, DesignStatusPicker } from '../components/DesignStatusPicker';
import { HelplineFilter } from '../components/HelplineFilter';
import type { RoutingDesign, RoutingSummary, Rule, StoredRouting, Workflow } from './model';
import { emptyRouting, routingStatusOf } from './model';
import { httpRoutingClient, RoutingClient } from './routingClient';
import { newRule, updateRule, updateWorkflow } from './edit';
import { RuleCard } from './RuleCard';
import { RoutingDiagram } from './RoutingDiagram';
import { CheckList, QueuesPanel, SkillsBar, SkillsPanel, TestTaskPanel, workflowLabel } from './RoutingPanels';
import { routingChecks, RoutingIssue } from './routingChecks';
import { generateRouting } from './generate';
import './routing.css';

type Props = {
  client?: RoutingClient;
  helplineCodes: string[];
  staffMode: boolean;
};

type Tab =
  { kind: 'workflow'; key: string } | { kind: 'queues' } | { kind: 'skills' } | { kind: 'test' } | { kind: 'check' };

const AUTOSAVE_DELAY_MS = 1200;

const WorkflowPage = ({
  design,
  workflow,
  readOnly,
  selectedRuleId,
  onSelectRule,
  onChange,
}: {
  design: RoutingDesign;
  workflow: Workflow;
  readOnly: boolean;
  selectedRuleId?: string;
  onSelectRule: (ruleId: string) => void;
  onChange: (workflow: Workflow) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  if (workflow.templateText) {
    return (
      <div className="routing-panel">
        <p className="alert alert-info">
          “{workflowLabel(workflow)}” is built by template code from the helpline&apos;s queues ({workflow.template}),
          so it isn&apos;t a list of rules to edit here. It stays as it is.
        </p>
      </div>
    );
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = workflow.rules.findIndex((rule) => rule.id === active.id);
    const to = workflow.rules.findIndex((rule) => rule.id === over.id);
    onChange({ ...workflow, rules: arrayMove(workflow.rules, from, to) });
  };
  return (
    <div className="routing-workflow">
      <div className="routing-cards">
        <SkillsBar design={design} />
        {workflow.shared && (
          <p className="alert alert-info">
            Other helplines use this workflow&apos;s template ({workflow.template}): changes here are written to a
            template of this helpline&apos;s own.
          </p>
        )}
        <label className="field routing-workflow-settings">
          <span className="field-label">Name</span>
          <input
            type="text"
            value={workflow.name}
            disabled={readOnly}
            onChange={(e) => onChange({ ...workflow, name: e.target.value })}
          />
        </label>
        <label className="field routing-workflow-settings">
          <span className="field-label">Seconds a counselor has to accept a task</span>
          <input
            type="number"
            min={1}
            value={workflow.reservationTimeout ?? ''}
            placeholder="Twilio's default (120)"
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                ...workflow,
                reservationTimeout: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </label>
        <p className="field-hint">
          A new task goes through these rules in order; the first one it matches decides where it goes. Drag the cards
          to change the order.
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={workflow.rules.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
            <ol className="routing-rule-list">
              {workflow.rules.map((rule, index) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  index={index}
                  design={design}
                  readOnly={readOnly}
                  selected={rule.id === selectedRuleId}
                  onSelect={() => onSelectRule(rule.id)}
                  onChange={(changed: Rule) => onChange(updateRule(workflow, rule.id, () => changed))}
                  onRemove={() =>
                    onChange({
                      ...workflow,
                      rules: workflow.rules.filter((candidate) => candidate.id !== rule.id),
                    })
                  }
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        {!readOnly && (
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              onChange({
                ...workflow,
                rules: [...workflow.rules, newRule(`Rule ${workflow.rules.length + 1}`)],
              })
            }
          >
            + Add a rule
          </button>
        )}
      </div>
      <div className="routing-diagram" aria-label="Diagram">
        <RoutingDiagram
          design={design}
          workflow={workflow}
          selectedRuleId={selectedRuleId}
          onSelectRule={(ruleId) => {
            onSelectRule(ruleId);
            document.getElementById(`rule-${ruleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      </div>
    </div>
  );
};

const download = (fileName: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const Editor = ({
  stored,
  client,
  staffMode,
  onReload,
  onBack,
}: {
  stored: StoredRouting;
  client: RoutingClient;
  staffMode: boolean;
  onReload: () => void;
  onBack: () => void;
}) => {
  const [design, setDesignState] = useState(stored.design);
  // Every change to the design makes it In progress again (the status is set apart)
  const setDesign = (next: RoutingDesign) => setDesignState({ ...next, status: STATUS_AFTER_CHANGE });
  const firstWorkflow = design.workflows.find((workflow) => !workflow.templateText) ?? design.workflows[0];
  const [tab, setTab] = useState<Tab>(
    firstWorkflow ? { kind: 'workflow', key: firstWorkflow.key } : { kind: 'queues' },
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string>();
  const issues = useMemo(() => routingChecks(design), [design]);
  // For now helpline staff see their routing design without changing it
  const readOnly = !staffMode;

  // ----- Saving
  const json = useMemo(() => JSON.stringify(design), [design]);
  const revision = useRef(stored.meta.revision);
  const savedJson = useRef(JSON.stringify(stored.design));
  const latest = useRef(json);
  latest.current = json;
  const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving' | 'conflict' | 'error'>('saved');
  const [conflict, setConflict] = useState<{ updatedBy?: string; updatedAt?: string }>();
  const stopped = useRef(false);

  const save = useCallback(async () => {
    if (stopped.current || latest.current === savedJson.current) return;
    const toSave = latest.current;
    setStatus('saving');
    try {
      const outcome = await client.save(stored.code, revision.current, JSON.parse(toSave));
      if (outcome.ok) {
        revision.current = outcome.meta.revision;
        savedJson.current = toSave;
        setStatus(latest.current === toSave ? 'saved' : 'unsaved');
      } else {
        stopped.current = true;
        setConflict(outcome.conflict);
        setStatus('conflict');
      }
    } catch {
      setStatus('error');
    }
  }, [client, stored.code]);

  useEffect(() => {
    if (stopped.current || json === savedJson.current) return undefined;
    setStatus('unsaved');
    const timer = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [json, save]);

  const showRule = (workflow: string, ruleId: string) =>
    showIssue({ key: ruleId, severity: 'warning', message: '', workflow, ruleId });

  const showIssue = (issue: RoutingIssue) => {
    if (issue.workflow) {
      setTab({ kind: 'workflow', key: issue.workflow });
      if (issue.ruleId) {
        setSelectedRuleId(issue.ruleId);
        setTimeout(
          () =>
            document.getElementById(`rule-${issue.ruleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
          50,
        );
      }
    } else if (issue.queue) setTab({ kind: 'queues' });
    else setTab({ kind: 'skills' });
  };

  const exportForClaude = () => {
    const generated = generateRouting(design);
    download(
      `${stored.code}-routing.json`,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          about:
            "A helpline's TaskRouter routing, designed in the Aselo Builder (docs/routing-designer.md). generated.workflows are the workflow templates (.tftpl) to write under twilio-iac/helplines (a shared template's changes go to a template of this helpline's own), generated.workflowsBlock and generated.queuesBlock replace the workflows and task_queues in the helpline's common.hcl, and skills/capacity are what Flex needs (each account's skills, the counselors' maxMessageCapacity). Anything not changed in the designer is exactly as it is live.",
          helpline: stored.code,
          updatedAt: stored.meta.updatedAt,
          // Implement it only when it's 'ready' (Ready for Claude)
          status: routingStatusOf(design),
          isNew: !design.imported,
          design,
          generated,
          checks: issues.map(({ severity, message }) => ({ severity, message })),
        },
        null,
        2,
      )}\n`,
    );
  };

  const tabs: { tab: Tab; label: string }[] = [
    ...design.workflows.map((workflow) => ({
      tab: { kind: 'workflow', key: workflow.key } as Tab,
      label: workflowLabel(workflow),
    })),
    { tab: { kind: 'queues' }, label: `Queues (${design.queues.length})` },
    { tab: { kind: 'skills' }, label: 'Skills & capacity' },
    { tab: { kind: 'test' }, label: 'Test a task' },
    { tab: { kind: 'check' }, label: `Check${issues.length ? ` (${issues.length})` : ''}` },
  ];
  const same = (a: Tab, b: Tab) =>
    a.kind === b.kind && (a.kind !== 'workflow' || (b.kind === 'workflow' && a.key === b.key));
  const workflow =
    tab.kind === 'workflow' ? design.workflows.find((candidate) => candidate.key === tab.key) : undefined;

  return (
    <div className="routing-editor">
      <div className="flow-toolbar">
        <button type="button" className="link-button area-back" onClick={onBack}>
          <ArrowLeft size={14} aria-hidden /> All routing
        </button>
        <h2>Routing · {stored.code.toUpperCase()}</h2>
        <DesignStatusPicker
          status={routingStatusOf(design)}
          isNew={!design.imported}
          editable={staffMode}
          label="Status of the routing design"
          onChange={(next: DesignStatus) => setDesignState({ ...design, status: next })}
        />
        <span className={`flow-save-state ${status}`} role="status">
          {
            {
              saved: 'All changes saved',
              unsaved: 'Unsaved changes…',
              saving: 'Saving…',
              conflict: 'Not saved',
              error: 'Could not save',
            }[status]
          }
        </span>
        {staffMode && (
          <button type="button" className="secondary-button flow-refresh" onClick={exportForClaude}>
            <Download size={15} aria-hidden /> Export for Claude
          </button>
        )}
      </div>
      {conflict && (
        <div className="alert alert-error">
          {conflict.updatedBy ?? 'Someone else'} changed this design, so your latest changes weren&apos;t saved.{' '}
          <button type="button" className="secondary-button" onClick={onReload}>
            Reload
          </button>
        </div>
      )}
      <div className="routing-tabs" role="tablist">
        {tabs.map(({ tab: candidate, label }) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={same(candidate, tab)}
            className={
              candidate.kind === 'check' && issues.some((issue) => issue.severity === 'error') ? 'has-errors' : ''
            }
            onClick={() => setTab(candidate)}
          >
            {label}
          </button>
        ))}
      </div>
      {workflow && (
        <WorkflowPage
          design={design}
          workflow={workflow}
          readOnly={readOnly}
          selectedRuleId={selectedRuleId}
          onSelectRule={setSelectedRuleId}
          onChange={(changed) => setDesign(updateWorkflow(design, changed.key, () => changed))}
        />
      )}
      {tab.kind === 'queues' && <QueuesPanel design={design} readOnly={readOnly} onChange={setDesign} />}
      {tab.kind === 'skills' && <SkillsPanel design={design} readOnly={readOnly} onChange={setDesign} />}
      {tab.kind === 'test' && <TestTaskPanel design={design} onShowRule={showRule} />}
      {tab.kind === 'check' && <CheckList issues={issues} onShow={showIssue} />}
    </div>
  );
};

const ImportPreview = ({ preview, onUse }: { preview: RoutingImport & FromBranch; onUse: () => void }) => (
  <div className="flows-import-preview" role="region" aria-label="Routing import preview">
    <h4>Found in {preview.report.readFrom}</h4>
    <ImportedFrom source={preview.source} />
    <ul>
      {preview.report.workflows.map((workflow) => (
        <li key={workflow.key}>
          <strong>{workflow.name}</strong>: {workflow.rules} rules
          {workflow.shared ? ' (shared template)' : ''} <span className="field-hint">({workflow.template})</span>
        </li>
      ))}
    </ul>
    <p>
      {preview.report.queues} queues · skills: {preview.report.skills.join(', ') || 'none'}
    </p>
    {preview.report.notes.length > 0 && (
      <ul className="flows-import-notes">
        {preview.report.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    )}
    <button type="button" className="primary-button" onClick={onUse}>
      Use this as the routing design
    </button>
  </div>
);

type Filter = 'all' | DesignStatus;

/**
 * The start page: every helpline's routing design this person can see, with its status
 */
const RoutingHome = ({
  client,
  helplineCodes,
  staffMode,
  onOpen,
}: {
  client: RoutingClient;
  helplineCodes: string[];
  staffMode: boolean;
  onOpen: (code: string) => void;
}) => {
  const [summaries, setSummaries] = useState<RoutingSummary[]>();
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<Filter>('all');
  const [helpline, setHelpline] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    client
      .list()
      .then(setSummaries)
      .catch((err: Error) => setError(err.message));
  }, [client]);

  const allRows = summaries ?? [];
  const rows = allRows.filter((row) => !helpline || row.code === helpline);
  const shown = rows.filter((row) => filter === 'all' || row.status === filter);
  const withDesign = new Set(allRows.map((row) => row.code));

  return (
    <main className="area-home routing-home">
      <h2>Routing</h2>
      <p className="field-hint area-home-intro">
        How each helpline&apos;s contacts reach counselors: the TaskRouter workflows, queues, skills and capacity.
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="area-home-actions">
        <label className="field">
          <span className="field-label">Open a helpline&apos;s routing</span>
          <select value={code} aria-label="Helpline" onChange={(e) => setCode(e.target.value)}>
            <option value="">Choose…</option>
            {helplineCodes.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate.toUpperCase()}
                {withDesign.has(candidate) ? '' : ' (no design yet)'}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="primary-button" disabled={!code} onClick={() => onOpen(code)}>
          {code && !withDesign.has(code) && staffMode ? 'Start' : 'Open'}
        </button>
      </div>
      {!summaries && !error && <p>Loading routing designs…</p>}
      {summaries && allRows.length === 0 && <p>No routing designs yet.</p>}
      {allRows.length > 0 && (
        <>
          <div className="area-home-filters">
            <HelplineFilter codes={allRows.map((row) => row.code)} value={helpline} onChange={setHelpline} />
            <div className="area-home-filter" role="group" aria-label="Show">
              {(['all', ...DESIGN_STATUSES.map((status) => status.value)] as Filter[]).map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  className={filter === candidate ? 'active' : ''}
                  aria-pressed={filter === candidate}
                  onClick={() => setFilter(candidate)}
                >
                  {candidate === 'all' ? 'All' : DESIGN_STATUSES.find((status) => status.value === candidate)?.label} (
                  {candidate === 'all' ? rows.length : rows.filter((row) => row.status === candidate).length})
                </button>
              ))}
            </div>
          </div>
          <table className="area-home-table">
            <thead>
              <tr>
                <th>Helpline</th>
                <th>Workflows</th>
                <th>Queues</th>
                <th>Status</th>
                <th>Last change</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.code}>
                  <td className="area-home-name">{row.code.toUpperCase()}</td>
                  <td>{row.workflows}</td>
                  <td>{row.queues}</td>
                  <td>
                    <DesignStatusBadge status={row.status} isNew={row.isNew} />
                  </td>
                  <td>
                    {row.meta.updatedBy}, {new Date(row.meta.updatedAt).toLocaleString()}
                  </td>
                  <td className="area-home-open">
                    <button
                      type="button"
                      className="secondary-button"
                      aria-label={`Open ${row.code.toUpperCase()} routing`}
                      onClick={() => onOpen(row.code)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
};

export const RoutingArea = ({ client = httpRoutingClient, helplineCodes, staffMode }: Props) => {
  const [code, setCode] = useState(helplineCodes.length === 1 ? helplineCodes[0] : '');
  const [stored, setStored] = useState<StoredRouting | null>();
  const [error, setError] = useState<string>();
  const [preview, setPreview] = useState<RoutingImport & FromBranch>();
  const [branch, setBranch] = useState('');
  const previewImport = async () => {
    setError(undefined);
    try {
      setPreview(await client.previewImport(code, branch));
    } catch (err) {
      setError((err as Error).message);
    }
  };
  const [loadCount, setLoadCount] = useState(0);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setStored(undefined);
    setPreview(undefined);
    setError(undefined);
    if (!code) return;
    client
      .load(code)
      .then((found) => setStored(found ?? null))
      .catch((err: Error) => setError(err.message));
  }, [client, code, loadCount]);

  // Saves a new design (empty, or imported), over the one there is now, if any
  const create = async (design: RoutingDesign) => {
    setWorking(true);
    try {
      const current = await client.load(code);
      const outcome = await client.save(code, current?.meta.revision ?? 0, design);
      if (!outcome.ok)
        throw new Error(`${outcome.conflict.updatedBy ?? 'Someone else'} just saved a design for ${code}: reload.`);
      setLoadCount((count) => count + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(false);
    }
  };

  if (!code)
    return <RoutingHome client={client} helplineCodes={helplineCodes} staffMode={staffMode} onOpen={setCode} />;

  return (
    <main className="routing-area">
      <div className="routing-pick">
        {(stored === null || preview) && (
          <button type="button" className="link-button area-back" onClick={() => setCode('')}>
            <ArrowLeft size={14} aria-hidden /> All routing
          </button>
        )}
        {staffMode && code && stored && !preview && (
          <>
            <BranchPicker load={client.branches} value={branch} onChange={setBranch} />
            <button type="button" className="link-button" onClick={previewImport}>
              Import again from the live config
            </button>
          </>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {code && stored === null && !preview && (
        <div className="routing-empty">
          <p>{code.toUpperCase()} has no routing design yet.</p>
          {staffMode && <BranchPicker load={client.branches} value={branch} onChange={setBranch} />}
          {staffMode && (
            <button type="button" className="primary-button" disabled={working} onClick={previewImport}>
              Import it from the live config
            </button>
          )}
          {staffMode && (
            <button
              type="button"
              className="secondary-button"
              disabled={working}
              onClick={() => create(emptyRouting(code))}
            >
              Start an empty design
            </button>
          )}
        </div>
      )}
      {preview && (
        <ImportPreview
          preview={preview}
          onUse={() => {
            // eslint-disable-next-line no-alert
            if (
              stored &&
              !window.confirm(`Replace ${code.toUpperCase()}'s routing design with the one read from the live config?`)
            )
              return;
            setPreview(undefined);
            create(preview.source ? { ...preview.design, importedFrom: preview.source } : preview.design);
          }}
        />
      )}
      {code && stored && !preview && (
        <Editor
          key={`${code}-${stored.meta.revision}-${loadCount}`}
          stored={stored}
          client={client}
          staffMode={staffMode}
          onReload={() => setLoadCount((count) => count + 1)}
          onBack={() => setCode('')}
        />
      )}
    </main>
  );
};
