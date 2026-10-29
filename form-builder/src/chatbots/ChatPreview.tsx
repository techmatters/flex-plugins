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
import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Chatbot, ChatbotDesign, ChatbotIntent } from './model';
import { answerKindOf, answerTypeOf, botLabel, builtinLabel, matchesPattern } from './model';

type Message = { from: 'bot' | 'contact' | 'system'; text: string; tone?: 'retry' | 'end' };

type State = { question: number; retries: number; answers: Record<string, string>; ended?: 'done' | 'failed' };

const START: State = { question: 0, retries: 0, answers: {} };

export const ChatPreview = ({
  design,
  bot,
  intent,
}: {
  design: ChatbotDesign;
  bot: Chatbot;
  intent: ChatbotIntent;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<State>(START);
  const [typed, setTyped] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const questionKey = useMemo(() => JSON.stringify(intent), [intent]);

  const restart = () => {
    const first = intent.questions[0];
    setMessages([
      { from: 'system', text: `Conversation starts (“${intent.utterances[0] ?? 'start'}”)` },
      ...(intent.opening ? [{ from: 'bot' as const, text: intent.opening }] : []),
      ...(first ? [{ from: 'bot' as const, text: first.question || '(no text yet)' }] : []),
      ...(!first && intent.closing ? [{ from: 'bot' as const, text: intent.closing, tone: 'end' as const }] : []),
    ]);
    setState(first ? START : { ...START, ended: 'done' });
    setTyped('');
  };

  // Start again whenever the conversation is changed
  useEffect(restart, [questionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' });
  }, [messages]);

  const question = intent.questions[state.question];
  const type = question ? answerTypeOf(design, bot, question.answerType) : undefined;
  const kind = type && answerKindOf(type);
  // A typed answer: a list's answer or one of its other ways of saying it, a pattern's match, or anything for Lex's own
  const understand = (said: string): string | undefined => {
    if (!type) return undefined;
    if (kind === 'builtin') return said;
    if (kind === 'pattern') return matchesPattern(type.pattern ?? '', said) ? said : undefined;
    const lower = said.toLowerCase();
    const found = type.values.find((option) =>
      [option.value, ...option.synonyms].some((candidate) => candidate.toLowerCase() === lower),
    );
    return found?.value;
  };

  const answer = (said: string, understood?: string) => {
    if (!question) return;
    const next: Message[] = [{ from: 'contact', text: said }];
    if (understood === undefined) {
      if (state.retries < question.retries) {
        next.push({ from: 'bot', text: question.question || '(no text yet)', tone: 'retry' });
        setState({ ...state, retries: state.retries + 1 });
      } else {
        if (question.failureMessage) next.push({ from: 'bot', text: question.failureMessage, tone: 'retry' });
        next.push({ from: 'system', text: 'The chatbot stops here; the contact goes on to the queue' });
        setState({ ...state, ended: 'failed' });
      }
    } else {
      const answers = { ...state.answers, [question.slot]: understood };
      const following = intent.questions[state.question + 1];
      if (following) {
        next.push({ from: 'bot', text: following.question || '(no text yet)' });
        setState({ question: state.question + 1, retries: 0, answers });
      } else {
        if (intent.closing) next.push({ from: 'bot', text: intent.closing, tone: 'end' });
        setState({ ...state, answers, ended: 'done' });
      }
    }
    setMessages((current) => [...current, ...next]);
    setTyped('');
  };

  return (
    <div className="chatbot-phone" aria-label="Preview">
      <div className="chatbot-phone-head">
        <span>{botLabel(bot.name)}</span>
        <button type="button" className="icon-button" aria-label="Start again" onClick={restart}>
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
            type?.values.slice(0, 10).map((option) => (
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
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) answer(typed.trim(), understand(typed.trim()));
            }}
          >
            <input
              type="text"
              value={typed}
              placeholder={
                kind === 'builtin'
                  ? `Type ${builtinLabel(type!.name)}…`
                  : kind === 'pattern'
                    ? `Type an answer matching ${type!.pattern}…`
                    : 'Or type what they’d write…'
              }
              aria-label="Type an answer"
              onChange={(e) => setTyped(e.target.value)}
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
