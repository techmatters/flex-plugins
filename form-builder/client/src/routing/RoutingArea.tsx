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
 * Saved automatically, with the same "someone else changed it" check as boards. Its state and
 * logic are in routingSlice.ts.
 */
import { useCallback, useEffect } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeft, ChevronsDownUp, ChevronsUpDown, Download } from 'lucide-react';
import type { RoutingImport } from '@tech-matters/form-builder-shared';
import type { FromBranch } from '@tech-matters/form-builder-shared';
import { BranchPicker, ImportedFrom } from '../common/BranchPicker';
import { Loading } from '../common/Loading';
import type { DesignStatus } from '@tech-matters/form-builder-shared/designStatus';
import { DESIGN_STATUSES } from '@tech-matters/form-builder-shared/designStatus';
import { DesignStatusBadge, DesignStatusPicker } from '../common/DesignStatusPicker';
import { HelplineFilter } from '../common/HelplineFilter';
import type { Rule } from '@tech-matters/form-builder-shared/routing/model';
import { routingStatusOf } from '@tech-matters/form-builder-shared/routing/model';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { RuleCard } from './RuleCard';
import { RoutingDiagram } from './RoutingDiagram';
import { CheckList, QueuesPanel, SkillsPanel, TestTaskPanel, workflowLabel } from './RoutingPanels';
import { COMMON_RULES, hasCommonRule } from './commonRules';
import {
  addRoutingCommonRule,
  addRoutingRule,
  adoptRoutingImport,
  branchChosen,
  cardsExpanded,
  cardToggled,
  enterRouting,
  filterChosen,
  helplineChosen,
  helplineFilterChosen,
  loadRouting,
  loadRoutingBranches,
  loadRoutingList,
  openRouting,
  previewRoutingImport,
  routingExport,
  RoutingFilter,
  RoutingTab,
  ruleChanged,
  ruleMoved,
  ruleRemoved,
  ruleSelected,
  ruleShown,
  selectRouting,
  selectRoutingEditor,
  selectRoutingHelplineCodes,
  selectRoutingIssues,
  startEmptyRouting,
  statusChanged,
  tabChosen,
  workflowChanged,
} from './routingSlice';
import './routing.css';

// The workflow open in the editor
const WorkflowPage = () => {
  const dispatch = useAppDispatch();
  const { design, tab, selectedRuleId, expanded } = useAppSelector(selectRoutingEditor)!;
  // For now helpline staff see their routing design without changing it
  const readOnly = !useAppSelector(selectActingAsStaff);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const workflow = tab.kind === 'workflow' ? design.workflows.find(candidate => candidate.key === tab.key) : undefined;
  if (!workflow) return null;
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
  const workflowKey = workflow.key;
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    dispatch(ruleMoved({ workflowKey, ruleId: String(active.id), overId: String(over.id) }));
  };
  return (
    <div className="routing-workflow">
      <div className="routing-cards">
        {!readOnly && (
          <div className="routing-common-rules" aria-label="Common rules">
            <span className="field-hint">Common rules:</span>
            {COMMON_RULES.map(common => {
              const added = hasCommonRule(workflow, design, common);
              return (
                <button
                  key={common.name}
                  type="button"
                  className="routing-chip common-rule"
                  title={added ? `${common.name} is already in this workflow` : common.description}
                  disabled={added}
                  onClick={() => dispatch(addRoutingCommonRule(workflowKey, common))}
                >
                  {added ? '✓' : '+'} {common.name}
                </button>
              );
            })}
          </div>
        )}
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
            onChange={e => dispatch(workflowChanged({ ...workflow, name: e.target.value }))}
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
            onChange={e =>
              dispatch(
                workflowChanged({
                  ...workflow,
                  reservationTimeout: e.target.value ? Number(e.target.value) : undefined,
                }),
              )
            }
          />
        </label>
        <div className="routing-rules-head">
          <p className="field-hint">
            A new task goes through these rules in order; the first one it matches decides where it goes. Drag the cards
            to change the order.
          </p>
          <button
            type="button"
            className="link-button"
            onClick={() => dispatch(cardsExpanded(workflow.rules.map(rule => rule.id)))}
          >
            <ChevronsUpDown size={14} /> Expand all
          </button>
          <button type="button" className="link-button" onClick={() => dispatch(cardsExpanded([]))}>
            <ChevronsDownUp size={14} /> Collapse all
          </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={workflow.rules.map(rule => rule.id)} strategy={verticalListSortingStrategy}>
            <ol className="routing-rule-list">
              {workflow.rules.map((rule, index) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  index={index}
                  design={design}
                  readOnly={readOnly}
                  selected={rule.id === selectedRuleId}
                  expanded={expanded.includes(rule.id)}
                  onToggle={() => dispatch(cardToggled(rule.id))}
                  onSelect={() => dispatch(ruleSelected(rule.id))}
                  onChange={(changed: Rule) => dispatch(ruleChanged({ workflowKey, rule: changed }))}
                  onRemove={() => dispatch(ruleRemoved({ workflowKey, ruleId: rule.id }))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        {!readOnly && (
          <button type="button" className="secondary-button" onClick={() => dispatch(addRoutingRule(workflowKey))}>
            + Add a rule
          </button>
        )}
      </div>
      <div className="routing-diagram" aria-label="Diagram">
        <RoutingDiagram
          design={design}
          workflow={workflow}
          selectedRuleId={selectedRuleId}
          onSelectRule={ruleId => {
            dispatch(ruleShown(ruleId));
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

const SAVE_STATE_TEXT = {
  saved: 'All changes saved',
  unsaved: 'Unsaved changes…',
  saving: 'Saving…',
  conflict: 'Not saved',
  error: 'Could not save',
};

const sameTab = (a: RoutingTab, b: RoutingTab) =>
  a.kind === b.kind && (a.kind !== 'workflow' || (b.kind === 'workflow' && a.key === b.key));

const Editor = () => {
  const dispatch = useAppDispatch();
  const { code } = useAppSelector(selectRouting);
  const { design, tab, saveState, conflict } = useAppSelector(selectRoutingEditor)!;
  const staffMode = useAppSelector(selectActingAsStaff);
  const issues = useAppSelector(selectRoutingIssues);

  const exportForClaude = () => {
    const file = dispatch(routingExport());
    if (file) download(file.fileName, file.text);
  };

  const tabs: { tab: RoutingTab; label: string }[] = [
    ...design.workflows.map(workflow => ({
      tab: { kind: 'workflow', key: workflow.key } as RoutingTab,
      label: workflowLabel(workflow),
    })),
    { tab: { kind: 'queues' }, label: `Queues (${design.queues.length})` },
    { tab: { kind: 'skills' }, label: 'Skills & capacity' },
    { tab: { kind: 'test' }, label: 'Test a task' },
    { tab: { kind: 'check' }, label: `Check${issues.length ? ` (${issues.length})` : ''}` },
  ];

  return (
    <div className="routing-editor">
      <div className="flow-toolbar">
        <button type="button" className="link-button area-back" onClick={() => dispatch(openRouting(''))}>
          <ArrowLeft size={14} aria-hidden /> All routing
        </button>
        <h2>Routing · {code.toUpperCase()}</h2>
        <DesignStatusPicker
          status={routingStatusOf(design)}
          isNew={!design.imported}
          editable={staffMode}
          label="Status of the routing design"
          onChange={(next: DesignStatus) => dispatch(statusChanged(next))}
        />
        <span className={`flow-save-state ${saveState}`} role="status">
          {SAVE_STATE_TEXT[saveState]}
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
          <button type="button" className="secondary-button" onClick={() => dispatch(loadRouting())}>
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
            aria-selected={sameTab(candidate, tab)}
            className={
              candidate.kind === 'check' && issues.some(issue => issue.severity === 'error') ? 'has-errors' : ''
            }
            onClick={() => dispatch(tabChosen(candidate))}
          >
            {label}
          </button>
        ))}
      </div>
      {tab.kind === 'workflow' && <WorkflowPage />}
      {tab.kind === 'queues' && <QueuesPanel />}
      {tab.kind === 'skills' && <SkillsPanel />}
      {tab.kind === 'test' && <TestTaskPanel />}
      {tab.kind === 'check' && <CheckList />}
    </div>
  );
};

const ImportPreview = ({ preview, onUse }: { preview: RoutingImport & FromBranch; onUse: () => void }) => (
  <div className="flows-import-preview" role="region" aria-label="Routing import preview">
    <h4>Found in {preview.report.readFrom}</h4>
    <ImportedFrom source={preview.source} />
    <ul>
      {preview.report.workflows.map(workflow => (
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
        {preview.report.notes.map(note => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    )}
    <button type="button" className="primary-button" onClick={onUse}>
      Use this as the routing design
    </button>
  </div>
);

/**
 * The start page: every helpline's routing design this person can see, with its status
 */
const RoutingHome = () => {
  const dispatch = useAppDispatch();
  const { summaries, error, filter, helpline, choice: code } = useAppSelector(selectRouting).home;
  const helplineCodes = useAppSelector(selectRoutingHelplineCodes);
  const staffMode = useAppSelector(selectActingAsStaff);

  // Read again each time the start page shows
  useEffect(() => {
    dispatch(loadRoutingList());
  }, [dispatch]);

  const allRows = summaries ?? [];
  const rows = allRows.filter(row => !helpline || row.code === helpline);
  const shown = rows.filter(row => filter === 'all' || row.status === filter);
  const withDesign = new Set(allRows.map(row => row.code));

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
          <select value={code} aria-label="Helpline" onChange={e => dispatch(helplineChosen(e.target.value))}>
            <option value="">Choose…</option>
            {helplineCodes.map(candidate => (
              <option key={candidate} value={candidate}>
                {candidate.toUpperCase()}
                {withDesign.has(candidate) ? '' : ' (no design yet)'}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="primary-button" disabled={!code} onClick={() => dispatch(openRouting(code))}>
          {code && !withDesign.has(code) && staffMode ? 'Start' : 'Open'}
        </button>
      </div>
      {!summaries && !error && <Loading text="Loading routing designs…" />}
      {summaries && allRows.length === 0 && <p>No routing designs yet.</p>}
      {allRows.length > 0 && (
        <>
          <div className="area-home-filters">
            <HelplineFilter
              codes={allRows.map(row => row.code)}
              value={helpline}
              onChange={(value: string) => dispatch(helplineFilterChosen(value))}
            />
            <div className="area-home-filter" role="group" aria-label="Show">
              {(['all', ...DESIGN_STATUSES.map(status => status.value)] as RoutingFilter[]).map(candidate => (
                <button
                  key={candidate}
                  type="button"
                  className={filter === candidate ? 'active' : ''}
                  aria-pressed={filter === candidate}
                  onClick={() => dispatch(filterChosen(candidate))}
                >
                  {candidate === 'all' ? 'All' : DESIGN_STATUSES.find(status => status.value === candidate)?.label} (
                  {candidate === 'all' ? rows.length : rows.filter(row => row.status === candidate).length})
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
              {shown.map(row => (
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
                      onClick={() => dispatch(openRouting(row.code))}
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

export const RoutingArea = () => {
  const dispatch = useAppDispatch();
  const { code, stored, error, preview, branch, importing, working, editor } = useAppSelector(selectRouting);
  const staffMode = useAppSelector(selectActingAsStaff);
  // Stable: the branch picker loads the branches again when it changes
  const loadBranches = useCallback(() => dispatch(loadRoutingBranches()), [dispatch]);
  const chooseBranch = (value: string) => dispatch(branchChosen(value));
  const previewImport = () => dispatch(previewRoutingImport());

  // Someone with a single helpline gets its routing straight away
  useEffect(() => {
    dispatch(enterRouting());
  }, [dispatch]);

  if (!code) return <RoutingHome />;

  return (
    <main className="routing-area">
      <div className="routing-pick">
        {(stored === null || preview) && (
          <button type="button" className="link-button area-back" onClick={() => dispatch(openRouting(''))}>
            <ArrowLeft size={14} aria-hidden /> All routing
          </button>
        )}
        {staffMode && code && stored && !preview && (
          <>
            <BranchPicker load={loadBranches} value={branch} onChange={chooseBranch} />
            <button type="button" className="link-button" disabled={importing} onClick={previewImport}>
              Import again from the live config
            </button>
          </>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {importing && <Loading text="Reading the live config…" />}
      {stored === undefined && !error && <Loading text={`Loading ${code.toUpperCase()}'s routing…`} />}
      {code && stored === null && !preview && (
        <div className="routing-empty">
          <p>{code.toUpperCase()} has no routing design yet.</p>
          {staffMode && <BranchPicker load={loadBranches} value={branch} onChange={chooseBranch} />}
          {staffMode && (
            <button type="button" className="primary-button" disabled={working || importing} onClick={previewImport}>
              Import it from the live config
            </button>
          )}
          {staffMode && (
            <button
              type="button"
              className="secondary-button"
              disabled={working}
              onClick={() => dispatch(startEmptyRouting())}
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
            dispatch(adoptRoutingImport());
          }}
        />
      )}
      {code && stored && !preview && editor && <Editor />}
    </main>
  );
};
