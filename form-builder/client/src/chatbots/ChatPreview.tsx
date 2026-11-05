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
 * The conversation played on a phone: the chatbot's messages appear one by one, the contact answers
 * by tapping one of the answers it understands (shown as the answer that's saved, not the other ways
 * of saying it), or by typing one for patterns and Lex's own types (a typed answer that doesn't match
 * the pattern isn't understood); "something it doesn't understand" shows the retry and what happens
 * after. At the end the answers it saved are listed: what the task and the counselor get.
 */
import { useEffect, useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { answerKindOf, botLabel, builtinLabel } from '@tech-matters/form-builder-shared/chatbots/model';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectSelectedBot, selectSelectedIntent } from './chatbotsSlice';
import {
  answerPreview,
  restartPreview,
  selectChatPreview,
  selectPreviewAnswerType,
  submitTypedAnswer,
  typedChanged,
} from './chatPreviewSlice';

// The chatbot and path showing (ChatbotsArea only shows the preview when there are both)
export const ChatPreview = () => {
  const dispatch = useAppDispatch();
  const bot = useAppSelector(selectSelectedBot)!;
  const intent = useAppSelector(selectSelectedIntent)!;
  const { messages, progress: state, typed } = useAppSelector(selectChatPreview);
  const type = useAppSelector(selectPreviewAnswerType);
  const end = useRef<HTMLDivElement>(null);
  const questionKey = useMemo(() => JSON.stringify(intent), [intent]);

  // Start again whenever the conversation is changed
  useEffect(() => {
    dispatch(restartPreview());
  }, [dispatch, questionKey]);

  // Layout only: the newest message in view
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' });
  }, [messages]);

  const question = intent.questions[state.question];
  const kind = type && answerKindOf(type);
  const answer = (said: string, understood?: string) => dispatch(answerPreview(said, understood));

  return (
    <div className="chatbot-phone" aria-label="Preview">
      <div className="chatbot-phone-head">
        <span>{botLabel(bot.name)}</span>
        <button
          type="button"
          className="icon-button"
          aria-label="Start again"
          onClick={() => dispatch(restartPreview())}
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="chatbot-phone-screen">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.from} ${message.tone ?? ''}`}>
            {message.text}
          </div>
        ))}
        {state.ended && Object.keys(state.answers).length > 0 && (
          <div className="chatbot-saved">
            <strong>Saved for the counselor</strong>
            {Object.entries(state.answers).map(([slot, value]) => (
              <span key={slot}>
                <code>{slot}</code> {value}
              </span>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      {!state.ended && question && (
        <div className="chatbot-phone-answers">
          {kind === 'list' &&
            type?.values.slice(0, 10).map(option => (
              <button
                key={option.value}
                type="button"
                className="chatbot-quick"
                title={option.synonyms.length > 0 ? `Also understood: ${option.synonyms.join(', ')}` : undefined}
                onClick={() => answer(option.value, option.value)}
              >
                {option.value}
              </button>
            ))}
          <form
            className="chatbot-type"
            onSubmit={e => {
              e.preventDefault();
              dispatch(submitTypedAnswer());
            }}
          >
            <input
              type="text"
              value={typed}
              placeholder={
                // eslint-disable-next-line no-nested-ternary
                kind === 'builtin'
                  ? `Type ${builtinLabel(type!.name)}…`
                  : kind === 'pattern'
                  ? `Type an answer matching ${type!.pattern}…`
                  : 'Or type what they’d write…'
              }
              aria-label="Type an answer"
              onChange={e => dispatch(typedChanged(e.target.value))}
            />
          </form>
          <button type="button" className="chatbot-quick not-understood" onClick={() => answer('🤔 …')}>
            Something it doesn&apos;t understand
          </button>
        </div>
      )}
    </div>
  );
};
