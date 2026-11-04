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
 * The Routing area's state (docs/routing-designer.md): the start page's list and filters, the
 * helpline open, its design as stored and as it's being edited, the import from the live config,
 * and the editor's tab, open cards and "Test a task" choices.
 *
 * The design is saved a moment after each change (routingAutosave), one save at a time.
 * If someone else saved it in between, saving stops and the user is asked to reload, rather than
 * either person silently overwriting the other.
 */
import { addListener, createSelector, createSlice, PayloadAction, UnknownAction, WithSlice } from '@reduxjs/toolkit';
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import type { BranchChoice, FromBranch, RoutingImport } from '@tech-matters/form-builder-shared';
import type { DesignStatus } from '@tech-matters/form-builder-shared/designStatus';
import { STATUS_AFTER_CHANGE } from '@tech-matters/form-builder-shared/designStatus';
import type {
  Capacity,
  Queue,
  RoutingDesign,
  RoutingSummary,
  Rule,
  Skill,
  StoredRouting,
  Workflow,
} from '@tech-matters/form-builder-shared/routing/model';
import { emptyRouting, routingStatusOf } from '@tech-matters/form-builder-shared/routing/model';
import type { TaskAttributes } from '@tech-matters/form-builder-shared/routing/describe';
import type { AppDispatch, AppThunk, RootState, Services } from '../app/store';
import { rootReducer } from '../app/store';
import { newRule, renameSkill, setCapacity, updateRule, updateWorkflow } from './edit';
import { addCommonRule, CommonRule } from './commonRules';
import { routingChecks, RoutingIssue } from './routingChecks';
import { generateRouting } from './generate';

export type RoutingFilter = 'all' | DesignStatus;

export type RoutingTab =
  | { kind: 'workflow'; key: string }
  | { kind: 'queues' }
  | { kind: 'skills' }
  | { kind: 'test' }
  | { kind: 'check' };

export type RoutingSaveState = 'saved' | 'unsaved' | 'saving' | 'conflict' | 'error';

export type RoutingConflict = { updatedBy?: string; updatedAt?: string };

// The open design, as it's being edited
export type RoutingEditorState = {
  code: string;
  design: RoutingDesign;
  // The server's revision, so two people can't overwrite each other unknowingly
  revision: number;
  // What was last saved, so an unchanged design isn't saved again
  savedJson: string;
  saveState: RoutingSaveState;
  // A save is under way (edits can still be made meanwhile)
  saving: boolean;
  conflict?: RoutingConflict;
  tab: RoutingTab;
  selectedRuleId?: string;
  // Cards start collapsed; opened ones are remembered while the workflow pages are showing
  expanded: string[];
  // "Test a task": where the contact arrives, and what it looks like
  test: { workflowKey: string; task: TaskAttributes };
  // What's typed to add a queue or a skill
  newQueueName: string;
  newSkillName: string;
};

export type RoutingState = {
  // The area was shown once (someone with a single helpline gets it opened straight away)
  entered: boolean;
  // The start page: every helpline's design this person can see, and how they're filtered
  home: {
    summaries?: RoutingSummary[];
    error?: string;
    filter: RoutingFilter;
    helpline: string;
    // The helpline chosen to open
    choice: string;
  };
  // The helpline open ('' on the start page)
  code: string;
  // undefined while loading, null when it has no design yet
  stored?: StoredRouting | null;
  error?: string;
  preview?: RoutingImport & FromBranch;
  // The flex-plugins branch to import from ('' for the default)
  branch: string;
  // Reading the live config takes a while: said while it does
  importing: boolean;
  // Saving a new design (empty, or imported)
  working: boolean;
  editor?: RoutingEditorState;
};

const AUTOSAVE_DELAY_MS = 1200;

const initialHome: RoutingState['home'] = { filter: 'all', helpline: '', choice: '' };

const initialState: RoutingState = {
  entered: false,
  home: initialHome,
  code: '',
  branch: '',
  importing: false,
  working: false,
};

const firstTestWorkflow = (design: RoutingDesign) =>
  design.workflows.find(workflow => !workflow.templateText)?.key ?? '';

const editorFor = (stored: StoredRouting): RoutingEditorState => {
  const { design } = stored;
  const firstWorkflow = design.workflows.find(workflow => !workflow.templateText) ?? design.workflows[0];
  return {
    code: stored.code,
    design,
    revision: stored.meta.revision,
    savedJson: JSON.stringify(design),
    saveState: 'saved',
    saving: false,
    tab: firstWorkflow ? { kind: 'workflow', key: firstWorkflow.key } : { kind: 'queues' },
    expanded: [],
    test: { workflowKey: firstTestWorkflow(design), task: {} },
    newQueueName: '',
    newSkillName: '',
  };
};

// Every change to the design makes it In progress again (the status is set apart), and is saved
const changeDesign = (editor: RoutingEditorState, design: RoutingDesign) => {
  editor.design = { ...design, status: STATUS_AFTER_CHANGE };
  if (editor.saveState !== 'conflict') editor.saveState = 'unsaved';
};

const changeWorkflow = (editor: RoutingEditorState, key: string, change: (workflow: Workflow) => Workflow) =>
  changeDesign(editor, updateWorkflow(editor.design, key, change));

const queueKeyFor = (design: RoutingDesign, name: string) => {
  let key =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'queue';
  while (design.queues.some(queue => queue.key === key)) key = `${key}_2`;
  return key;
};

const showTab = (editor: RoutingEditorState, tab: RoutingTab) => {
  // As when each page was shown afresh: the cards collapsed, the test and the new names empty
  if (tab.kind !== 'workflow') editor.expanded = [];
  if (tab.kind === 'test' && editor.tab.kind !== 'test') {
    editor.test = { workflowKey: firstTestWorkflow(editor.design), task: {} };
  }
  if (tab.kind !== editor.tab.kind) {
    editor.newQueueName = '';
    editor.newSkillName = '';
  }
  editor.tab = tab;
};

// Reducers for the open design: they do nothing once it's closed
type EditorAction<P> = (editor: RoutingEditorState, action: PayloadAction<P>) => void;
const onEditor =
  <P>(reducer: EditorAction<P>) =>
  (state: RoutingState, action: PayloadAction<P>) => {
    if (state.editor) reducer(state.editor, action);
  };

const routingSlice = createSlice({
  name: 'routing',
  initialState,
  reducers: {
    routingEntered: state => {
      state.entered = true;
    },

    // ----- The start page
    listRequested: state => {
      state.home = initialHome;
    },
    listLoaded: (state, action: PayloadAction<RoutingSummary[]>) => {
      state.home.summaries = action.payload;
    },
    listFailed: (state, action: PayloadAction<string>) => {
      state.home.error = action.payload;
    },
    filterChosen: (state, action: PayloadAction<RoutingFilter>) => {
      state.home.filter = action.payload;
    },
    helplineFilterChosen: (state, action: PayloadAction<string>) => {
      state.home.helpline = action.payload;
    },
    helplineChosen: (state, action: PayloadAction<string>) => {
      state.home.choice = action.payload;
    },

    // ----- The helpline open
    routingOpened: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
      state.stored = undefined;
      state.preview = undefined;
      state.error = undefined;
      state.editor = undefined;
    },
    loadStarted: state => {
      state.stored = undefined;
      state.preview = undefined;
      state.error = undefined;
    },
    routingLoaded: (state, action: PayloadAction<{ code: string; stored: StoredRouting | null }>) => {
      if (action.payload.code !== state.code) return;
      state.stored = action.payload.stored;
      state.editor = action.payload.stored ? editorFor(action.payload.stored) : undefined;
    },
    routingLoadFailed: (state, action: PayloadAction<{ code: string; message: string }>) => {
      if (action.payload.code === state.code) state.error = action.payload.message;
    },
    branchChosen: (state, action: PayloadAction<string>) => {
      state.branch = action.payload;
    },
    importStarted: state => {
      state.error = undefined;
      state.importing = true;
    },
    importPreviewed: (
      state,
      action: PayloadAction<{ code: string; preview?: RoutingImport & FromBranch; error?: string }>,
    ) => {
      state.importing = false;
      if (action.payload.code !== state.code) return;
      if (action.payload.preview) state.preview = action.payload.preview;
      if (action.payload.error) state.error = action.payload.error;
    },
    previewCleared: state => {
      state.preview = undefined;
    },
    workingSet: (state, action: PayloadAction<boolean>) => {
      state.working = action.payload;
    },
    routingErrorSet: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // ----- Saving
    saveStarted: onEditor<void>(editor => {
      editor.saving = true;
      editor.saveState = 'saving';
    }),
    routingSaved: (state, action: PayloadAction<{ code: string; revision: number; json: string }>) => {
      const { editor } = state;
      if (!editor || editor.code !== action.payload.code) return;
      editor.saving = false;
      editor.revision = action.payload.revision;
      editor.savedJson = action.payload.json;
      // Edits made while it was saving still need saving
      editor.saveState = JSON.stringify(editor.design) === action.payload.json ? 'saved' : 'unsaved';
    },
    saveConflicted: (state, action: PayloadAction<{ code: string; conflict: RoutingConflict }>) => {
      const { editor } = state;
      if (!editor || editor.code !== action.payload.code) return;
      editor.saving = false;
      editor.conflict = action.payload.conflict;
      editor.saveState = 'conflict';
    },
    saveFailed: (state, action: PayloadAction<string>) => {
      const { editor } = state;
      if (!editor || editor.code !== action.payload) return;
      editor.saving = false;
      editor.saveState = 'error';
    },

    // ----- The editor's pages
    tabChosen: onEditor<RoutingTab>((editor, action) => showTab(editor, action.payload)),
    // A check (or "show it" in Test a task) shows where it is: its workflow and rule, or the page
    issueShown: onEditor<RoutingIssue>((editor, action) => {
      const issue = action.payload;
      if (issue.workflow) {
        showTab(editor, { kind: 'workflow', key: issue.workflow });
        if (issue.ruleId) editor.selectedRuleId = issue.ruleId;
      } else showTab(editor, issue.queue ? { kind: 'queues' } : { kind: 'skills' });
    }),
    statusChanged: onEditor<DesignStatus>((editor, action) => {
      editor.design = { ...editor.design, status: action.payload };
      if (editor.saveState !== 'conflict') editor.saveState = 'unsaved';
    }),

    // ----- A workflow's page
    ruleSelected: onEditor<string>((editor, action) => {
      editor.selectedRuleId = action.payload;
    }),
    cardToggled: onEditor<string>((editor, action) => {
      const ruleId = action.payload;
      editor.expanded = editor.expanded.includes(ruleId)
        ? editor.expanded.filter(candidate => candidate !== ruleId)
        : [...editor.expanded, ruleId];
    }),
    cardsExpanded: onEditor<string[]>((editor, action) => {
      editor.expanded = action.payload;
    }),
    // Chosen in the diagram: selected and opened
    ruleShown: onEditor<string>((editor, action) => {
      editor.selectedRuleId = action.payload;
      if (!editor.expanded.includes(action.payload)) editor.expanded.push(action.payload);
    }),
    workflowChanged: onEditor<Workflow>((editor, action) =>
      changeWorkflow(editor, action.payload.key, () => action.payload),
    ),
    // A rule just added opens, to be filled in
    ruleAdded: onEditor<{ workflowKey: string; rules: Rule[]; ruleId: string }>((editor, action) => {
      const { workflowKey, rules, ruleId } = action.payload;
      changeWorkflow(editor, workflowKey, workflow => ({ ...workflow, rules }));
      if (!editor.expanded.includes(ruleId)) editor.expanded.push(ruleId);
      editor.selectedRuleId = ruleId;
    }),
    ruleChanged: onEditor<{ workflowKey: string; rule: Rule }>((editor, action) => {
      const { workflowKey, rule } = action.payload;
      changeWorkflow(editor, workflowKey, workflow => updateRule(workflow, rule.id, () => rule));
    }),
    ruleRemoved: onEditor<{ workflowKey: string; ruleId: string }>((editor, action) => {
      const { workflowKey, ruleId } = action.payload;
      changeWorkflow(editor, workflowKey, workflow => ({
        ...workflow,
        rules: workflow.rules.filter(candidate => candidate.id !== ruleId),
      }));
    }),
    // A card dragged onto another's place
    ruleMoved: onEditor<{ workflowKey: string; ruleId: string; overId: string }>((editor, action) => {
      const { workflowKey, ruleId, overId } = action.payload;
      changeWorkflow(editor, workflowKey, workflow => {
        const from = workflow.rules.findIndex(rule => rule.id === ruleId);
        const to = workflow.rules.findIndex(rule => rule.id === overId);
        const rules = [...workflow.rules];
        rules.splice(to, 0, ...rules.splice(from, 1));
        return { ...workflow, rules };
      });
    }),

    // ----- Queues
    newQueueNameChanged: onEditor<string>((editor, action) => {
      editor.newQueueName = action.payload;
    }),
    queueAdded: onEditor<void>(editor => {
      const name = editor.newQueueName.trim();
      if (!name) return;
      const { design } = editor;
      changeDesign(editor, {
        ...design,
        queues: [...design.queues, { key: queueKeyFor(design, name), name, workers: { kind: 'skills', allOf: [] } }],
      });
      editor.newQueueName = '';
    }),
    queueChanged: onEditor<Queue>((editor, action) => {
      const { design } = editor;
      changeDesign(editor, {
        ...design,
        queues: design.queues.map(candidate => (candidate.key === action.payload.key ? action.payload : candidate)),
      });
    }),
    queueRemoved: onEditor<string>((editor, action) => {
      const { design } = editor;
      changeDesign(editor, {
        ...design,
        queues: design.queues.filter(candidate => candidate.key !== action.payload),
      });
    }),

    // ----- Skills and capacity
    newSkillNameChanged: onEditor<string>((editor, action) => {
      editor.newSkillName = action.payload;
    }),
    skillAdded: onEditor<void>(editor => {
      const name = editor.newSkillName.trim();
      const { design } = editor;
      if (!name || design.skills.some(skill => skill.name === name)) return;
      changeDesign(editor, { ...design, skills: [...design.skills, { name }] });
      editor.newSkillName = '';
    }),
    skillRenamed: onEditor<{ from: string; to: string }>((editor, action) =>
      changeDesign(editor, renameSkill(editor.design, action.payload.from, action.payload.to)),
    ),
    skillChanged: onEditor<{ name: string; changes: Partial<Omit<Skill, 'name'>> }>((editor, action) => {
      const { name, changes } = action.payload;
      const { design } = editor;
      changeDesign(editor, {
        ...design,
        skills: design.skills.map(candidate => (candidate.name === name ? { ...candidate, ...changes } : candidate)),
      });
    }),
    skillRemoved: onEditor<string>((editor, action) => {
      const { design } = editor;
      changeDesign(editor, {
        ...design,
        skills: design.skills.filter(candidate => candidate.name !== action.payload),
      });
    }),
    capacityChanged: onEditor<Partial<Capacity>>((editor, action) =>
      changeDesign(editor, setCapacity(editor.design, action.payload)),
    ),

    // ----- Test a task
    testWorkflowChosen: onEditor<string>((editor, action) => {
      editor.test.workflowKey = action.payload;
    }),
    // A detail of the pretend contact (none: any)
    testAttributeSet: onEditor<{ attribute: string; value?: string | number | boolean }>((editor, action) => {
      const { attribute, value } = action.payload;
      if (value === undefined) delete editor.test.task[attribute];
      else editor.test.task[attribute] = value;
    }),
    testReset: onEditor<void>(editor => {
      editor.test.task = {};
    }),
  },
  selectors: {
    selectRouting: state => state,
    selectRoutingEditor: state => state.editor,
    selectRoutingDesign: state => state.editor?.design,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof routingSlice> {}
}
const injected = routingSlice.injectInto(rootReducer);
export const { selectRouting, selectRoutingEditor, selectRoutingDesign } = injected.selectors;
const routingOf = (state: RootState) => injected.selectSlice(state);

export const {
  filterChosen,
  helplineFilterChosen,
  helplineChosen,
  branchChosen,
  tabChosen,
  issueShown,
  statusChanged,
  ruleSelected,
  cardToggled,
  cardsExpanded,
  ruleShown,
  workflowChanged,
  ruleChanged,
  ruleRemoved,
  ruleMoved,
  newQueueNameChanged,
  queueAdded,
  queueChanged,
  queueRemoved,
  newSkillNameChanged,
  skillAdded,
  skillRenamed,
  skillChanged,
  skillRemoved,
  capacityChanged,
  testWorkflowChosen,
  testAttributeSet,
  testReset,
} = routingSlice.actions;
const {
  routingEntered,
  listRequested,
  listLoaded,
  listFailed,
  routingOpened,
  loadStarted,
  routingLoaded,
  routingLoadFailed,
  importStarted,
  importPreviewed,
  previewCleared,
  workingSet,
  routingErrorSet,
  saveStarted,
  routingSaved,
  saveConflicted,
  saveFailed,
  ruleAdded,
} = routingSlice.actions;

// The checks of the open design
export const selectRoutingIssues = createSelector([selectRoutingDesign], (design): RoutingIssue[] =>
  design ? routingChecks(design) : [],
);

// The helplines this person can open
export const selectRoutingHelplineCodes = createSelector([(state: RootState) => state.session.helplines], helplines =>
  helplines.map(helpline => helpline.code),
);

// ---------------------------------------------------------------------------------------------
// Thunks

// Saves the open design if it changed, after any save under way: what changes meanwhile is saved
// once that one is done
export const saveRouting =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { routingClient }) => {
    const editor = routingOf(getState()).editor;
    if (!editor || editor.saving || editor.conflict) return;
    const json = JSON.stringify(editor.design);
    if (json === editor.savedJson) return;
    const { code } = editor;
    dispatch(saveStarted());
    try {
      const outcome = await routingClient.save(code, editor.revision, editor.design);
      if (!outcome.ok) {
        dispatch(saveConflicted({ code, conflict: outcome.conflict }));
        return;
      }
      dispatch(routingSaved({ code, revision: outcome.meta.revision, json }));
    } catch {
      dispatch(saveFailed(code));
      return;
    }
    const after = routingOf(getState()).editor;
    if (after?.code === code && after.saveState === 'unsaved') await dispatch(saveRouting());
  };

// Loads the open helpline's design (again, e.g. after someone else changed it)
export const loadRouting =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { routingClient }) => {
    const { code } = routingOf(getState());
    dispatch(loadStarted());
    if (!code) return;
    try {
      const found = await routingClient.load(code);
      dispatch(routingLoaded({ code, stored: found ?? null }));
    } catch (err) {
      dispatch(routingLoadFailed({ code, message: (err as Error).message }));
    }
  };

// Opens a helpline's routing ('' back to the start page). Changes still waiting are saved first.
export const openRouting =
  (code: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (routingOf(getState()).editor?.saveState === 'unsaved') dispatch(saveRouting());
    dispatch(routingOpened(code));
    if (code) await dispatch(loadRouting());
  };

// The area is shown: someone with a single helpline gets its routing straight away (once)
export const enterRouting = (): AppThunk => (dispatch, getState) => {
  // Added once: the same predicate and effect again are the same listener
  dispatch(addListener.withTypes<RootState, AppDispatch, Services>()(routingAutosave));
  if (routingOf(getState()).entered) return;
  dispatch(routingEntered());
  const codes = selectRoutingHelplineCodes(getState());
  if (codes.length === 1) dispatch(openRouting(codes[0]));
};

// The start page's list
export const loadRoutingList =
  (): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { routingClient }) => {
    dispatch(listRequested());
    try {
      dispatch(listLoaded(await routingClient.list()));
    } catch (err) {
      dispatch(listFailed((err as Error).message));
    }
  };

// The flex-plugins branches to import from
export const loadRoutingBranches =
  (): AppThunk<Promise<BranchChoice[]>> =>
  (_dispatch, _getState, { routingClient }) =>
    routingClient.branches();

// Reads the helpline's live config (or the chosen branch's), to see it before using it
export const previewRoutingImport =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { routingClient }) => {
    const { code, branch } = routingOf(getState());
    dispatch(importStarted());
    try {
      dispatch(importPreviewed({ code, preview: await routingClient.previewImport(code, branch) }));
    } catch (err) {
      dispatch(importPreviewed({ code, error: (err as Error).message }));
    }
  };

// Saves a new design (empty, or imported), over the one there is now, if any
const createRouting =
  (design: RoutingDesign): AppThunk<Promise<void>> =>
  async (dispatch, getState, { routingClient }) => {
    const { code } = routingOf(getState());
    dispatch(workingSet(true));
    let created = false;
    try {
      const current = await routingClient.load(code);
      const outcome = await routingClient.save(code, current?.meta.revision ?? 0, design);
      if (!outcome.ok)
        throw new Error(`${outcome.conflict.updatedBy ?? 'Someone else'} just saved a design for ${code}: reload.`);
      created = true;
    } catch (err) {
      dispatch(routingErrorSet((err as Error).message));
    } finally {
      dispatch(workingSet(false));
    }
    if (created) await dispatch(loadRouting());
  };

export const startEmptyRouting = (): AppThunk<Promise<void>> => (dispatch, getState) =>
  dispatch(createRouting(emptyRouting(routingOf(getState()).code)));

// The import previewed becomes the design (asking first, if there's one, is the page's)
export const adoptRoutingImport = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { preview } = routingOf(getState());
  if (!preview) return;
  dispatch(previewCleared());
  await dispatch(createRouting(preview.source ? { ...preview.design, importedFrom: preview.source } : preview.design));
};

const workflowOf = (state: RootState, key: string) =>
  routingOf(state).editor?.design.workflows.find(workflow => workflow.key === key);

// A new rule at the end of the workflow
export const addRoutingRule =
  (workflowKey: string): AppThunk =>
  (dispatch, getState) => {
    const workflow = workflowOf(getState(), workflowKey);
    if (!workflow) return;
    const rule = newRule(`Rule ${workflow.rules.length + 1}`);
    dispatch(ruleAdded({ workflowKey, rules: [...workflow.rules, rule], ruleId: rule.id }));
  };

// One of the rules most helplines have, where it usually goes
export const addRoutingCommonRule =
  (workflowKey: string, common: CommonRule): AppThunk =>
  (dispatch, getState) => {
    const workflow = workflowOf(getState(), workflowKey);
    const design = routingOf(getState()).editor?.design;
    if (!workflow || !design) return;
    const changed = addCommonRule(workflow, design, common);
    const rule = changed.rules.find(candidate => !workflow.rules.includes(candidate))!;
    dispatch(ruleAdded({ workflowKey, rules: changed.rules, ruleId: rule.id }));
  };

// The "Export for Claude" file: the design, what it generates, and its checks
export const routingExport = (): AppThunk<{ fileName: string; text: string } | undefined> => (_dispatch, getState) => {
  const { stored, editor } = routingOf(getState());
  if (!stored || !editor) return undefined;
  const { design } = editor;
  const generated = generateRouting(design);
  return {
    fileName: `${stored.code}-routing.json`,
    text: `${JSON.stringify(
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
        checks: selectRoutingIssues(getState()).map(({ severity, message }) => ({
          severity,
          message,
        })),
      },
      null,
      2,
    )}\n`,
  };
};

// Saves a moment after the last change to the open design (until someone else saved it in between).
// Added by enterRouting rather than in createAppStore: store.ts importing this module would be an
// import cycle (this module injects itself into the store's rootReducer as it loads).
const routingAutosave = {
  predicate: (_action: UnknownAction, current: RootState, previous: RootState) => {
    const now = routingOf(current).editor;
    const before = routingOf(previous).editor;
    return Boolean(now && before && now.code === before.code && now.design !== before.design);
  },
  effect: async (_action: UnknownAction, listenerApi: ListenerEffectAPI<RootState, AppDispatch, Services>) => {
    if (routingOf(listenerApi.getState()).editor?.conflict) return;
    // A newer change restarts the wait
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(AUTOSAVE_DELAY_MS);
    await listenerApi.dispatch(saveRouting());
  },
};
