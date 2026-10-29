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
import type { AnswerType, Chatbot, ChatbotDesign, ChatbotIntent, ChatbotQuestion } from './model';
import { answerKindOf, answerTypeOf, BUILTIN_TYPES, builtinInfo, builtinLabel, fillsInContact } from './model';
import {
  addAnswerType,
  moveQuestion,
  newQuestion,
  openComments,
  updateBot,
  updateIntent,
  updateQuestion,
  withBuiltinType,
} from './edit';
import type { ChatbotIssue } from './chatbotChecks';
import type { ContactForms } from './formMappings';
import { renameFormTargets, setFormTargets, targetLabel, unmatchedAnswers } from './formMappings';
import { AutoTextarea } from '../components/AutoTextarea';
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
const AnswerPicker = ({
  design,
  bot,
  question,
  readOnly,
  onPick,
}: {
  design: ChatbotDesign;
  bot: Chatbot;
  question: ChatbotQuestion;
  readOnly: boolean;
  onPick: (design: ChatbotDesign, answerType: string) => void;
}) => {
  const [creating, setCreating] = useState<'list' | 'pattern'>();
  const [name, setName] = useState('');
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
            setCreating(value === NEW_LIST ? 'list' : 'pattern');
            setName(taken(question.slot) ? `${question.slot}Answers` : question.slot);
            return;
          }
          onPick(value.startsWith('AMAZON.') ? withBuiltinType(design, bot.language, value) : design, value);
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
            onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
          />
          <button
            type="button"
            className="secondary-button"
            disabled={!name || taken(name) || name.startsWith('AMAZON.')}
            onClick={() => {
              onPick(addAnswerType(design, bot.language, name, creating), name);
              setCreating(undefined);
            }}
          >
            Create
          </button>
          <button type="button" className="link-button" onClick={() => setCreating(undefined)}>
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
const FormFieldsRow = ({
  design,
  question,
  type,
  forms,
  readOnly,
  onChange,
}: {
  design: ChatbotDesign;
  question: ChatbotQuestion;
  type?: AnswerType;
  forms?: ContactForms;
  readOnly: boolean;
  onChange: (design: ChatbotDesign) => void;
}) => {
  const groups = design.formMappings?.[question.slot] ?? [];
  const targets = groups.flat();
  const set = (next: string[][]) =>
    onChange(
      setFormTargets(
        design,
        question.slot,
        next.filter((group) => group.length > 0),
      ),
    );
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
        {!forms && <span className="field-hint">Loading the contact form…</span>}
      </div>
    </div>
  );
};

const QuestionCard = ({
  design,
  bot,
  intent,
  question,
  index,
  issues,
  forms,
  author,
  readOnly,
  onChange,
}: {
  design: ChatbotDesign;
  bot: Chatbot;
  intent: ChatbotIntent;
  question: ChatbotQuestion;
  index: number;
  issues: ChatbotIssue[];
  forms?: ContactForms;
  author: string;
  readOnly: boolean;
  onChange: (design: ChatbotDesign) => void;
}) => {
  const [showComments, setShowComments] = useState(openComments(question.comments).length > 0);
  const type = answerTypeOf(design, bot, question.answerType);
  const count = intent.questions.length;
  const changeIntent = (base: ChatbotDesign, change: (intent: ChatbotIntent) => ChatbotIntent) =>
    updateBot(base, bot.id, (current) => updateIntent(current, intent.id, change));
  const set = (change: Partial<ChatbotQuestion>, base = design) =>
    onChange(changeIntent(base, (old) => updateQuestion(old, question.id, (current) => ({ ...current, ...change }))));

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
              onChange={(e) => {
                const slot = e.target.value.replace(/\s/g, '');
                const renamed = changeIntent(design, (old) =>
                  updateQuestion(old, question.id, (current) => ({ ...current, slot })),
                );
                onChange(renameFormTargets(renamed, question.slot, slot));
              }}
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
                  onClick={() => onChange(changeIntent(design, (old) => moveQuestion(old, index, index - 1)))}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Move down"
                  disabled={index === count - 1}
                  onClick={() => onChange(changeIntent(design, (old) => moveQuestion(old, index, index + 1)))}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Remove question"
                  onClick={() =>
                    onChange(
                      changeIntent(design, (old) => ({
                        ...old,
                        questions: old.questions.filter((candidate) => candidate.id !== question.id),
                      })),
                    )
                  }
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
            <AnswerPicker
              design={design}
              bot={bot}
              question={question}
              readOnly={readOnly}
              onPick={(base, answerType) => set({ answerType }, base)}
            />
          </span>
          <AnswerChips type={type} />
        </div>

        {fillsInContact(bot) && (
          <FormFieldsRow
            design={design}
            question={question}
            type={type}
            forms={forms}
            readOnly={readOnly}
            onChange={onChange}
          />
        )}

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

export const Conversation = ({
  design,
  bot,
  intent,
  issues,
  forms,
  author,
  readOnly,
  onChange,
}: {
  design: ChatbotDesign;
  bot: Chatbot;
  intent: ChatbotIntent;
  issues: ChatbotIssue[];
  forms?: ContactForms;
  author: string;
  readOnly: boolean;
  onChange: (design: ChatbotDesign) => void;
}) => {
  const changeIntent = (change: (intent: ChatbotIntent) => ChatbotIntent) =>
    onChange(updateBot(design, bot.id, (current) => updateIntent(current, intent.id, change)));
  const defaultType =
    intent.questions[intent.questions.length - 1]?.answerType ??
    Object.keys(design.answerTypes[bot.language] ?? {})[0] ??
    'AMAZON.FreeFormInput';
  return (
    <div className="chatbot-conversation" aria-label="Conversation">
      <Utterances
        intent={intent}
        readOnly={readOnly}
        onChange={(utterances) => changeIntent((old) => ({ ...old, utterances }))}
      />

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
            onChange={(text) => changeIntent((old) => ({ ...old, opening: text || undefined }))}
          />
        </div>
      </div>

      <ol className="chatbot-questions">
        {intent.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            design={design}
            bot={bot}
            intent={intent}
            question={question}
            index={index}
            issues={issues.filter((issue) => issue.questionId === question.id)}
            forms={forms}
            author={author}
            readOnly={readOnly}
            onChange={onChange}
          />
        ))}
      </ol>
      {!readOnly && (
        <button
          type="button"
          className="secondary-button chatbot-add"
          onClick={() => {
            const base = defaultType.startsWith('AMAZON.')
              ? withBuiltinType(design, bot.language, defaultType)
              : design;
            onChange(
              updateBot(base, bot.id, (current) =>
                updateIntent(current, intent.id, (old) => ({
                  ...old,
                  questions: [...old.questions, newQuestion(old, defaultType)],
                })),
              ),
            );
          }}
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
            onChange={(text) => changeIntent((old) => ({ ...old, closing: text || undefined }))}
          />
        </div>
      </div>
    </div>
  );
};
