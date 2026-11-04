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
 * The review panels (ReviewPanel.tsx): replies being written, by thread; the flag or comment being
 * added, by form or field; whether resolved threads are shown; and each change being saved (its
 * approvals, a thread, a new flag) with its error. The review itself is kept in the draft
 * (drafts/draftSlice.ts: approveReview, changeReviewThread). Opening another helpline starts again.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { FlagKind } from '@tech-matters/form-builder-shared';
import type { Person } from '@tech-matters/form-builder-shared/flows/model';
import { AppThunk, rootReducer } from '../app/store';
import { approveReview, changeReviewThread, draftStarted } from '../drafts/draftSlice';
import type { ThreadChange } from '../drafts/draftClient';
import { selectPeople } from '../workspace/workspaceSlice';

export type NewFlag = {
  // Open (Cancel closes it, keeping what was written)
  adding: boolean;
  // Its kind, once chosen (until then, the side's usual one: ReviewPanel)
  kind?: FlagKind;
  text: string;
  // The person it's for (personKey), or '' for no one in particular
  assigneeKey: string;
};

// A change being saved, and why the last one failed
export type Saving = { busy: boolean; error?: string };

export type ReviewPanelState = {
  // By thread id
  replies: Record<string, string>;
  // By target, while being written
  newFlags: Record<string, NewFlag>;
  // By target
  showResolved: Record<string, boolean>;
  // By what's saved: savingKey(...)
  saving: Record<string, Saving>;
};

const initialState: ReviewPanelState = { replies: {}, newFlags: {}, showResolved: {}, saving: {} };

export const personKey = (person: Person) => person.email ?? person.name;

export const savingKey = {
  approvals: (target: string) => `approvals:${target}`,
  thread: (id: string) => `thread:${id}`,
  newFlag: (target: string) => `flag:${target}`,
};

const reviewPanelSlice = createSlice({
  name: 'reviewPanel',
  initialState,
  reducers: {
    replyChanged: (state, action: PayloadAction<{ id: string; text: string }>) => {
      state.replies[action.payload.id] = action.payload.text;
    },
    newFlagStarted: (state, action: PayloadAction<string>) => {
      const flag = state.newFlags[action.payload];
      if (flag) flag.adding = true;
      else state.newFlags[action.payload] = { adding: true, text: '', assigneeKey: '' };
    },
    newFlagChanged: (state, action: PayloadAction<{ target: string; change: Partial<NewFlag> }>) => {
      const { target, change } = action.payload;
      state.newFlags[target] = {
        ...(state.newFlags[target] ?? { adding: true, text: '', assigneeKey: '' }),
        ...change,
      };
    },
    newFlagCancelled: (state, action: PayloadAction<string>) => {
      const flag = state.newFlags[action.payload];
      if (flag) flag.adding = false;
    },
    // Saved: it closes, empty (its kind stays chosen)
    flagAdded: (state, action: PayloadAction<string>) => {
      const flag = state.newFlags[action.payload];
      if (flag) Object.assign(flag, { adding: false, text: '', assigneeKey: '' });
    },
    resolvedToggled: (state, action: PayloadAction<string>) => {
      state.showResolved[action.payload] = !state.showResolved[action.payload];
    },
    saveStarted: (state, action: PayloadAction<string>) => {
      state.saving[action.payload] = { busy: true };
    },
    saveDone: (state, action: PayloadAction<string>) => {
      delete state.saving[action.payload];
    },
    saveFailed: (state, action: PayloadAction<{ key: string; error: string }>) => {
      state.saving[action.payload.key] = { busy: false, error: action.payload.error };
    },
  },
  extraReducers: builder => builder.addCase(draftStarted, () => initialState),
  selectors: {
    selectReviewPanel: state => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof reviewPanelSlice> {}
}
const injected = reviewPanelSlice.injectInto(rootReducer);
export const { selectReviewPanel } = injected.selectors;
const { saveStarted, saveDone, saveFailed, flagAdded } = reviewPanelSlice.actions;
export const { replyChanged, newFlagStarted, newFlagChanged, newFlagCancelled, resolvedToggled } =
  reviewPanelSlice.actions;

// Runs a review change, keeping track of it being saved and of errors; true if it was saved
const runSaving =
  (key: string, save: AppThunk<Promise<void>>): AppThunk<Promise<boolean>> =>
  async dispatch => {
    dispatch(saveStarted(key));
    try {
      await dispatch(save);
      dispatch(saveDone(key));
      return true;
    } catch (err) {
      dispatch(saveFailed({ key, error: `Couldn't save: ${(err as Error).message}` }));
      return false;
    }
  };

// Approves a form or field for the user's side (with the fingerprint of what they approved), or
// takes the approval back (null)
export const approveTarget =
  (target: string, fingerprint: string | null): AppThunk<Promise<boolean>> =>
  dispatch =>
    dispatch(runSaving(savingKey.approvals(target), approveReview(target, fingerprint)));

// Resolves, reopens or deletes a thread
export const changeThread =
  (change: Extract<ThreadChange, { action: 'resolve' | 'delete' }>): AppThunk<Promise<boolean>> =>
  dispatch =>
    dispatch(runSaving(savingKey.thread(change.id), changeReviewThread(change)));

// Sends the reply written (and resolves the thread, if asked); it's cleared once saved
export const sendReply =
  (id: string, resolve: boolean): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const text = (selectReviewPanel(getState()).replies[id] ?? '').trim();
    if (await dispatch(runSaving(savingKey.thread(id), changeReviewThread({ action: 'reply', id, text, resolve })))) {
      dispatch(replyChanged({ id, text: '' }));
    }
  };

// Adds the flag or comment written on a form or field (of the kind given when none was chosen);
// the form closes once it's saved
export const addFlag =
  (target: string, defaultKind: FlagKind): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const flag = selectReviewPanel(getState()).newFlags[target];
    if (!flag?.text.trim()) return;
    const assignee = selectPeople(getState()).find(person => personKey(person) === flag.assigneeKey);
    const added = await dispatch(
      runSaving(
        savingKey.newFlag(target),
        changeReviewThread({
          action: 'add',
          target,
          kind: flag.kind ?? defaultKind,
          text: flag.text.trim(),
          ...(assignee
            ? {
                assignee: assignee.name,
                ...(assignee.email ? { assigneeEmail: assignee.email } : {}),
              }
            : {}),
        }),
      ),
    );
    if (added) dispatch(flagAdded(target));
  };
