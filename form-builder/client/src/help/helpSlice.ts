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
 * The help panel (HelpPanel.tsx): what's typed in its box and what's searched, what it shows (its
 * start page, an article, "sent", or the questions sent), the "Did this help?" answer, sending a
 * question to the Aselo team, and (Aselo staff) the questions sent. Whether it's open, and an
 * article asked for from the page, are the app's (app/appSlice.ts): it starts again each time it's
 * opened or closed, and shows the article asked for.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import { AppThunk, rootReducer } from '../app/store';
import { helpClosed, helpOpened, helpToggled } from '../app/appSlice';
import { articleBySlug } from './articles';
import type { HelpQuestion } from './helpClient';

export type HelpView = { kind: 'home' } | { kind: 'article'; slug: string } | { kind: 'sent' } | { kind: 'questions' };

export type HelpState = {
  query: string;
  // What's searched: the query once typing pauses (or it's submitted)
  searched: string;
  view: HelpView;
  feedback?: 'yes' | 'no';
  sending: boolean;
  error?: string;
  // Aselo staff: the questions sent to the Aselo team, once loaded
  questions?: HelpQuestion[];
  // The phrasing last copied from the questions sent (`${question}→${slug}`)
  copied?: string;
};

const initialState: HelpState = { query: '', searched: '', view: { kind: 'home' }, sending: false };

const helpSlice = createSlice({
  name: 'help',
  initialState,
  reducers: {
    queryTyped: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      if (state.view.kind !== 'questions') state.view = { kind: 'home' };
    },
    // Typing paused
    querySettled: (state) => {
      state.searched = state.query.trim();
    },
    querySubmitted: (state) => {
      state.searched = state.query.trim();
      state.view = { kind: 'home' };
    },
    articleOpened: (state, action: PayloadAction<string>) => {
      state.feedback = undefined;
      state.view = { kind: 'article', slug: action.payload };
    },
    homeShown: (state) => {
      state.view = { kind: 'home' };
    },
    feedbackGiven: (state, action: PayloadAction<'yes' | 'no'>) => {
      state.feedback = action.payload;
    },
    sendStarted: (state) => {
      state.sending = true;
      state.error = undefined;
    },
    questionSent: (state) => {
      state.sending = false;
      state.view = { kind: 'sent' };
    },
    sendFailed: (state, action: PayloadAction<string>) => {
      state.sending = false;
      state.error = action.payload;
    },
    questionsShown: (state) => {
      state.view = { kind: 'questions' };
    },
    questionsLoaded: (state, action: PayloadAction<HelpQuestion[]>) => {
      state.questions = action.payload;
    },
    questionsFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    phrasingCopied: (state, action: PayloadAction<string | undefined>) => {
      state.copied = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      // Opened or closed: it starts again
      .addCase(helpToggled, () => initialState)
      .addCase(helpClosed, () => initialState)
      // An article asked for from the page (a section's "Need help?"): shown, open or not
      .addCase(helpOpened, (state, action) => {
        const { slug } = action.payload;
        if (!slug) return;
        state.query = '';
        state.searched = '';
        state.feedback = undefined;
        state.view = { kind: 'article', slug };
      }),
  selectors: {
    selectHelp: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof helpSlice> {}
}
const injected = helpSlice.injectInto(rootReducer);
export const { selectHelp } = injected.selectors;
const { sendStarted, questionSent, sendFailed, questionsShown, questionsLoaded, questionsFailed, phrasingCopied } =
  helpSlice.actions;
export const { queryTyped, querySettled, querySubmitted, articleOpened, homeShown, feedbackGiven } = helpSlice.actions;

// Sends what was asked (or, with nothing typed, the article that didn't help) to the Aselo team
export const sendHelpQuestion =
  (reason: 'unanswered' | 'notHelpful', article?: string): AppThunk<Promise<void>> =>
  async (dispatch, getState, { helpClient }) => {
    const { query } = selectHelp(getState());
    const { area } = getState().app;
    dispatch(sendStarted());
    try {
      await helpClient.send({
        question: query.trim() || articleBySlug(article ?? '')?.title || '',
        area,
        reason,
        article,
      });
      dispatch(questionSent());
    } catch (err) {
      dispatch(sendFailed((err as Error).message));
    }
  };

// Aselo staff: the questions sent. Quietly (for the count next to the link), a failure isn't shown.
export const loadSentQuestions =
  (quietly = false): AppThunk<Promise<void>> =>
  async (dispatch, _getState, { helpClient }) => {
    try {
      dispatch(questionsLoaded(await helpClient.list()));
    } catch (err) {
      if (!quietly) dispatch(questionsFailed((err as Error).message));
    }
  };

export const showSentQuestions = (): AppThunk => (dispatch) => {
  dispatch(questionsShown());
  dispatch(loadSentQuestions());
};

// A question sent, copied as a line for its closest article's questions: list
export const copyPhrasing =
  (question: string, slug: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    try {
      await navigator.clipboard.writeText(`  - ${question}`);
      dispatch(phrasingCopied(`${question}→${slug}`));
    } catch {
      dispatch(phrasingCopied(undefined));
    }
  };
