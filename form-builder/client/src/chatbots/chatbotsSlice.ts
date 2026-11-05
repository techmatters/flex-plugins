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
 * The Chatbots area (docs/chatbot-designer.md): the start page (every chatbot this person can see),
 * the open helpline's chatbots design as it's edited, which chatbot, path and tab are showing, the
 * new chatbot form and importing from the live config.
 *
 * The design is saved a moment after each change, one save at a time (startChatbotsListeners). If
 * someone else saved it in between, saving stops and the user is asked to reload, as with boards. A
 * save that fails (the server can't be reached) is tried again a little later, a few times, then the
 * error shows until one works.
 * Changes go through editChatbots, which puts the chatbots they changed back In progress
 * (shared/src/chatbots/status.ts); the pure changes themselves are in edit.ts.
 */
import { createSelector, createSlice, isAnyOf, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { BranchChoice, ChatbotImport, FromBranch } from '@tech-matters/form-builder-shared';
import type { DesignStatus } from '@tech-matters/form-builder-shared/designStatus';
import {
  type AnswerType,
  type Chatbot,
  type ChatbotDesign,
  type ChatbotIntent,
  type ChatbotQuestion,
  type ChatbotsSummary,
  emptyChatbots,
  type StoredChatbots,
} from '@tech-matters/form-builder-shared/chatbots/model';
import {
  type ContactForms,
  renameFormTargets,
  setFormTargets,
} from '@tech-matters/form-builder-shared/chatbots/formMappings';
import {
  botStatusOf,
  isNewBot,
  setBotStatus,
  withStatusUpdates,
} from '@tech-matters/form-builder-shared/chatbots/status';

import {
  type AppListenerStartListening,
  type AppThunk,
  rootReducer,
  type RootState,
  type Services,
} from '../app/store';
import { selectActingAsStaff, selectUser } from '../app/sessionSlice';
import {
  addAnswerType,
  addChatbot,
  moveQuestion,
  newQuestion,
  removeAnswerType,
  updateAnswerType,
  updateBot,
  updateIntent,
  updateQuestion,
  withBuiltinType,
} from './edit';
import { chatbotChecks, ChatbotIssue } from './chatbotChecks';
import { chatbotChanges } from './changes';

type ChatbotsTab = 'conversation' | 'answers' | 'check';
export type ChatbotsFilter = 'all' | DesignStatus;
type ChatbotsSaveStatus = 'saved' | 'unsaved' | 'saving' | 'retrying' | 'conflict' | 'error';
type ChatbotsConflict = { updatedBy?: string; updatedAt?: string };

type NewChatbotForm = { name: string; language: string; locale: string; copyFrom: string };
// A new list of answers or pattern being named
type NewAnswerTypeForm = { kind: 'list' | 'pattern'; name: string };

// Lex V2 locales a chatbot can be in (the ones Aselo's languages need)
export const LOCALES = [
  'en_US',
  'en_GB',
  'en_AU',
  'en_IN',
  'en_ZA',
  'es_US',
  'es_ES',
  'es_419',
  'pt_BR',
  'pt_PT',
  'fr_FR',
  'fr_CA',
];
const localeFor = (language: string) =>
  ({ en: 'en_US', es: 'es_US', pt: 'pt_BR', fr: 'fr_FR' }[language.slice(0, 2).toLowerCase()] ?? 'en_US');

type ChatbotsState = {
  // Set once the area has been shown (a person with one helpline goes straight to its chatbots)
  started: boolean;
  // The start page: what's listed, and how it's filtered
  home: { summaries?: ChatbotsSummary[]; error?: string; filter: ChatbotsFilter; helpline: string; code: string };
  // The open helpline ('' on the start page), and the chatbot it was opened at
  code: string;
  initialBotId?: string;
  // Counts each (re)load, so answers to an earlier one are ignored
  loadCount: number;
  // undefined while loading, null when the helpline has no design yet
  stored?: StoredChatbots | null;
  error?: string;
  // Importing from the live config: what was found, and which branch to read
  preview?: ChatbotImport & FromBranch;
  branch: string;
  importing: boolean;
  // Saving an imported or empty design over the one there is
  working: boolean;
  // The design as it's edited, and what the server has
  design?: ChatbotDesign;
  revision: number;
  savedJson: string;
  saveStatus: ChatbotsSaveStatus;
  // Saves that failed in a row (a lost connection, the server down): retried a few times, then
  // the error is shown until a save works
  failedSaves: number;
  saveError?: string;
  conflict?: ChatbotsConflict;
  // The helpline's contact form, for the fields answers fill in
  forms?: ContactForms;
  // What's showing
  botId?: string;
  intentId?: string;
  tab: ChatbotsTab;
  newChatbot?: NewChatbotForm;
  // A new list or pattern being named from a question's answers, by question id
  answerPickers: Record<string, NewAnswerTypeForm>;
  // The Answers tab's "new list of answers", by language
  newAnswerTypes: Record<string, NewAnswerTypeForm>;
};

const initialHome: ChatbotsState['home'] = { filter: 'all', helpline: '', code: '' };

// What's shown of an open helpline, as it is when it's (re)loaded
const editorReset = {
  design: undefined,
  revision: 0,
  savedJson: '',
  saveStatus: 'saved' as ChatbotsSaveStatus,
  failedSaves: 0,
  saveError: undefined,
  conflict: undefined,
  forms: undefined,
  botId: undefined,
  intentId: undefined,
  tab: 'conversation' as ChatbotsTab,
  newChatbot: undefined,
  answerPickers: {},
  newAnswerTypes: {},
};

const initialState: ChatbotsState = {
  started: false,
  home: initialHome,
  code: '',
  loadCount: 0,
  branch: '',
  importing: false,
  working: false,
  ...editorReset,
};

const chatbotsSlice = createSlice({
  name: 'chatbots',
  initialState,
  reducers: {
    chatbotsStarted: state => {
      state.started = true;
    },
    // The start page, loading its list again each time it's shown
    homeOpened: state => {
      state.home = initialHome;
    },
    summariesLoaded: (state, action: PayloadAction<ChatbotsSummary[]>) => {
      state.home.summaries = action.payload;
    },
    summariesFailed: (state, action: PayloadAction<string>) => {
      state.home.error = action.payload;
    },
    homeFilterChanged: (state, action: PayloadAction<ChatbotsFilter>) => {
      state.home.filter = action.payload;
    },
    homeHelplineChanged: (state, action: PayloadAction<string>) => {
      state.home.helpline = action.payload;
    },
    homeCodeChanged: (state, action: PayloadAction<string>) => {
      state.home.code = action.payload;
    },
    helplineOpened: (state, action: PayloadAction<{ code: string; botId?: string }>) => {
      Object.assign(state, editorReset);
      state.code = action.payload.code;
      state.initialBotId = action.payload.botId;
      state.loadCount += 1;
      state.stored = undefined;
      state.preview = undefined;
      state.error = undefined;
    },
    helplineClosed: state => {
      Object.assign(state, editorReset);
      state.code = '';
      state.initialBotId = undefined;
      state.loadCount += 1;
      state.stored = undefined;
      state.preview = undefined;
      state.error = undefined;
    },
    // Loaded again (after someone else saved, or a design was saved over it)
    reloadRequested: state => {
      state.loadCount += 1;
      state.stored = undefined;
      state.preview = undefined;
      state.error = undefined;
    },
    chatbotsLoaded: (state, action: PayloadAction<StoredChatbots | null>) => {
      const stored = action.payload;
      state.stored = stored;
      Object.assign(state, editorReset);
      if (stored) {
        state.design = stored.design;
        state.revision = stored.meta.revision;
        state.savedJson = JSON.stringify(stored.design);
        state.botId = state.initialBotId;
      }
    },
    errorSet: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    branchChanged: (state, action: PayloadAction<string>) => {
      state.branch = action.payload;
    },
    importStarted: state => {
      state.error = undefined;
      state.importing = true;
    },
    importPreviewed: (state, action: PayloadAction<ChatbotImport & FromBranch>) => {
      state.preview = action.payload;
    },
    importFinished: state => {
      state.importing = false;
    },
    previewDropped: state => {
      state.preview = undefined;
    },
    workingChanged: (state, action: PayloadAction<boolean>) => {
      state.working = action.payload;
    },
    // The design changed (by editChatbots, with each chatbot's status already updated)
    designUpdated: (state, action: PayloadAction<ChatbotDesign>) => {
      state.design = action.payload;
    },
    formsLoaded: (state, action: PayloadAction<{ forms: ContactForms; design: ChatbotDesign }>) => {
      state.forms = action.payload.forms;
      state.design = action.payload.design;
    },
    saveStatusChanged: (state, action: PayloadAction<ChatbotsSaveStatus>) => {
      state.saveStatus = action.payload;
    },
    chatbotsSaved: (state, action: PayloadAction<{ revision: number; json: string }>) => {
      state.revision = action.payload.revision;
      state.savedJson = action.payload.json;
      state.failedSaves = 0;
      state.saveError = undefined;
      // Changes made while it was saving still need saving
      state.saveStatus = JSON.stringify(state.design) === action.payload.json ? 'saved' : 'unsaved';
    },
    saveConflicted: (state, action: PayloadAction<ChatbotsConflict>) => {
      state.failedSaves = 0;
      state.saveError = undefined;
      state.conflict = action.payload;
      state.saveStatus = 'conflict';
    },
    // Retried while there are retries left (saveRetryDelaysMs), then shown as an error
    saveFailed: (state, action: PayloadAction<{ message: string; retries: number }>) => {
      state.failedSaves += 1;
      state.saveError = action.payload.message;
      state.saveStatus = state.failedSaves <= action.payload.retries ? 'retrying' : 'error';
    },
    // An edit, or "Try again": a fresh set of retries
    saveRetriesReset: state => {
      state.failedSaves = 0;
    },
    botSelected: (state, action: PayloadAction<string>) => {
      state.botId = action.payload;
      state.intentId = undefined;
      state.tab = 'conversation';
      state.newChatbot = undefined;
      state.answerPickers = {};
    },
    intentSelected: (state, action: PayloadAction<string>) => {
      state.intentId = action.payload;
      state.answerPickers = {};
    },
    tabChanged: (state, action: PayloadAction<ChatbotsTab>) => {
      state.tab = action.payload;
      state.answerPickers = {};
      state.newAnswerTypes = {};
    },
    // A check's issue, shown where it is
    issueShown: (state, action: PayloadAction<{ tab: ChatbotsTab; botId?: string; intentId?: string }>) => {
      const { tab, botId, intentId } = action.payload;
      if (botId) state.botId = botId;
      if (intentId) state.intentId = intentId;
      state.tab = tab;
      state.answerPickers = {};
    },
    newChatbotOpened: (state, action: PayloadAction<NewChatbotForm>) => {
      state.newChatbot = action.payload;
    },
    newChatbotClosed: state => {
      state.newChatbot = undefined;
    },
    // Names as Lex takes them
    newChatbotNameChanged: (state, action: PayloadAction<string>) => {
      if (state.newChatbot) state.newChatbot.name = action.payload.replace(/[^0-9A-Za-z_-]/g, '_');
    },
    // The locale follows the language
    newChatbotLanguageChanged: (state, action: PayloadAction<string>) => {
      if (!state.newChatbot) return;
      state.newChatbot.language = action.payload.replace(/\s/g, '');
      state.newChatbot.locale = localeFor(action.payload);
    },
    newChatbotLocaleChanged: (state, action: PayloadAction<string>) => {
      if (state.newChatbot) state.newChatbot.locale = action.payload;
    },
    newChatbotCopyFromChanged: (state, action: PayloadAction<string>) => {
      if (state.newChatbot) state.newChatbot.copyFrom = action.payload;
    },
    answerPickerChanged: (state, action: PayloadAction<{ questionId: string; form?: NewAnswerTypeForm }>) => {
      const { questionId, form } = action.payload;
      if (form) state.answerPickers[questionId] = { ...form, name: form.name.replace(/\s/g, '') };
      else delete state.answerPickers[questionId];
    },
    newAnswerTypeChanged: (state, action: PayloadAction<{ language: string; form: NewAnswerTypeForm }>) => {
      const { language, form } = action.payload;
      state.newAnswerTypes[language] = { ...form, name: form.name.replace(/\s/g, '') };
    },
  },
});

declare module '../app/store' {
  // eslint-disable-next-line import/no-unused-modules -- module augmentation: adds the slice to the store's state type
  export interface LazyLoadedSlices extends WithSlice<typeof chatbotsSlice> {}
}

// Added when the store is made (startChatbotsListeners), not when this module loads: store.ts
// imports this module, so rootReducer may not exist yet then
const injectChatbotsSlice = () => chatbotsSlice.injectInto(rootReducer);

// As it starts until the slice's first action
export const selectChatbots = (state: RootState): ChatbotsState => state.chatbots ?? initialState;
export const selectChatbotDesign = (state: RootState) => selectChatbots(state).design;
export const selectContactForms = (state: RootState) => selectChatbots(state).forms;

const {
  chatbotsStarted,
  homeOpened,
  summariesLoaded,
  summariesFailed,
  helplineOpened,
  helplineClosed,
  reloadRequested,
  chatbotsLoaded,
  errorSet,
  importStarted,
  importPreviewed,
  importFinished,
  previewDropped,
  workingChanged,
  designUpdated,
  formsLoaded,
  saveStatusChanged,
  chatbotsSaved,
  saveConflicted,
  saveFailed,
  saveRetriesReset,
  issueShown,
  newChatbotOpened,
} = chatbotsSlice.actions;
export const {
  homeFilterChanged,
  homeHelplineChanged,
  homeCodeChanged,
  branchChanged,
  botSelected,
  intentSelected,
  tabChanged,
  newChatbotClosed,
  newChatbotNameChanged,
  newChatbotLanguageChanged,
  newChatbotLocaleChanged,
  newChatbotCopyFromChanged,
  answerPickerChanged,
  newAnswerTypeChanged,
} = chatbotsSlice.actions;

// ----- Selectors

// For now helpline staff see the chatbots without changing them
export const selectChatbotsReadOnly = (state: RootState) => !selectActingAsStaff(state);
// Who's writing comments
export const selectCommentAuthor = (state: RootState) => selectUser(state)?.name ?? 'Someone';
export const selectHelplineCodes = createSelector([(state: RootState) => state.session.helplines], helplines =>
  helplines.map(helpline => helpline.code),
);

const selectBotId = (state: RootState) => selectChatbots(state).botId;
const selectIntentId = (state: RootState) => selectChatbots(state).intentId;

// The chatbot showing (the first one, until one is chosen)
export const selectSelectedBot = createSelector(
  [selectChatbotDesign, selectBotId],
  (design, botId): Chatbot | undefined => design?.bots.find(candidate => candidate.id === botId) ?? design?.bots[0],
);

// The path showing (the chatbot's first, until one is chosen)
export const selectSelectedIntent = createSelector(
  [selectSelectedBot, selectIntentId],
  (bot, intentId): ChatbotIntent | undefined =>
    bot?.intents.find(candidate => candidate.id === intentId) ?? bot?.intents[0],
);

export const selectChatbotIssues = createSelector(
  [selectChatbotDesign, selectContactForms],
  (design, forms): ChatbotIssue[] => (design ? chatbotChecks(design, forms) : []),
);

export const selectChatbotChanges = createSelector([selectChatbotDesign], design =>
  design ? chatbotChanges(design) : [],
);

// ----- The start page and opening a helpline

export const loadChatbotsList =
  (): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { chatbotClient }) => {
    dispatch(homeOpened());
    try {
      dispatch(summariesLoaded(await chatbotClient.list()));
    } catch (err) {
      dispatch(summariesFailed((err as Error).message));
    }
  };

// The contact form, for the fields answers fill in; designs saved before those were kept take them from it
const loadContactForms =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { chatbotClient }) => {
    const { stored, loadCount } = selectChatbots(getState());
    if (!stored) return;
    try {
      const found = await chatbotClient.contactForms(stored.code, stored.design.formsVersion);
      const current = selectChatbots(getState());
      if (!found || !current.design || current.loadCount !== loadCount) return;
      const design =
        current.design.formMappings !== undefined || selectChatbotsReadOnly(getState())
          ? current.design
          : {
              ...current.design,
              formMappings: found.survey,
              formsVersion: found.version,
              imported: {
                ...(current.design.imported ?? { bots: [], answerTypes: {} }),
                formMappings: found.survey,
              },
            };
      dispatch(formsLoaded({ forms: found, design }));
    } catch {
      // Without the contact form, answers just don't show the fields they fill in
    }
  };

const loadChatbots =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { chatbotClient }) => {
    const { code, loadCount } = selectChatbots(getState());
    if (!code) return;
    try {
      const found = await chatbotClient.load(code);
      if (selectChatbots(getState()).loadCount !== loadCount) return;
      dispatch(chatbotsLoaded(found ?? null));
      if (found) await dispatch(loadContactForms());
    } catch (err) {
      if (selectChatbots(getState()).loadCount === loadCount) dispatch(errorSet((err as Error).message));
    }
  };

export const openChatbots =
  (code: string, botId?: string): AppThunk<Promise<void>> =>
  async dispatch => {
    dispatch(helplineOpened({ code, botId }));
    await dispatch(loadChatbots());
  };

export const reloadChatbots = (): AppThunk<Promise<void>> => async dispatch => {
  dispatch(reloadRequested());
  await dispatch(loadChatbots());
};

// The first time the area shows: a person with one helpline goes straight to its chatbots
export const startChatbots = (): AppThunk => (dispatch, getState) => {
  if (selectChatbots(getState()).started) return;
  dispatch(chatbotsStarted());
  const codes = selectHelplineCodes(getState());
  if (codes.length === 1) dispatch(openChatbots(codes[0]));
};

// ----- Saving

// One save at a time for each store (each save uses the revision the previous one returned)
const saveQueues = new WeakMap<Services, { current: Promise<void> }>();

const saveNow =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { chatbotClient, saveRetryDelaysMs }) => {
    const state = selectChatbots(getState());
    if (!state.design || state.conflict || selectChatbotsReadOnly(getState())) return;
    const json = JSON.stringify(state.design);
    if (json === state.savedJson) return;
    const { code, loadCount } = state;
    dispatch(saveStatusChanged('saving'));
    try {
      const outcome = await chatbotClient.save(code, state.revision, JSON.parse(json));
      // Left, or loaded again, meanwhile
      if (selectChatbots(getState()).loadCount !== loadCount) return;
      if (outcome.ok) dispatch(chatbotsSaved({ revision: outcome.meta.revision, json }));
      else dispatch(saveConflicted(outcome.conflict));
    } catch (err) {
      // Left, or loaded again, meanwhile: nothing to retry
      if (selectChatbots(getState()).loadCount !== loadCount) return;
      dispatch(saveFailed({ message: (err as Error).message, retries: saveRetryDelaysMs.length }));
    }
  };

// Saves now, after any save already under way
const flushChatbots = (): AppThunk<Promise<void>> => (dispatch, _getState, services) => {
  const queue = saveQueues.get(services) ?? { current: Promise.resolve() };
  saveQueues.set(services, queue);
  queue.current = queue.current.then(() => dispatch(saveNow()));
  return queue.current;
};

// "Try again" after the retries ran out: the changes are still in the page
export const retryChatbotsSave = (): AppThunk<Promise<void>> => dispatch => {
  dispatch(saveRetriesReset());
  return dispatch(flushChatbots());
};

// Adds the slice to the store, and saves a moment after the last change (unless it's view only or
// someone else saved meanwhile); a save that failed is tried again a little later, a few times
export const startChatbotsListeners = (startListening: AppListenerStartListening) => {
  injectChatbotsSlice();
  const unsubscribeEdits = startListening({
    matcher: isAnyOf(designUpdated, formsLoaded),
    effect: async (_action, listenerApi) => {
      const state = selectChatbots(listenerApi.getState());
      if (!state.design || state.conflict || selectChatbotsReadOnly(listenerApi.getState())) return;
      if (JSON.stringify(state.design) === state.savedJson) return;
      listenerApi.dispatch(saveStatusChanged('unsaved'));
      // A newer change restarts the wait
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(listenerApi.extra.saveDelayMs);
      // Someone's editing: a failed save gets its retries again
      listenerApi.dispatch(saveRetriesReset());
      await listenerApi.dispatch(flushChatbots());
    },
  });
  // The server may be back by then
  const unsubscribeRetries = startListening({
    actionCreator: saveFailed,
    effect: async (_action, listenerApi) => {
      const { saveStatus, failedSaves, loadCount } = selectChatbots(listenerApi.getState());
      if (saveStatus !== 'retrying') return;
      listenerApi.cancelActiveListeners();
      const delays = listenerApi.extra.saveRetryDelaysMs;
      await listenerApi.delay(delays[Math.min(failedSaves, delays.length) - 1] ?? 0);
      // Unless an edit's save already went through, or the helpline was left or loaded again
      const now = selectChatbots(listenerApi.getState());
      if (now.saveStatus !== 'retrying' || now.loadCount !== loadCount) return;
      await listenerApi.dispatch(flushChatbots());
    },
  });
  return () => {
    unsubscribeEdits();
    unsubscribeRetries();
  };
};

// Back to the start page, saving what's still waiting (or failing to save) first
export const closeChatbots = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { saveStatus } = selectChatbots(getState());
  if (saveStatus === 'unsaved' || saveStatus === 'retrying' || saveStatus === 'error') await dispatch(flushChatbots());
  dispatch(helplineClosed());
};

// ----- Importing, or starting from scratch

export const loadImportBranches =
  (): AppThunk<Promise<BranchChoice[]>> =>
  (_dispatch, _getState, { chatbotClient }) =>
    chatbotClient.branches();

// Reading the live config takes a while: said while it does
export const previewImport =
  (): AppThunk<Promise<void>> =>
  async (dispatch, getState, { chatbotClient }) => {
    const { code, branch } = selectChatbots(getState());
    dispatch(importStarted());
    try {
      dispatch(importPreviewed(await chatbotClient.previewImport(code, branch)));
    } catch (err) {
      dispatch(errorSet((err as Error).message));
    } finally {
      dispatch(importFinished());
    }
  };

// Saves a design (imported, or empty to start from scratch) over the one there is now, if any
const createChatbots =
  (design: ChatbotDesign): AppThunk<Promise<void>> =>
  async (dispatch, getState, { chatbotClient }) => {
    const { code } = selectChatbots(getState());
    dispatch(workingChanged(true));
    try {
      const current = await chatbotClient.load(code);
      const outcome = await chatbotClient.save(code, current?.meta.revision ?? 0, design);
      if (!outcome.ok)
        throw new Error(`${outcome.conflict.updatedBy ?? 'Someone else'} just saved chatbots for ${code}: reload.`);
      dispatch(workingChanged(false));
      await dispatch(reloadChatbots());
    } catch (err) {
      dispatch(errorSet((err as Error).message));
      dispatch(workingChanged(false));
    }
  };

export const startFromScratch = (): AppThunk<Promise<void>> => (dispatch, getState) =>
  dispatch(createChatbots(emptyChatbots(selectChatbots(getState()).code)));

// The import previewed becomes the design (the component asks first if it replaces one)
export const applyImport = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
  const { preview } = selectChatbots(getState());
  if (!preview) return;
  dispatch(previewDropped());
  await dispatch(createChatbots(preview.source ? { ...preview.design, importedFrom: preview.source } : preview.design));
};

// ----- Changing the design

// Every change goes through here: the chatbots it changed are In progress again
const editChatbots =
  (change: (design: ChatbotDesign) => ChatbotDesign): AppThunk =>
  (dispatch, getState) => {
    const { design } = selectChatbots(getState());
    if (design) dispatch(designUpdated(withStatusUpdates(design, change(design))));
  };

// The status itself doesn't put a chatbot back In progress
export const setChatbotStatus =
  (botId: string, status: DesignStatus): AppThunk =>
  (dispatch, getState) => {
    const { design } = selectChatbots(getState());
    if (design) dispatch(designUpdated(setBotStatus(design, botId, status)));
  };

export const changeBot = (botId: string, changes: Partial<Chatbot>): AppThunk =>
  editChatbots(design => updateBot(design, botId, bot => ({ ...bot, ...changes })));

const editIntent = (botId: string, intentId: string, change: (intent: ChatbotIntent) => ChatbotIntent) =>
  editChatbots(design => updateBot(design, botId, bot => updateIntent(bot, intentId, change)));

export const changeIntent = (botId: string, intentId: string, changes: Partial<ChatbotIntent>): AppThunk =>
  editIntent(botId, intentId, intent => ({ ...intent, ...changes }));

export const changeQuestion = (
  botId: string,
  intentId: string,
  questionId: string,
  changes: Partial<ChatbotQuestion>,
): AppThunk =>
  editIntent(botId, intentId, intent => updateQuestion(intent, questionId, question => ({ ...question, ...changes })));

// The name the answer is saved under: the contact form fields it fills in follow it
export const renameQuestionSlot = (botId: string, intentId: string, questionId: string, slot: string): AppThunk =>
  editChatbots(design => {
    const old = design.bots
      .find(bot => bot.id === botId)
      ?.intents.find(intent => intent.id === intentId)
      ?.questions.find(question => question.id === questionId)?.slot;
    const renamed = updateBot(design, botId, bot =>
      updateIntent(bot, intentId, intent => updateQuestion(intent, questionId, question => ({ ...question, slot }))),
    );
    return old === undefined ? renamed : renameFormTargets(renamed, old, slot);
  });

export const moveQuestionTo = (botId: string, intentId: string, from: number, to: number): AppThunk =>
  editIntent(botId, intentId, intent => moveQuestion(intent, from, to));

export const removeQuestion = (botId: string, intentId: string, questionId: string): AppThunk =>
  editIntent(botId, intentId, intent => ({
    ...intent,
    questions: intent.questions.filter(candidate => candidate.id !== questionId),
  }));

// A new question at the end, taking the same answers as the one before it
export const addQuestion = (botId: string, intentId: string): AppThunk =>
  editChatbots(design => {
    const bot = design.bots.find(candidate => candidate.id === botId);
    const intent = bot?.intents.find(candidate => candidate.id === intentId);
    if (!bot || !intent) return design;
    const defaultType =
      intent.questions[intent.questions.length - 1]?.answerType ??
      Object.keys(design.answerTypes[bot.language] ?? {})[0] ??
      'AMAZON.FreeFormInput';
    const base = defaultType.startsWith('AMAZON.') ? withBuiltinType(design, bot.language, defaultType) : design;
    return updateBot(base, botId, current =>
      updateIntent(current, intentId, old => ({
        ...old,
        questions: [...old.questions, newQuestion(old, defaultType)],
      })),
    );
  });

const languageOf = (design: ChatbotDesign, botId: string) => design.bots.find(bot => bot.id === botId)?.language ?? '';

// One of the language's answers for a question (Lex's own are listed with its answers once used)
export const pickAnswerType = (botId: string, intentId: string, questionId: string, answerType: string): AppThunk =>
  editChatbots(design => {
    const base = answerType.startsWith('AMAZON.')
      ? withBuiltinType(design, languageOf(design, botId), answerType)
      : design;
    return updateBot(base, botId, bot =>
      updateIntent(bot, intentId, intent =>
        updateQuestion(intent, questionId, question => ({ ...question, answerType })),
      ),
    );
  });

// The list or pattern named in a question's answer picker, for that question
export const createAnswerTypeForQuestion =
  (botId: string, intentId: string, questionId: string): AppThunk =>
  (dispatch, getState) => {
    const form = selectChatbots(getState()).answerPickers[questionId];
    if (!form) return;
    dispatch(
      editChatbots(design =>
        updateBot(addAnswerType(design, languageOf(design, botId), form.name, form.kind), botId, bot =>
          updateIntent(bot, intentId, intent =>
            updateQuestion(intent, questionId, question => ({ ...question, answerType: form.name })),
          ),
        ),
      ),
    );
    dispatch(answerPickerChanged({ questionId }));
  };

// The contact form fields an answer fills in (groups of "first of")
export const setQuestionFormTargets = (slot: string, groups: string[][]): AppThunk =>
  editChatbots(design =>
    setFormTargets(
      design,
      slot,
      groups.filter(group => group.length > 0),
    ),
  );

export const changeAnswerType = (language: string, name: string, type: AnswerType): AppThunk =>
  editChatbots(design => updateAnswerType(design, language, name, () => type));

export const removeAnswerTypeNamed = (language: string, name: string): AppThunk =>
  editChatbots(design => removeAnswerType(design, language, name));

// The Answers tab's new list or pattern, then its box is emptied
export const addAnswerTypeFromForm =
  (language: string): AppThunk =>
  (dispatch, getState) => {
    const form = selectChatbots(getState()).newAnswerTypes[language];
    if (!form?.name) return;
    dispatch(editChatbots(design => addAnswerType(design, language, form.name, form.kind)));
    dispatch(newAnswerTypeChanged({ language, form: { ...form, name: '' } }));
  };

// ----- A new chatbot

export const openNewChatbot = (): AppThunk => (dispatch, getState) => {
  const { design } = selectChatbots(getState());
  if (!design) return;
  const languages = [...new Set(design.bots.map(bot => bot.language))];
  const language = languages[0] ?? `en_${design.helpline.toUpperCase()}`;
  dispatch(newChatbotOpened({ name: 'pre_survey', language, locale: localeFor(language), copyFrom: '' }));
};

export const isNewChatbotTaken = (design: ChatbotDesign, form: NewChatbotForm) =>
  design.bots.some(bot => bot.language === form.language && bot.name === form.name);

// Empty, or a copy of one of the helpline's; then it's the one showing
export const createChatbot = (): AppThunk => (dispatch, getState) => {
  const { design, newChatbot: form } = selectChatbots(getState());
  if (!design || !form || !form.name || isNewChatbotTaken(design, form)) return;
  const added = addChatbot(design, {
    name: form.name,
    language: form.language,
    locale: form.locale,
    copyFrom: design.bots.find(bot => bot.id === form.copyFrom),
  });
  dispatch(designUpdated(added.design));
  dispatch(botSelected(added.bot.id));
};

// ----- Checks and the export

// Shows where an issue is: its chatbot, path and tab (the component scrolls to it)
export const showIssue =
  (issue: ChatbotIssue): AppThunk =>
  (dispatch, getState) => {
    if (issue.answerType) {
      dispatch(issueShown({ tab: 'answers' }));
      return;
    }
    if (!issue.botId) return;
    const target = selectChatbots(getState()).design?.bots.find(candidate => candidate.id === issue.botId);
    const owner = target?.intents.find(candidate =>
      candidate.questions.some(question => question.id === issue.questionId),
    );
    dispatch(issueShown({ tab: 'conversation', botId: issue.botId, intentId: owner?.id }));
  };

const download = (fileName: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// The design, what changed since the import and the checks, for the chatbot-from-design skill
export const exportForClaude = (): AppThunk => (_dispatch, getState) => {
  const { design, stored } = selectChatbots(getState());
  if (!design || !stored) return;
  const issues = selectChatbotIssues(getState());
  const { imported, ...current } = design;
  const bots = design.bots.map(candidate => ({
    bot: `${candidate.language}/${candidate.name}`,
    status: botStatusOf(design, candidate),
    isNew: isNewBot(design, candidate),
  }));
  download(
    `${stored.code}-chatbots.json`,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        about:
          "A helpline's chatbots (Amazon Lex V2), designed in the Aselo Builder (docs/chatbot-designer.md). Implement only the chatbots whose status is 'ready' (Ready for Claude), with the chatbot-from-design skill. 'changes' lists what changed since they were imported from twilio-iac, file by file (writeTo is where to write it: a shared configs/lex_v2 file's change, and every new answer list or pattern, go to the helpline's own folder); 'design' is every chatbot as it should be, with the team's notes and comments (context for the work: the design itself is what to build).",
        helpline: stored.code,
        updatedAt: stored.meta.updatedAt,
        bots,
        changes: selectChatbotChanges(getState()),
        checks: issues.map(({ severity, message }) => ({ severity, message })),
        design: current,
        hasImport: Boolean(imported),
      },
      null,
      2,
    )}\n`,
  );
};
