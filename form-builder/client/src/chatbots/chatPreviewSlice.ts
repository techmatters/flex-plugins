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
 * The conversation played on the phone preview (ChatPreview.tsx), for the chatbot and path showing:
 * the messages so far, which question it's on, how many times it asked again, the answers it saved,
 * and what's being typed.
 */
import { createSlice, PayloadAction, WithSlice } from '@reduxjs/toolkit';
import type { AnswerType } from '@tech-matters/form-builder-shared/chatbots/model';
import { answerKindOf, answerTypeOf, matchesPattern } from '@tech-matters/form-builder-shared/chatbots/model';
import { AppThunk, rootReducer, RootState } from '../app/store';
import { selectChatbotDesign, selectSelectedBot, selectSelectedIntent } from './chatbotsSlice';

export type PreviewMessage = { from: 'bot' | 'contact' | 'system'; text: string; tone?: 'retry' | 'end' };

export type PreviewProgress = {
  question: number;
  retries: number;
  answers: Record<string, string>;
  ended?: 'done' | 'failed';
};

export type ChatPreviewState = { messages: PreviewMessage[]; progress: PreviewProgress; typed: string };

const START: PreviewProgress = { question: 0, retries: 0, answers: {} };

const initialState: ChatPreviewState = { messages: [], progress: START, typed: '' };

const chatPreviewSlice = createSlice({
  name: 'chatPreview',
  initialState,
  reducers: {
    previewRestarted: (_state, action: PayloadAction<{ messages: PreviewMessage[]; progress: PreviewProgress }>) => ({
      ...action.payload,
      typed: '',
    }),
    previewAnswered: (state, action: PayloadAction<{ messages: PreviewMessage[]; progress: PreviewProgress }>) => {
      state.messages.push(...action.payload.messages);
      state.progress = action.payload.progress;
      state.typed = '';
    },
    typedChanged: (state, action: PayloadAction<string>) => {
      state.typed = action.payload;
    },
  },
  selectors: {
    selectChatPreview: (state) => state,
  },
});

declare module '../app/store' {
  export interface LazyLoadedSlices extends WithSlice<typeof chatPreviewSlice> {}
}
const injected = chatPreviewSlice.injectInto(rootReducer);
export const { selectChatPreview } = injected.selectors;
const { previewRestarted, previewAnswered } = chatPreviewSlice.actions;
export const { typedChanged } = chatPreviewSlice.actions;

// The answers the question being asked takes
export const selectPreviewAnswerType = (state: RootState): AnswerType | undefined => {
  const design = selectChatbotDesign(state);
  const bot = selectSelectedBot(state);
  const question = selectSelectedIntent(state)?.questions[selectChatPreview(state).progress.question];
  return design && bot && question ? answerTypeOf(design, bot, question.answerType) : undefined;
};

// From the start: the greeting and the first question (or the goodbye, with no questions)
export const restartPreview = (): AppThunk => (dispatch, getState) => {
  const intent = selectSelectedIntent(getState());
  if (!intent) return;
  const first = intent.questions[0];
  dispatch(
    previewRestarted({
      messages: [
        { from: 'system', text: `Conversation starts (“${intent.utterances[0] ?? 'start'}”)` },
        ...(intent.opening ? [{ from: 'bot' as const, text: intent.opening }] : []),
        ...(first ? [{ from: 'bot' as const, text: first.question || '(no text yet)' }] : []),
        ...(!first && intent.closing ? [{ from: 'bot' as const, text: intent.closing, tone: 'end' as const }] : []),
      ],
      progress: first ? START : { ...START, ended: 'done' },
    }),
  );
};

// What the contact said, and the answer saved (none: not understood, so it asks again or stops)
export const answerPreview =
  (said: string, understood?: string): AppThunk =>
  (dispatch, getState) => {
    const intent = selectSelectedIntent(getState());
    const { progress } = selectChatPreview(getState());
    const question = intent?.questions[progress.question];
    if (!intent || !question) return;
    const messages: PreviewMessage[] = [{ from: 'contact', text: said }];
    let next: PreviewProgress;
    if (understood === undefined) {
      if (progress.retries < question.retries) {
        messages.push({ from: 'bot', text: question.question || '(no text yet)', tone: 'retry' });
        next = { ...progress, retries: progress.retries + 1 };
      } else {
        if (question.failureMessage) messages.push({ from: 'bot', text: question.failureMessage, tone: 'retry' });
        messages.push({ from: 'system', text: 'The chatbot stops here; the contact goes on to the queue' });
        next = { ...progress, ended: 'failed' };
      }
    } else {
      const answers = { ...progress.answers, [question.slot]: understood };
      const following = intent.questions[progress.question + 1];
      if (following) {
        messages.push({ from: 'bot', text: following.question || '(no text yet)' });
        next = { question: progress.question + 1, retries: 0, answers };
      } else {
        if (intent.closing) messages.push({ from: 'bot', text: intent.closing, tone: 'end' });
        next = { ...progress, answers, ended: 'done' };
      }
    }
    dispatch(previewAnswered({ messages, progress: next }));
  };

// A typed answer: a list's answer or one of its other ways of saying it, a pattern's match, or anything for Lex's own
export const submitTypedAnswer = (): AppThunk => (dispatch, getState) => {
  const said = selectChatPreview(getState()).typed.trim();
  if (!said) return;
  const type = selectPreviewAnswerType(getState());
  const understand = (): string | undefined => {
    if (!type) return undefined;
    const kind = answerKindOf(type);
    if (kind === 'builtin') return said;
    if (kind === 'pattern') return matchesPattern(type.pattern ?? '', said) ? said : undefined;
    const lower = said.toLowerCase();
    return type.values.find((option) =>
      [option.value, ...option.synonyms].some((candidate) => candidate.toLowerCase() === lower),
    )?.value;
  };
  dispatch(answerPreview(said, understand()));
};
