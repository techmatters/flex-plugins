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
 * The answers a chatbot understands, by language. Three kinds (model.ts AnswerKind):
 * - lists: each answer (what's saved) and the other ways of saying it ("1", "yes", "yeah" for Yes)
 * - patterns: anything matching a regular expression (Lex AMAZON.AlphaNumeric + regexFilter), with
 *   ready-made ones and a box to try answers against it
 * - Lex's own types used by the questions (AMAZON.State...), explained
 * Lists, patterns and each answer can carry comments.
 */
import { useState } from 'react';
import { CircleAlert, CircleCheck, ListChecks, Plus, Regex, Sparkles, Trash2 } from 'lucide-react';
import type { AnswerOption, AnswerType, ChatbotDesign } from './model';
import {
  answerKindOf,
  builtinInfo,
  builtinLabel,
  languageLabel,
  matchesPattern,
  PATTERN_PRESETS,
  patternProblem,
} from './model';
import { addAnswerType, removeAnswerType, updateAnswerType } from './edit';
import type { ChatbotIssue } from './chatbotChecks';
import { CommentsToggle, CommentThread } from './Comments';

// Typed freely, comma-separated; the list is updated when the box is left
const SynonymsInput = ({
  synonyms,
  label,
  readOnly,
  onCommit,
}: {
  synonyms: string[];
  label: string;
  readOnly: boolean;
  onCommit: (synonyms: string[]) => void;
}) => {
  const joined = synonyms.join(', ');
  const [text, setText] = useState(joined);
  const [editing, setEditing] = useState(false);
  const shown = editing ? text : joined;
  return (
    <textarea
      value={shown}
      rows={Math.min(4, Math.max(1, Math.ceil(shown.length / 70)))}
      aria-label={label}
      placeholder="Separate them with commas"
      disabled={readOnly}
      onFocus={() => {
        setText(joined);
        setEditing(true);
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const next = text
          .split(',')
          .map((said) => said.trim())
          .filter(Boolean);
        if (next.join(', ') !== joined) onCommit(next);
      }}
    />
  );
};

const PatternEditor = ({
  type,
  readOnly,
  onChange,
}: {
  type: AnswerType;
  readOnly: boolean;
  onChange: (type: AnswerType) => void;
}) => {
  const [tryText, setTryText] = useState('');
  const pattern = type.pattern ?? '';
  const problem = patternProblem(pattern);
  const preset = PATTERN_PRESETS.find((candidate) => candidate.pattern === pattern);
  return (
    <div className="chatbot-pattern">
      <label className="field">
        <span className="field-label">Answers must match</span>
        <span className="chatbot-pattern-row">
          <select
            value={preset?.pattern ?? ''}
            aria-label="Ready-made patterns"
            disabled={readOnly}
            onChange={(e) => e.target.value && onChange({ ...type, pattern: e.target.value })}
          >
            <option value="">{preset ? preset.label : 'A pattern of my own'}</option>
            {PATTERN_PRESETS.map((candidate) => (
              <option key={candidate.pattern} value={candidate.pattern}>
                {candidate.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="chatbot-pattern-input"
            value={pattern}
            aria-label={`Pattern for ${type.name}`}
            disabled={readOnly}
            spellCheck={false}
            onChange={(e) => onChange({ ...type, pattern: e.target.value })}
          />
        </span>
      </label>
      {problem ? (
        <p className="chatbot-pattern-problem">
          <CircleAlert size={13} aria-hidden /> {problem}
        </p>
      ) : (
        <p className="field-hint">
          Lex keeps the answer as typed (up to 30 characters) when the whole answer matches; otherwise it asks again.
          Patterns take letters, digits, [classes] and repeats with a maximum, e.g. {'{1,30}'}.
        </p>
      )}
      <label className="chatbot-pattern-try">
        Try an answer{' '}
        <input type="text" value={tryText} aria-label="Try an answer" onChange={(e) => setTryText(e.target.value)} />
        {tryText &&
          (matchesPattern(pattern, tryText) ? (
            <span className="chatbot-pattern-yes">
              <CircleCheck size={13} aria-hidden /> Understood
            </span>
          ) : (
            <span className="chatbot-pattern-no">
              <CircleAlert size={13} aria-hidden /> Asked again
            </span>
          ))}
      </label>
    </div>
  );
};

const ValueRow = ({
  option,
  index,
  author,
  readOnly,
  onChange,
  onRemove,
}: {
  option: AnswerOption;
  index: number;
  author: string;
  readOnly: boolean;
  onChange: (option: AnswerOption) => void;
  onRemove: () => void;
}) => {
  const [showComments, setShowComments] = useState(false);
  return (
    <>
      <tr>
        <td>
          <input
            type="text"
            value={option.value}
            aria-label={`Answer ${index + 1}`}
            disabled={readOnly}
            onChange={(e) => onChange({ ...option, value: e.target.value })}
          />
        </td>
        <td>
          <SynonymsInput
            synonyms={option.synonyms}
            label={`Ways to say ${option.value}`}
            readOnly={readOnly}
            onCommit={(synonyms) => onChange({ ...option, synonyms })}
          />
        </td>
        <td className="chatbot-values-actions">
          <CommentsToggle
            comments={option.comments}
            open={showComments}
            label={`Comments on ${option.value}`}
            onToggle={() => setShowComments(!showComments)}
          />
          {!readOnly && (
            <button type="button" className="icon-button" aria-label={`Remove ${option.value}`} onClick={onRemove}>
              <Trash2 size={14} />
            </button>
          )}
        </td>
      </tr>
      {showComments && (
        <tr className="chatbot-values-comments">
          <td colSpan={3}>
            <CommentThread
              comments={option.comments}
              author={author}
              canEdit={!readOnly}
              placeholder={`A comment on “${option.value}”…`}
              onChange={(comments) => onChange({ ...option, comments })}
            />
          </td>
        </tr>
      )}
    </>
  );
};

const AnswerTypeCard = ({
  type,
  usedBy,
  issues,
  author,
  readOnly,
  onChange,
  onRemove,
}: {
  type: AnswerType;
  usedBy: string[];
  issues: ChatbotIssue[];
  author: string;
  readOnly: boolean;
  onChange: (type: AnswerType) => void;
  onRemove: () => void;
}) => {
  const [newValue, setNewValue] = useState('');
  const [showComments, setShowComments] = useState((type.comments ?? []).some((comment) => !comment.resolved));
  const kind = answerKindOf(type);
  return (
    <li className={`chatbot-type-card ${kind}`} id={`answers-${type.name}`}>
      <div className="chatbot-type-head">
        <span className={`chatbot-kind ${kind}`}>
          {kind === 'pattern' ? <Regex size={12} aria-hidden /> : <ListChecks size={12} aria-hidden />}
          {kind === 'pattern' ? 'Pattern' : 'List'}
        </span>
        <strong>{type.name}</strong>
        {type.file ? (
          <code className="field-hint" title={type.shared ? 'Shared by other helplines' : undefined}>
            {type.file}
            {type.shared ? ' (shared: changes go to a copy of the helpline’s own)' : ''}
          </code>
        ) : (
          <span className="field-hint">New: written to the helpline&apos;s own folder</span>
        )}
        <span className="chatbot-type-actions">
          <CommentsToggle
            comments={type.comments}
            open={showComments}
            label={`Comments on ${type.name}`}
            onToggle={() => setShowComments(!showComments)}
          />
          {!readOnly && usedBy.length === 0 && !type.file && (
            <button type="button" className="icon-button" aria-label={`Remove ${type.name}`} onClick={onRemove}>
              <Trash2 size={14} />
            </button>
          )}
        </span>
      </div>
      <p className="field-hint">{usedBy.length > 0 ? `Asked in: ${usedBy.join(', ')}` : 'Not used by any question'}</p>
      {issues.length > 0 && (
        <ul className="chatbot-issues">
          {issues.map((issue) => (
            <li key={issue.key} className={issue.severity}>
              {issue.message.replace(/^Answers “[^”]*” \([^)]*\)(: | )/, '')}
            </li>
          ))}
        </ul>
      )}
      {showComments && (
        <CommentThread
          comments={type.comments}
          author={author}
          canEdit={!readOnly}
          placeholder={`A comment on ${type.name}, for the team and for Claude…`}
          onChange={(comments) => onChange({ ...type, comments })}
        />
      )}
      {kind === 'pattern' && <PatternEditor type={type} readOnly={readOnly} onChange={onChange} />}
      {kind === 'list' && (
        <>
          <table className="chatbot-values">
            <thead>
              <tr>
                <th>Answer (what&apos;s saved)</th>
                <th>Also understood when the contact says</th>
                <th aria-label="Comments and remove" />
              </tr>
            </thead>
            <tbody>
              {type.values.map((option, index) => (
                <ValueRow
                  key={index}
                  option={option}
                  index={index}
                  author={author}
                  readOnly={readOnly}
                  onChange={(changed) =>
                    onChange({
                      ...type,
                      values: type.values.map((candidate, i) => (i === index ? changed : candidate)),
                    })
                  }
                  onRemove={() => onChange({ ...type, values: type.values.filter((_, i) => i !== index) })}
                />
              ))}
            </tbody>
          </table>
          {!readOnly && (
            <div className="routing-add">
              <input
                type="text"
                value={newValue}
                placeholder="New answer"
                aria-label={`New answer for ${type.name}`}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button
                type="button"
                className="secondary-button"
                disabled={!newValue.trim()}
                onClick={() => {
                  onChange({ ...type, values: [...type.values, { value: newValue.trim(), synonyms: [] }] });
                  setNewValue('');
                }}
              >
                <Plus size={14} aria-hidden /> Add
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
};

export const AnswersPanel = ({
  design,
  issues,
  author,
  readOnly,
  onChange,
}: {
  design: ChatbotDesign;
  issues: ChatbotIssue[];
  author: string;
  readOnly: boolean;
  onChange: (design: ChatbotDesign) => void;
}) => {
  const [newType, setNewType] = useState<Record<string, string>>({});
  const [newKind, setNewKind] = useState<Record<string, 'list' | 'pattern'>>({});
  const usedBy = (language: string, name: string) =>
    design.bots
      .filter((bot) => bot.language === language)
      .flatMap((bot) =>
        bot.intents.flatMap((intent) =>
          intent.questions.filter((question) => question.answerType === name).map((question) => question.slot),
        ),
      );
  const languages = [...new Set([...design.bots.map((bot) => bot.language), ...Object.keys(design.answerTypes)])];
  return (
    <div className="chatbot-panel" role="region" aria-label="Answers">
      <p className="field-hint">
        The answers each question understands. A <strong>list</strong> saves the answer in the first column (what the
        counselor sees) whichever way the contact says it; a <strong>pattern</strong> saves what they wrote when it
        matches; <strong>Lex&apos;s own</strong> types understand things like a US state or a number. New lists and
        patterns are written to the helpline&apos;s own folder.
      </p>
      {languages.map((language) => {
        const types = design.answerTypes[language] ?? {};
        const own = Object.values(types)
          .filter((type) => !type.builtin)
          .sort((a, b) => a.name.localeCompare(b.name));
        const builtins = Object.values(types).filter((type) => type.builtin);
        const name = newType[language] ?? '';
        return (
          <section key={language}>
            <h3>{languageLabel(language)}</h3>
            {builtins.length > 0 && (
              <ul className="chatbot-builtins">
                {builtins.map((type) => {
                  const info = builtinInfo(type.name);
                  return (
                    <li key={type.name}>
                      <span className="chatbot-kind builtin">
                        <Sparkles size={12} aria-hidden /> Lex&apos;s own
                      </span>
                      <strong>Any {builtinLabel(type.name)}</strong> <code>{type.name}</code>
                      {info && (
                        <span className="field-hint">
                          {' '}
                          saves {info.saves}, e.g. “{info.example}”
                        </span>
                      )}
                      <span className="field-hint">
                        {' '}
                        · Asked in: {usedBy(language, type.name).join(', ') || 'nothing'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <ul className="chatbot-type-list">
              {own.map((type) => (
                <AnswerTypeCard
                  key={type.name}
                  type={type}
                  usedBy={usedBy(language, type.name)}
                  issues={issues.filter(
                    (issue) => issue.answerType?.language === language && issue.answerType.name === type.name,
                  )}
                  author={author}
                  readOnly={readOnly}
                  onChange={(changed) => onChange(updateAnswerType(design, language, type.name, () => changed))}
                  onRemove={() => onChange(removeAnswerType(design, language, type.name))}
                />
              ))}
            </ul>
            {!readOnly && (
              <div className="routing-add">
                <select
                  value={newKind[language] ?? 'list'}
                  aria-label={`Kind of answers (${language})`}
                  onChange={(e) => setNewKind({ ...newKind, [language]: e.target.value as 'list' | 'pattern' })}
                >
                  <option value="list">New list of answers</option>
                  <option value="pattern">New pattern</option>
                </select>
                <input
                  type="text"
                  value={name}
                  placeholder="Its name, e.g. contactReason"
                  aria-label={`New list of answers (${language})`}
                  onChange={(e) => setNewType({ ...newType, [language]: e.target.value.replace(/\s/g, '') })}
                />
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!name || Boolean(types[name]) || name.startsWith('AMAZON.')}
                  onClick={() => {
                    onChange(addAnswerType(design, language, name, newKind[language] ?? 'list'));
                    setNewType({ ...newType, [language]: '' });
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
