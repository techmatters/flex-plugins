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
 * One chatbot's conversation as a timeline, top to bottom: what starts it, the greeting, each
 * question (as the chatbot asks it, the answers it understands, the contact form fields its answer
 * fills in, and what it says when it doesn't understand), and the goodbye. Texts are edited where
 * they are shown; each question can carry comments.
 */
import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  CircleHelp,
  ClipboardList,
  Flag,
  Info,
  MessageCircle,
  MessageSquareText,
  Play,
  Trash2,
} from 'lucide-react';
import type { AnswerType, Chatbot, ChatbotIntent, ChatbotQuestion } from '@tech-matters/form-builder-shared/chatbots/model';
import { answerKindOf, answerTypeOf, BUILTIN_TYPES, builtinInfo, builtinLabel, fillsInContact } from '@tech-matters/form-builder-shared/chatbots/model';
import { openComments } from './edit';
import { Loading } from '../common/Loading';
import type { ContactForms } from '@tech-matters/form-builder-shared/chatbots/formMappings';
import { targetLabel, unmatchedAnswers } from '@tech-matters/form-builder-shared/chatbots/formMappings';
import { AutoTextarea } from '../common/AutoTextarea';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  addQuestion,
  answerPickerChanged,
  changeIntent,
  changeQuestion,
  createAnswerTypeForQuestion,
  moveQuestionTo,
  pickAnswerType,
  removeQuestion,
  renameQuestionSlot,
  selectChatbotDesign,
  selectChatbotIssues,
  selectChatbots,
  selectChatbotsReadOnly,
  selectCommentAuthor,
  selectContactForms,
  selectSelectedBot,
  selectSelectedIntent,
  setQuestionFormTargets,
} from './chatbotsSlice';
import { CommentsToggle, CommentThread } from './Comments';

const Bubble = ({
  text,
  label,
  tone = 'bot',
  readOnly,
  placeholder,
  onChange,
}: {
  text?: string;
  label: string;
  tone?: 'bot' | 'retry' | 'end';
  readOnly: boolean;
  placeholder?: string;
  onChange: (text: string) => void;
}) => (
  <div className={`chatbot-bubble ${tone}`}>
    <span className="chatbot-bubble-avatar" aria-hidden>
      <Bot size={14} />
    </span>
    <AutoTextarea
      value={text ?? ''}
      minRows={2}
      aria-label={label}
      placeholder={placeholder}
      disabled={readOnly}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// The phrases that start the conversation, as chips
const Utterances = ({
  intent,
  readOnly,
  onChange,
}: {
  intent: ChatbotIntent;
  readOnly: boolean;
  onChange: (utterances: string[]) => void;
}) => {
  const [adding, setAdding] = useState('');
  return (
    <div className="chatbot-start">
      <span className="chatbot-step-icon start" aria-hidden>
        <Play size={14} />
      </span>
      <div>
        <h4>Starts when the contact (or the flow) says</h4>
        <div className="chatbot-chips">
          {intent.utterances.map((utterance, index) => (
            <span key={`${utterance}-${index}`} className="chatbot-chip said">
              “{utterance}”
              {!readOnly && (
                <button
                  type="button"
                  aria-label={`Remove “${utterance}”`}
                  onClick={() => onChange(intent.utterances.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {!readOnly && (
            <input
              type="text"
              value={adding}
              placeholder="Add a phrase…"
              aria-label="Add a phrase that starts it"
              onChange={(e) => setAdding(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && adding.trim()) {
                  onChange([...intent.utterances, adding.trim()]);
                  setAdding('');
                }
              }}
            />
          )}
        </div>
        {intent.utterances.length === 0 && (
          <p className="field-hint">
            The Studio flow starts the chatbot by sending one of these, e.g. “Incoming webchat contact”.
          </p>
        )}
      </div>
    </div>
  );
};

const NEW_LIST = '__new-list';
const NEW_PATTERN = '__new-pattern';

/**
 * Which answers a question takes: one of the language's lists or patterns, one of Lex's own types,
 * or a new list or pattern (named after the question by default)
 */
const AnswerPicker = ({ bot, intent, question }: { bot: Chatbot; intent: ChatbotIntent; question: ChatbotQuestion }) => {
  const dispatch = useAppDispatch();
  const design = useAppSelector(selectChatbotDesign)!;
  const readOnly = useAppSelector(selectChatbotsReadOnly);
  // A new list or pattern being named
  const picker = useAppSelector(selectChatbots).answerPickers[question.id];
  const creating = picker?.kind;
  const name = picker?.name ?? '';
  const types = Object.values(design.answerTypes[bot.language] ?? {}).filter((type) => !type.builtin);
  const lists = types.filter((type) => answerKindOf(type) === 'list').sort((a, b) => a.name.localeCompare(b.name));
  const patterns = types
    .filter((type) => answerKindOf(type) === 'pattern')
    .sort((a, b) => a.name.localeCompare(b.name));
  const known = new Set([...types.map((type) => type.name), ...BUILTIN_TYPES.map((type) => type.name)]);
  const taken = (candidate: string) => Boolean(design.answerTypes[bot.language]?.[candidate]);
  return (
    <span className="chatbot-answer-picker">
      <select
        value={question.answerType}
        aria-label="Answers it takes"
        disabled={readOnly}
        onChange={(e) => {
          const value = e.target.value;
          if (value === NEW_LIST || value === NEW_PATTERN) {
            dispatch(
              answerPickerChanged({
                questionId: question.id,
                form: {
                  kind: value === NEW_LIST ? 'list' : 'pattern',
                  name: taken(question.slot) ? `${question.slot}Answers` : question.slot,
                },
              }),
            );
            return;
          }
          dispatch(pickAnswerType(bot.id, intent.id, question.id, value));
        }}
      >
        {!known.has(question.answerType) && <option value={question.answerType}>{question.answerType}</option>}
        <optgroup label="A list of answers">
          {lists.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name} ({type.values.length})
            </option>
          ))}
          {!readOnly && <option value={NEW_LIST}>+ New list of answers…</option>}
        </optgroup>
        <optgroup label="Anything matching a pattern">
          {patterns.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name} ({type.pattern})
            </option>
          ))}
          {!readOnly && <option value={NEW_PATTERN}>+ New pattern…</option>}
        </optgroup>
        <optgroup label="Lex's own">
          {BUILTIN_TYPES.map((type) => (
            <option key={type.name} value={type.name}>
              Any {type.label} ({type.name})
            </option>
          ))}
        </optgroup>
      </select>
      {creating && (
        <span className="chatbot-answer-new">
          <input
            type="text"
            value={name}
            aria-label={creating === 'list' ? 'Name of the new list' : 'Name of the new pattern'}
            onChange={(e) =>
              dispatch(answerPickerChanged({ questionId: question.id, form: { kind: creating, name: e.target.value } }))
            }
          />
          <button
            type="button"
            className="secondary-button"
            disabled={!name || taken(name) || name.startsWith('AMAZON.')}
            onClick={() => dispatch(createAnswerTypeForQuestion(bot.id, intent.id, question.id))}
          >
            Create
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => dispatch(answerPickerChanged({ questionId: question.id }))}
          >
            Cancel
          </button>
          {taken(name) && <span className="field-hint">There&apos;s already one called {name}.</span>}
        </span>
      )}
    </span>
  );
};

const AnswerChips = ({ type }: { type?: AnswerType }) => {
  if (!type) return null;
  const kind = answerKindOf(type);
  if (kind === 'builtin') {
    const info = builtinInfo(type.name);
    return (
      <div className="chatbot-chips">
        <span className="chatbot-chip any">Any {builtinLabel(type.name)}</span>
        {info && (
          <span className="field-hint">
            saves {info.saves}, e.g. “{info.example}”
          </span>
        )}
      </div>
    );
  }
  if (kind === 'pattern') {
    return (
      <div className="chatbot-chips">
        <span className="chatbot-chip any">
          Matching <code>{type.pattern}</code>
        </span>
        <span className="field-hint">saves what they wrote (up to 30 characters)</span>
      </div>
    );
  }
  const shown = type.values.slice(0, 12);
  return (
    <div className="chatbot-chips">
      {shown.map((option) => (
        <span
          key={option.value}
          className="chatbot-chip answer"
          title={option.synonyms.length > 0 ? `Also: ${option.synonyms.join(', ')}` : undefined}
        >
          {option.value}
          {option.synonyms.length > 0 && <span className="chatbot-chip-count">+{option.synonyms.length}</span>}
          {openComments(option.comments).length > 0 && (
            <MessageCircle size={11} className="chatbot-chip-commented" aria-label="Has comments" />
          )}
        </span>
      ))}
      {type.values.length > shown.length && (
        <span className="chatbot-chip more">and {type.values.length - shown.length} more</span>
      )}
    </div>
  );
};

// Each field of a tab, to choose one ("ChildInformationTab.age"), leaving out the ones already chosen
const FieldOptions = ({ forms, exclude }: { forms: ContactForms; exclude: string[] }) => (
  <>
    {forms.tabs.map((tab) => (
      <optgroup key={tab.key} label={tab.key}>
        {tab.fields
          .filter((field) => !exclude.includes(`${tab.key}.${field.name}`))
          .map((field) => (
            <option key={field.name} value={`${tab.key}.${field.name}`} title={field.label}>
              {tab.key}.{field.name}
            </option>
          ))}
      </optgroup>
    ))}
  </>
);

const MAPPING_HELP =
  'Each chip is filled in (if its tab is one the form selector fills in). A chip with "first of" fills in only the first of its fields whose tab is filled in: e.g. CallerInformationTab.x | ChildInformationTab.x goes to the caller when the contact is about someone else, else to the child.';

/**
 * The contact form fields the answer fills in when the contact reaches a counselor
 * (PrepopulateMappings.json, survey: [["A", "B"], ["C"]] fills in the first of A and B there is,
 * and C), with what would be lost on the way
 */
const FormFieldsRow = ({ question, type }: { question: ChatbotQuestion; type?: AnswerType }) => {
  const dispatch = useAppDispatch();
  const design = useAppSelector(selectChatbotDesign)!;
  const forms = useAppSelector(selectContactForms);
  const readOnly = useAppSelector(selectChatbotsReadOnly);
  const groups = design.formMappings?.[question.slot] ?? [];
  const targets = groups.flat();
  const set = (next: string[][]) => dispatch(setQuestionFormTargets(question.slot, next));
  return (
    <div className="chatbot-form-fields">
      <span className="chatbot-answers-label">
        <ClipboardList size={13} aria-hidden /> Fills in on the contact form
        <span className="chatbot-info" title={MAPPING_HELP} aria-label={MAPPING_HELP} role="img">
          <Info size={12} aria-hidden />
        </span>
      </span>
      <div className="chatbot-chips">
        {groups.map((group, index) => (
          <span key={group.join('|')} className="chatbot-form-target">
            <span className="chatbot-chip field">
              {group.length > 1 && <span className="chatbot-first-of">first of</span>}
              {group.map((target, position) => (
                <span key={target} className="chatbot-field-name" title={targetLabel(forms, target)}>
                  {position > 0 && <span className="chatbot-field-or">|</span>}
                  <code>{target}</code>
                  {!readOnly && group.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove ${target} from the first of`}
                      onClick={() =>
                        set(groups.map((other, i) => (i === index ? other.filter((item) => item !== target) : other)))
                      }
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {!readOnly && forms && (
                <select
                  value=""
                  className="chatbot-field-or-select"
                  aria-label={`Or, if ${group[group.length - 1]} isn't there`}
                  title="Add a field to fill in instead when this one's tab isn't filled in"
                  onChange={(e) =>
                    e.target.value && set(groups.map((other, i) => (i === index ? [...other, e.target.value] : other)))
                  }
                >
                  <option value="">or…</option>
                  <FieldOptions forms={forms} exclude={targets} />
                </select>
              )}
              {!readOnly && (
                <button
                  type="button"
                  aria-label={`Stop filling in ${group.join(' or ')}`}
                  onClick={() => set(groups.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              )}
            </span>
            {forms &&
              group.map((target) => {
                const unmatched = unmatchedAnswers(question.slot, type, forms, target);
                if (unmatched === 'any') {
                  return (
                    <span key={target} className="chatbot-form-warning">
                      {target} is a dropdown: answers that aren&apos;t one of its options are saved as Unknown.
                    </span>
                  );
                }
                return unmatched.length > 0 ? (
                  <span key={target} className="chatbot-form-warning">
                    {target} has no option for {unmatched.map((value) => `“${value}”`).join(', ')}: saved as Unknown.
                  </span>
                ) : null;
              })}
          </span>
        ))}
        {targets.length === 0 && <span className="field-hint">Nothing: the answer is only kept with the contact.</span>}
        {!readOnly && forms && (
          <select
            value=""
            aria-label="Fill in a contact form field"
            onChange={(e) => e.target.value && set([...groups, [e.target.value]])}
          >
            <option value="">+ Fill in a field…</option>
            <FieldOptions forms={forms} exclude={targets} />
          </select>
        )}
        {!forms && <Loading inline text="Loading the contact form…" />}
      </div>
    </div>
  );
};

const QuestionCard = ({
  bot,
  intent,
  question,
  index,
}: {
  bot: Chatbot;
  intent: ChatbotIntent;
  question: ChatbotQuestion;
  index: number;
}) => {
  const dispatch = useAppDispatch();
  const design = useAppSelector(selectChatbotDesign)!;
  const allIssues = useAppSelector(selectChatbotIssues);
  const author = useAppSelector(selectCommentAuthor);
  const readOnly = useAppSelector(selectChatbotsReadOnly);
  const issues = allIssues.filter((issue) => issue.questionId === question.id);
  // Layout only: whether its comments are unfolded
  const [showComments, setShowComments] = useState(openComments(question.comments).length > 0);
  const type = answerTypeOf(design, bot, question.answerType);
  const count = intent.questions.length;
  const set = (change: Partial<ChatbotQuestion>) => dispatch(changeQuestion(bot.id, intent.id, question.id, change));

  return (
    <li className="chatbot-question" id={`question-${question.id}`}>
      <span className="chatbot-step-icon" aria-hidden>
        {index + 1}
      </span>
      <div className="chatbot-question-body">
        <div className="chatbot-question-head">
          <label className="chatbot-slot" title="The name the answer is saved under (the Lex slot)">
            Saved as{' '}
            <input
              type="text"
              value={question.slot}
              aria-label="Saved as"
              disabled={readOnly}
              onChange={(e) =>
                dispatch(renameQuestionSlot(bot.id, intent.id, question.id, e.target.value.replace(/\s/g, '')))
              }
            />
          </label>
          <label className="field-checkbox">
            <input
              type="checkbox"
              checked={question.required}
              disabled={readOnly}
              onChange={(e) => set({ required: e.target.checked })}
            />
            <span>Required</span>
          </label>
          <span className="chatbot-question-actions">
            <CommentsToggle
              comments={question.comments}
              open={showComments}
              label={`Comments on question ${index + 1}`}
              onToggle={() => setShowComments(!showComments)}
            />
            {!readOnly && (
              <>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => dispatch(moveQuestionTo(bot.id, intent.id, index, index - 1))}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Move down"
                  disabled={index === count - 1}
                  onClick={() => dispatch(moveQuestionTo(bot.id, intent.id, index, index + 1))}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remove question"
                  onClick={() => dispatch(removeQuestion(bot.id, intent.id, question.id))}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </span>
        </div>
        {issues.length > 0 && (
          <ul className="chatbot-issues">
            {issues.map((issue) => (
              <li key={issue.key} className={issue.severity}>
                {issue.message.replace(/^.*?question \d+[:]? ?/, '').replace(/^Contact form: /, '')}
              </li>
            ))}
          </ul>
        )}

        <Bubble
          text={question.question}
          label={`Question ${index + 1}`}
          placeholder="What the chatbot asks"
          readOnly={readOnly}
          onChange={(text) => set({ question: text })}
        />

        <div className="chatbot-answers">
          <span className="chatbot-answers-label">
            <MessageSquareText size={13} aria-hidden /> Answers
            <AnswerPicker bot={bot} intent={intent} question={question} />
          </span>
          <AnswerChips type={type} />
        </div>

        {fillsInContact(bot) && <FormFieldsRow question={question} type={type} />}

        <div className="chatbot-retry">
          <span className="chatbot-answers-label">
            <CircleHelp size={13} aria-hidden /> Not understood: asks again
            <input
              type="number"
              min={0}
              max={5}
              value={question.retries}
              aria-label="Times it asks again"
              disabled={readOnly}
              onChange={(e) => set({ retries: Number(e.target.value) })}
            />
            {question.retries === 1 ? 'time' : 'times'}, then says
          </span>
          <Bubble
            tone="retry"
            text={question.failureMessage}
            label={`If question ${index + 1} isn't understood`}
            placeholder="What it says before stopping"
            readOnly={readOnly}
            onChange={(text) => set({ failureMessage: text || undefined })}
          />
        </div>

        {showComments && (
          <CommentThread
            comments={question.comments}
            author={author}
            canEdit={!readOnly}
            placeholder="A comment on this question, for the team and for Claude…"
            onChange={(comments) => set({ comments })}
          />
        )}
      </div>
    </li>
  );
};

// The chatbot and path showing (ChatbotsArea only shows it when there are both)
export const Conversation = () => {
  const dispatch = useAppDispatch();
  const bot = useAppSelector(selectSelectedBot)!;
  const intent = useAppSelector(selectSelectedIntent)!;
  const readOnly = useAppSelector(selectChatbotsReadOnly);
  const change = (changes: Partial<ChatbotIntent>) => dispatch(changeIntent(bot.id, intent.id, changes));
  return (
    <div className="chatbot-conversation" aria-label="Conversation">
      <Utterances intent={intent} readOnly={readOnly} onChange={(utterances) => change({ utterances })} />

      <div className="chatbot-step">
        <span className="chatbot-step-icon greet" aria-hidden>
          <Bot size={14} />
        </span>
        <div className="chatbot-step-body">
          <h4>Greeting</h4>
          <Bubble
            text={intent.opening}
            label="Greeting"
            placeholder="Optional: what the chatbot says first"
            readOnly={readOnly}
            onChange={(text) => change({ opening: text || undefined })}
          />
        </div>
      </div>

      <ol className="chatbot-questions">
        {intent.questions.map((question, index) => (
          <QuestionCard key={question.id} bot={bot} intent={intent} question={question} index={index} />
        ))}
      </ol>
      {!readOnly && (
        <button
          type="button"
          className="secondary-button chatbot-add"
          onClick={() => dispatch(addQuestion(bot.id, intent.id))}
        >
          + Add a question
        </button>
      )}

      <div className="chatbot-step">
        <span className="chatbot-step-icon end" aria-hidden>
          <Flag size={14} />
        </span>
        <div className="chatbot-step-body">
          <h4>Goodbye</h4>
          <Bubble
            tone="end"
            text={intent.closing}
            label="Goodbye"
            placeholder="What the chatbot says at the end"
            readOnly={readOnly}
            onChange={(text) => change({ closing: text || undefined })}
          />
        </div>
      </div>
    </div>
  );
};
