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
 * The draft of the open helpline's definition files, kept on the server (server/src/api.ts):
 * locally in form-builder/drafts, deployed in a private S3 bucket. Changes are saved a moment
 * after each edit, one save at a time (startDraftAutosave).
 *
 * - A saved change is only restored if the file it was based on hasn't changed since (e.g. a
 *   PR was merged meanwhile); otherwise it's dropped and the user is told.
 * - If someone else saved the draft in between, saving stops and the user is asked to reload,
 *   rather than either person silently overwriting the other.
 *
 * - A draft started from another flex-plugins branch isn't mixed with these files, and nothing is
 *   saved over it (a conflict with its `branch`).
 *
 * Editors change the files with editDraftFiles (or their own actions built on it).
 */
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApplyResult, DraftMeta, ImportSource } from '@tech-matters/form-builder-shared';
import type { DefinitionFileMap } from '../common/definitions';
import type { AppListenerStartListening, AppThunk, RootState } from '../app/store';
import { getChangedFilePaths } from './changes';
import type { DraftConflict, ThreadChange } from './draftClient';

export type SaveState = 'loading' | 'saved' | 'pending' | 'saving' | 'conflict' | 'error';

export type { DraftConflict };

export type DraftState = {
  code: string;
  version: string;
  // The flex-plugins branch the files were read from, when not the default (sent with each save)
  source?: ImportSource;
  // The files as they are (applied), and as the draft has them
  original: DefinitionFileMap;
  files: DefinitionFileMap;
  saveState: SaveState;
  meta?: Partial<DraftMeta>;
  // Something to tell the user (dropped changes, a failed save)
  notice?: string;
  conflict?: DraftConflict;
  // The server's revision of the draft, so two people can't overwrite each other unknowingly
  revision: number;
  // What was last saved, so unchanged drafts aren't saved again
  lastSavedJson: string;
};

const initialState: DraftState = {
  code: '',
  version: '',
  original: {},
  files: {},
  saveState: 'loading',
  revision: 0,
  lastSavedJson: '{}',
};

// Small non-cryptographic hash, only used to tell whether a file changed underneath a draft
export const hashJson = (value: unknown) => {
  const text = JSON.stringify(value) ?? '';
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 33) ^ text.charCodeAt(i);
  return (hash >>> 0).toString(16);
};

const changedFiles = (original: DefinitionFileMap, files: DefinitionFileMap) =>
  Object.fromEntries(getChangedFilePaths(original, files).map((filePath) => [filePath, files[filePath]]));

const changedJsonOf = (state: DraftState) => JSON.stringify(changedFiles(state.original, state.files));

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    // A helpline was opened: its draft starts as the files, until the saved one is loaded
    draftStarted: (
      _state,
      action: PayloadAction<{ code: string; version: string; original: DefinitionFileMap; source?: ImportSource }>,
    ) => ({
      ...initialState,
      ...action.payload,
      files: action.payload.original,
    }),
    draftLoaded: (
      state,
      action: PayloadAction<{ files: DefinitionFileMap; meta?: Partial<DraftMeta>; revision: number; notice?: string }>,
    ) => {
      state.files = action.payload.files;
      state.meta = action.payload.meta;
      state.revision = action.payload.revision;
      state.notice = action.payload.notice;
      state.lastSavedJson = changedJsonOf(state);
      state.saveState = 'saved';
    },
    // A saved draft started from another branch: kept as it is, and nothing saved over it
    draftFromOtherBranch: (state, action: PayloadAction<{ meta: Partial<DraftMeta>; conflict: DraftConflict }>) => {
      state.meta = action.payload.meta;
      state.conflict = action.payload.conflict;
      state.saveState = 'conflict';
    },
    draftLoadFailed: (state, action: PayloadAction<string>) => {
      state.saveState = 'error';
      state.notice = `Couldn't load the saved draft: ${action.payload}`;
    },
    filesUpdated: (state, action: PayloadAction<DefinitionFileMap>) => {
      state.files = action.payload;
    },
    saveStateChanged: (state, action: PayloadAction<SaveState>) => {
      state.saveState = action.payload;
    },
    draftSaved: (state, action: PayloadAction<{ meta: Partial<DraftMeta> & { revision: number }; json: string }>) => {
      const { meta, json } = action.payload;
      state.revision = meta.revision;
      state.lastSavedJson = json;
      state.meta = meta.revision === 0 ? undefined : { ...state.meta, ...meta };
      // Edits made while it was saving still need saving
      state.saveState = changedJsonOf(state) === json ? 'saved' : 'pending';
    },
    saveConflicted: (state, action: PayloadAction<DraftConflict>) => {
      state.conflict = action.payload;
      state.saveState = 'conflict';
    },
    saveFailed: (state, action: PayloadAction<string>) => {
      state.saveState = 'error';
      state.notice = `Couldn't save the draft: ${action.payload}`;
    },
    noticeDismissed: (state) => {
      state.notice = undefined;
    },
    draftDiscarded: (state, action: PayloadAction<{ revision: number }>) => {
      state.revision = action.payload.revision;
      state.lastSavedJson = '{}';
      state.meta = undefined;
      state.notice = undefined;
      state.files = state.original;
      state.saveState = 'saved';
    },
    draftSubmitted: (state, action: PayloadAction<DraftMeta>) => {
      state.meta = action.payload;
    },
    // The forms' review (shared/src/reviews.ts) as the server now has it
    reviewKept: (state, action: PayloadAction<DraftMeta>) => {
      const { approvals, threads, reviewLog } = action.payload;
      state.meta = { ...state.meta, approvals, threads, reviewLog };
    },
  },
});

export const { draftStarted, filesUpdated, noticeDismissed } = draftSlice.actions;
const {
  draftLoaded,
  draftFromOtherBranch,
  draftLoadFailed,
  saveStateChanged,
  draftSaved,
  saveConflicted,
  saveFailed,
  draftDiscarded,
  draftSubmitted,
  reviewKept,
} = draftSlice.actions;
export const draftReducer = draftSlice.reducer;

export const selectDraft = (state: RootState) => state.draft;
export const selectDraftFiles = (state: RootState) => state.draft.files;
export const selectOriginalFiles = (state: RootState) => state.draft.original;
export const selectChangedPaths = createSelector([selectOriginalFiles, selectDraftFiles], getChangedFilePaths);

// Loads the saved draft, if there is one, keeping only changes whose file is still as it was
export const loadDraft = (): AppThunk<Promise<void>> => async (dispatch, getState, { draftClient }) => {
  const { code, version, original, source } = getState().draft;
  try {
    const saved = await draftClient.load(code, version);
    // A draft started from another branch: not mixed with these files, and nothing saved over it
    const savedBranch = saved?.meta.source?.branch ?? '';
    if (saved && (Object.keys(saved.files).length > 0 || saved.meta.source) && savedBranch !== (source?.branch ?? '')) {
      const { updatedBy, updatedAt } = saved.meta;
      dispatch(draftFromOtherBranch({ meta: saved.meta, conflict: { updatedBy, updatedAt, branch: savedBranch || 'master' } }));
      return;
    }
    if (!saved) {
      dispatch(draftLoaded({ files: original, revision: 0 }));
      return;
    }
    const files = { ...original };
    const outdated: string[] = [];
    Object.entries(saved.files).forEach(([filePath, value]) => {
      const baseHash = saved.meta.baseHashes[filePath];
      if (!baseHash || baseHash === hashJson(original[filePath])) files[filePath] = value;
      else outdated.push(filePath);
    });
    dispatch(
      draftLoaded({
        files,
        meta: saved.meta,
        revision: saved.meta.revision,
        notice:
          outdated.length > 0
            ? `Some saved changes were dropped because these files changed since the draft was started: ${outdated.join(', ')}.`
            : undefined,
      }),
    );
  } catch (err) {
    dispatch(draftLoadFailed((err as Error).message));
  }
};

// Changes the draft's files: the updater gets them as they are and returns them changed
export const editDraftFiles =
  (updater: (files: DefinitionFileMap) => DefinitionFileMap): AppThunk =>
  (dispatch, getState) => {
    dispatch(filesUpdated(updater(getState().draft.files)));
  };

const saveNow = (): AppThunk<Promise<void>> => async (dispatch, getState, { draftClient }) => {
  const state = getState().draft;
  const changed = changedFiles(state.original, state.files);
  const json = JSON.stringify(changed);
  if (json === state.lastSavedJson) {
    dispatch(saveStateChanged('saved'));
    return;
  }
  dispatch(saveStateChanged('saving'));
  try {
    const outcome = await draftClient.save(state.code, state.version, {
      expectedRevision: state.revision,
      files: changed,
      baseHashes: Object.fromEntries(Object.keys(changed).map((filePath) => [filePath, hashJson(state.original[filePath])])),
      ...(state.source ? { source: state.source } : {}),
    });
    if (!outcome.ok) dispatch(saveConflicted(outcome.conflict));
    else dispatch(draftSaved({ meta: outcome.meta, json }));
  } catch (err) {
    dispatch(saveFailed((err as Error).message));
  }
};

// Saves now, after any save already under way (each uses the revision the previous one returned)
export const flushDraft = (): AppThunk<Promise<void>> => (dispatch, _getState, services) => {
  services.saveQueue.current = services.saveQueue.current.then(() => dispatch(saveNow()));
  return services.saveQueue.current;
};

// Leaving the helpline (back to the Forms start page, or another one) saves what's still waiting.
// Nothing to save, nothing to wait for: the next helpline opens straight away.
export const saveBeforeLeaving = (): AppThunk<Promise<void> | undefined> => (dispatch, getState) => {
  const state = getState().draft;
  if (!state.code || state.saveState === 'loading' || state.conflict) return undefined;
  return changedJsonOf(state) !== state.lastSavedJson ? dispatch(flushDraft()) : undefined;
};

export const discardDraft = (): AppThunk<Promise<void>> => async (dispatch, getState, services) => {
  await services.saveQueue.current;
  const { code, version } = getState().draft;
  dispatch(draftDiscarded({ revision: await services.draftClient.discard(code, version) }));
};

export const submitDraft = (): AppThunk<Promise<void>> => async (dispatch, getState, { draftClient }) => {
  await dispatch(flushDraft());
  const { code, version } = getState().draft;
  dispatch(draftSubmitted(await draftClient.submit(code, version)));
};

// Reviewing the forms (shared/src/reviews.ts). Saves first, so there's a draft to keep it in.
// Approves a form or field for the user's side (with the fingerprint of what they approved), or
// takes the approval back (null)
export const approveReview =
  (target: string, fingerprint: string | null): AppThunk<Promise<void>> =>
  async (dispatch, getState, { draftClient }) => {
    await dispatch(flushDraft());
    const { code, version } = getState().draft;
    dispatch(reviewKept(await draftClient.approve(code, version, target, fingerprint)));
  };

export const changeReviewThread =
  (change: ThreadChange): AppThunk<Promise<void>> =>
  async (dispatch, getState, { draftClient }) => {
    await dispatch(flushDraft());
    const { code, version } = getState().draft;
    dispatch(reviewKept(await draftClient.thread(code, version, change)));
  };

export const applyDraft =
  (description?: string): AppThunk<Promise<ApplyResult>> =>
  async (dispatch, getState, { draftClient }) => {
    await dispatch(flushDraft());
    const { code, version } = getState().draft;
    return draftClient.apply(code, version, description);
  };

// Saves a moment after the last edit (while the draft is loaded and not in conflict)
export const startDraftAutosave = (startListening: AppListenerStartListening) =>
  startListening({
    actionCreator: filesUpdated,
    effect: async (_action, listenerApi) => {
      const state = listenerApi.getState().draft;
      if (state.saveState === 'loading' || state.conflict) return;
      if (changedJsonOf(state) === state.lastSavedJson) return;
      listenerApi.dispatch(saveStateChanged('pending'));
      // A newer edit restarts the wait
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(listenerApi.extra.saveDelayMs);
      await listenerApi.dispatch(flushDraft());
    },
  });
