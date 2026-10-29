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
 * The Chatbots area (docs/chatbot-designer.md). The start page lists every chatbot this person can
 * see, with its status; opening one shows the helpline's chatbots, each as a conversation to read
 * and change, with a phone preview that plays it. Aselo staff import them from the live config or
 * start from scratch, change them, comment and set each one's status; helpline staff see them.
 * Saved automatically, with the same "someone else changed it" check as boards.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bot, CircleAlert, Download, Plus, TriangleAlert } from 'lucide-react';
import type { ChatbotImport } from '../../server/chatbotImport';
import type { FromBranch } from '../../server/branches';
import { BranchPicker, ImportedFrom } from '../components/BranchPicker';
import type { DesignStatus } from '../designStatus';
import { DESIGN_STATUSES } from '../designStatus';
import { DesignStatusBadge, DesignStatusPicker } from '../components/DesignStatusPicker';
import { AutoTextarea } from '../components/AutoTextarea';
import { HelplineFilter } from '../components/HelplineFilter';
import type { Chatbot, ChatbotDesign, ChatbotsSummary, StoredChatbots } from './model';
import { botLabel, emptyChatbots, languageLabel } from './model';
import { ChatbotClient, httpChatbotClient } from './chatbotClient';
import { chatbotChecks, ChatbotIssue } from './chatbotChecks';
import { chatbotChanges } from './changes';
import { addChatbot, openComments, updateBot } from './edit';
import type { ContactForms } from './formMappings';
import { botStatusOf, isNewBot, setBotStatus, withStatusUpdates } from './status';
import { Conversation } from './Conversation';
import { ChatPreview } from './ChatPreview';
import { AnswersPanel } from './AnswersPanel';
import { CommentsToggle, CommentThread } from './Comments';
import './chatbots.css';

type Props = {
  client?: ChatbotClient;
  helplineCodes: string[];
  staffMode: boolean;
  // Who's writing comments
  userName?: string;
};

type Tab = 'conversation' | 'answers' | 'check';

const AUTOSAVE_DELAY_MS = 1200;

// Lex V2 locales a chatbot can be in (the ones Aselo's languages need)
const LOCALES = [
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
  ({ en: 'en_US', es: 'es_US', pt: 'pt_BR', fr: 'fr_FR' })[language.slice(0, 2).toLowerCase()] ?? 'en_US';

const download = (fileName: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// "When they answer Yes" for intents started by a reply; the bot's own name otherwise
const intentLabel = (name: string, utterances: string[], botName: string) => {
  if (name === botName || name === `${botName}_intent`) return botLabel(botName);
  const reply = utterances.find((utterance) => !/^trigger/i.test(utterance));
  return reply ? `When they answer “${reply}”` : botLabel(name);
};

/**
 * A new chatbot: its name, language and Lex locale, empty or as a copy of one of the helpline's
 */
const NewChatbotForm = ({
  design,
  onCreate,
  onCancel,
}: {
  design: ChatbotDesign;
  onCreate: (design: ChatbotDesign, bot: Chatbot) => void;
  onCancel: () => void;
}) => {
  const languages = [...new Set(design.bots.map((bot) => bot.language))];
  const [name, setName] = useState('pre_survey');
  const [language, setLanguage] = useState(languages[0] ?? `en_${design.helpline.toUpperCase()}`);
  const [locale, setLocale] = useState(localeFor(language));
  const [copyFrom, setCopyFrom] = useState('');
  const taken = design.bots.some((bot) => bot.language === language && bot.name === name);
  return (
    <form
      className="chatbot-new"
      aria-label="New chatbot"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name || taken) return;
        const added = addChatbot(design, {
          name,
          language,
          locale,
          copyFrom: design.bots.find((bot) => bot.id === copyFrom),
        });
        onCreate(added.design, added.bot);
      }}
    >
      <h3>New chatbot</h3>
      <label className="field">
        <span className="field-label">Name</span>
        <input
          type="text"
          value={name}
          aria-label="Chatbot name"
          onChange={(e) => setName(e.target.value.replace(/[^0-9A-Za-z_-]/g, '_'))}
        />
        <span className="field-hint">As Lex calls it, e.g. pre_survey, post_survey, language_selector</span>
      </label>
      <label className="field">
        <span className="field-label">Language</span>
        <input
          type="text"
          value={language}
          list="chatbot-languages"
          aria-label="Chatbot language"
          onChange={(e) => {
            setLanguage(e.target.value.replace(/\s/g, ''));
            setLocale(localeFor(e.target.value));
          }}
        />
        <datalist id="chatbot-languages">
          {languages.map((candidate) => (
            <option key={candidate} value={candidate} />
          ))}
        </datalist>
        <span className="field-hint">The configs folder and lex_v2_bot_languages key, e.g. en_USNM</span>
      </label>
      <label className="field">
        <span className="field-label">Lex locale</span>
        <select value={locale} aria-label="Lex locale" onChange={(e) => setLocale(e.target.value)}>
          {[...new Set([locale, ...LOCALES])].map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Start from</span>
        <select value={copyFrom} aria-label="Start from" onChange={(e) => setCopyFrom(e.target.value)}>
          <option value="">An empty chatbot</option>
          {design.bots.map((bot) => (
            <option key={bot.id} value={bot.id}>
              A copy of {botLabel(bot.name)} ({bot.language})
            </option>
          ))}
        </select>
      </label>
      {taken && (
        <p className="field-hint">
          There&apos;s already a chatbot called {name} in {language}.
        </p>
      )}
      <div className="chatbot-new-actions">
        <button type="submit" className="primary-button" disabled={!name || !language || taken}>
          Create
        </button>
        <button type="button" className="link-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// What the chatbot is for, and the conversation about it
const BotNotes = ({
  bot,
  author,
  readOnly,
  onChange,
}: {
  bot: Chatbot;
  author: string;
  readOnly: boolean;
  onChange: (bot: Chatbot) => void;
}) => {
  const [showComments, setShowComments] = useState(openComments(bot.comments).length > 0);
  return (
    <section className="chatbot-notes" aria-label="About this chatbot">
      <div className="chatbot-notes-head">
        <h4>About this chatbot</h4>
        <CommentsToggle
          comments={bot.comments}
          open={showComments}
          label={`Comments on ${botLabel(bot.name)}`}
          onToggle={() => setShowComments(!showComments)}
        />
      </div>
      {readOnly ? (
        <p className="chatbot-notes-text">{bot.notes || bot.description || 'No notes yet.'}</p>
      ) : (
        <AutoTextarea
          value={bot.notes ?? ''}
          aria-label="Notes about this chatbot"
          placeholder="What it's for, who it talks to, where it starts (which flow and channel), anything Claude should know…"
          onChange={(e) => onChange({ ...bot, notes: e.target.value || undefined })}
        />
      )}
      {showComments && (
        <CommentThread
          comments={bot.comments}
          author={author}
          canEdit={!readOnly}
          onChange={(comments) => onChange({ ...bot, comments })}
        />
      )}
    </section>
  );
};

const Editor = ({
  stored,
  client,
  staffMode,
  author,
  initialBotId,
  onReload,
  onBack,
}: {
  stored: StoredChatbots;
  client: ChatbotClient;
  staffMode: boolean;
  author: string;
  initialBotId?: string;
  onReload: () => void;
  onBack: () => void;
}) => {
  const [design, setDesign] = useState(stored.design);
  const [botId, setBotId] = useState(initialBotId ?? design.bots[0]?.id);
  const [intentId, setIntentId] = useState<string>();
  const [tab, setTab] = useState<Tab>('conversation');
  const [creating, setCreating] = useState(false);
  const [forms, setForms] = useState<ContactForms>();
  const issues = useMemo(() => chatbotChecks(design, forms), [design, forms]);
  // For now helpline staff see the chatbots without changing them
  const readOnly = !staffMode;

  // Every change goes through here: the chatbots it changed are In progress again
  const change = useCallback((next: ChatbotDesign) => setDesign((previous) => withStatusUpdates(previous, next)), []);

  // The contact form, for the fields answers fill in; designs saved before those were kept take them from it
  useEffect(() => {
    let cancelled = false;
    client
      .contactForms(stored.code, stored.design.formsVersion)
      .then((found) => {
        if (cancelled || !found) return;
        setForms(found);
        setDesign((current) =>
          current.formMappings !== undefined || readOnly
            ? current
            : {
                ...current,
                formMappings: found.survey,
                formsVersion: found.version,
                imported: {
                  ...(current.imported ?? { bots: [], answerTypes: {} }),
                  formMappings: found.survey,
                },
              },
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [client, stored.code, stored.design.formsVersion, readOnly]);

  // ----- Saving
  const json = useMemo(() => JSON.stringify(design), [design]);
  const revision = useRef(stored.meta.revision);
  const savedJson = useRef(JSON.stringify(stored.design));
  const latest = useRef(json);
  latest.current = json;
  const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving' | 'conflict' | 'error'>('saved');
  const [conflict, setConflict] = useState<{ updatedBy?: string; updatedAt?: string }>();
  const stopped = useRef(false);

  const save = useCallback(async () => {
    if (stopped.current || latest.current === savedJson.current) return;
    const toSave = latest.current;
    setStatus('saving');
    try {
      const outcome = await client.save(stored.code, revision.current, JSON.parse(toSave));
      if (outcome.ok) {
        revision.current = outcome.meta.revision;
        savedJson.current = toSave;
        setStatus(latest.current === toSave ? 'saved' : 'unsaved');
      } else {
        stopped.current = true;
        setConflict(outcome.conflict);
        setStatus('conflict');
      }
    } catch {
      setStatus('error');
    }
  }, [client, stored.code]);

  useEffect(() => {
    if (readOnly || stopped.current || json === savedJson.current) return undefined;
    setStatus('unsaved');
    const timer = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [json, save, readOnly]);

  const bot = design.bots.find((candidate) => candidate.id === botId) ?? design.bots[0];
  const intent = bot?.intents.find((candidate) => candidate.id === intentId) ?? bot?.intents[0];
  const changes = useMemo(() => chatbotChanges(design), [design]);

  const show = (issue: ChatbotIssue) => {
    if (issue.answerType) {
      setTab('answers');
      setTimeout(() => document.getElementById(`answers-${issue.answerType!.name}`)?.scrollIntoView(), 50);
      return;
    }
    if (issue.botId) {
      setBotId(issue.botId);
      const target = design.bots.find((candidate) => candidate.id === issue.botId);
      const owner = target?.intents.find((candidate) =>
        candidate.questions.some((question) => question.id === issue.questionId),
      );
      if (owner) setIntentId(owner.id);
      setTab('conversation');
      if (issue.questionId) {
        setTimeout(
          () => document.getElementById(`question-${issue.questionId}`)?.scrollIntoView({ block: 'center' }),
          50,
        );
      }
    }
  };

  const exportForClaude = () => {
    const { imported, ...current } = design;
    const bots = design.bots.map((candidate) => ({
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
          changes,
          checks: issues.map(({ severity, message }) => ({ severity, message })),
          design: current,
          hasImport: Boolean(imported),
        },
        null,
        2,
      )}\n`,
    );
  };

  const errors = issues.filter((issue) => issue.severity === 'error').length;

  return (
    <div className="chatbot-editor">
      <div className="flow-toolbar">
        <button type="button" className="link-button area-back" onClick={onBack}>
          <ArrowLeft size={14} aria-hidden /> All chatbots
        </button>
        <h2>Chatbots · {stored.code.toUpperCase()}</h2>
        <span className={`flow-save-state ${status}`} role="status">
          {readOnly
            ? 'View only'
            : {
                saved: 'All changes saved',
                unsaved: 'Unsaved changes…',
                saving: 'Saving…',
                conflict: 'Not saved',
                error: 'Could not save',
              }[status]}
        </span>
        {staffMode && changes.length > 0 && (
          <span className="field-hint">
            {changes.length} change{changes.length === 1 ? '' : 's'} since the import
          </span>
        )}
        {staffMode && (
          <button type="button" className="secondary-button flow-refresh" onClick={exportForClaude}>
            <Download size={15} aria-hidden /> Export for Claude
          </button>
        )}
      </div>
      {status === 'conflict' && (
        <div className="alert alert-error flow-conflict">
          {conflict?.updatedBy ?? 'Someone else'} changed these chatbots
          {conflict?.updatedAt ? ` at ${new Date(conflict.updatedAt).toLocaleTimeString()}` : ''}. Your latest changes
          weren&apos;t saved.{' '}
          <button type="button" className="secondary-button" onClick={onReload}>
            Reload
          </button>
        </div>
      )}

      <div className="chatbot-layout">
        <nav className="chatbot-list" aria-label="Chatbots">
          {design.bots.map((candidate) => {
            const count = candidate.intents.reduce((total, item) => total + item.questions.length, 0);
            const botIssues = issues.filter((issue) => issue.botId === candidate.id);
            return (
              <button
                key={candidate.id}
                type="button"
                className={`chatbot-list-item ${candidate.id === bot?.id ? 'active' : ''}`}
                aria-pressed={candidate.id === bot?.id}
                onClick={() => {
                  setBotId(candidate.id);
                  setIntentId(undefined);
                  setTab('conversation');
                  setCreating(false);
                }}
              >
                <span className="chatbot-list-icon" aria-hidden>
                  <Bot size={16} />
                </span>
                <span className="chatbot-list-text">
                  <strong>{botLabel(candidate.name)}</strong>
                  <span>{languageLabel(candidate.language)}</span>
                  <span className="chatbot-list-meta">
                    {count} question{count === 1 ? '' : 's'}
                    {candidate.environments.map((environment) => (
                      <span key={environment} className={`flow-env-badge ${environment}`}>
                        {environment === 'production' ? 'Production' : 'Staging'}
                      </span>
                    ))}
                    {botIssues.some((issue) => issue.severity === 'error') && (
                      <CircleAlert size={13} className="chatbot-list-error" aria-label="Has errors" />
                    )}
                  </span>
                  <DesignStatusBadge status={botStatusOf(design, candidate)} isNew={isNewBot(design, candidate)} />
                </span>
              </button>
            );
          })}
          {design.bots.length === 0 && <p className="field-hint">No chatbots yet.</p>}
          {!readOnly && (
            <button type="button" className="secondary-button chatbot-list-add" onClick={() => setCreating(true)}>
              <Plus size={14} aria-hidden /> New chatbot
            </button>
          )}
        </nav>

        <div className="chatbot-main">
          {creating ? (
            <NewChatbotForm
              design={design}
              onCancel={() => setCreating(false)}
              onCreate={(next, created) => {
                setDesign(next);
                setBotId(created.id);
                setIntentId(undefined);
                setTab('conversation');
                setCreating(false);
              }}
            />
          ) : (
            <>
              <div className="routing-tabs" role="tablist">
                {(
                  [
                    ['conversation', 'Conversation'],
                    ['answers', 'Answers'],
                    ['check', `Check${issues.length ? ` (${issues.length})` : ''}`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={tab === value}
                    className={value === 'check' && errors > 0 ? 'has-errors' : ''}
                    onClick={() => setTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'conversation' && bot && intent && (
                <div className="chatbot-workspace">
                  <div className="chatbot-script">
                    <div className="chatbot-bot-head">
                      <h3>
                        {botLabel(bot.name)} <span className="field-hint">{languageLabel(bot.language)}</span>
                      </h3>
                      <DesignStatusPicker
                        status={botStatusOf(design, bot)}
                        isNew={isNewBot(design, bot)}
                        editable={!readOnly}
                        label={`Status of ${botLabel(bot.name)}`}
                        onChange={(next: DesignStatus) => setDesign(setBotStatus(design, bot.id, next))}
                      />
                    </div>
                    <BotNotes
                      bot={bot}
                      author={author}
                      readOnly={readOnly}
                      onChange={(changed) => change(updateBot(design, bot.id, () => changed))}
                    />
                    {bot.intents.length > 1 && (
                      <div className="chatbot-intents" role="tablist" aria-label="Paths">
                        {bot.intents.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            role="tab"
                            aria-selected={candidate.id === intent.id}
                            onClick={() => setIntentId(candidate.id)}
                          >
                            {intentLabel(candidate.name, candidate.utterances, bot.name)}
                            <span className="chatbot-chip-count">{candidate.questions.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {intent.shared && (
                      <p className="alert alert-info">
                        Other helplines share this chatbot&apos;s files ({intent.file}): changes are written to copies
                        of this helpline&apos;s own.
                      </p>
                    )}
                    <Conversation
                      design={design}
                      bot={bot}
                      intent={intent}
                      issues={issues}
                      forms={forms}
                      author={author}
                      readOnly={readOnly}
                      onChange={change}
                    />
                  </div>
                  <aside className="chatbot-preview">
                    <ChatPreview design={design} bot={bot} intent={intent} />
                  </aside>
                </div>
              )}
              {tab === 'conversation' && !bot && (
                <p className="routing-intro field-hint">
                  {readOnly ? 'No chatbots yet.' : 'No chatbots yet: start one with “New chatbot”.'}
                </p>
              )}
              {tab === 'answers' && (
                <AnswersPanel design={design} issues={issues} author={author} readOnly={readOnly} onChange={change} />
              )}
              {tab === 'check' && (
                <div className="chatbot-panel" role="region" aria-label="Check">
                  <p className="flow-check-summary">
                    {issues.length === 0 ? 'Nothing to fix.' : `${errors} errors, ${issues.length - errors} warnings`}
                  </p>
                  <ul className="flow-issue-list">
                    {issues.map((issue) => (
                      <li key={issue.key} className={`flow-issue ${issue.severity}`}>
                        <span className="flow-issue-icon">
                          {issue.severity === 'error' ? <CircleAlert size={15} /> : <TriangleAlert size={15} />}
                        </span>
                        <button type="button" className="link-button flow-issue-message" onClick={() => show(issue)}>
                          {issue.message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ImportPreview = ({ preview, onUse }: { preview: ChatbotImport & FromBranch; onUse: () => void }) => (
  <div className="flows-import-preview" role="region" aria-label="Chatbots import preview">
    <h4>Found in the live config</h4>
    <ImportedFrom source={preview.source} />
    <ul>
      {preview.report.bots.map((found) => (
        <li key={`${found.language}/${found.name}`}>
          <strong>{botLabel(found.name)}</strong> · {languageLabel(found.language)}: {found.questions} questions (
          {found.environments.join(', ')}) <span className="field-hint">{found.file}</span>
        </li>
      ))}
    </ul>
    {preview.report.notes.length > 0 && (
      <ul className="flows-import-notes">
        {preview.report.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    )}
    <button type="button" className="primary-button" onClick={onUse} disabled={preview.report.bots.length === 0}>
      Use these as the chatbots design
    </button>
  </div>
);

type Filter = 'all' | DesignStatus;

/**
 * The start page: every chatbot this person can see, with its status, and (Aselo staff) adding a
 * helpline's chatbots
 */
const ChatbotsHome = ({
  client,
  helplineCodes,
  staffMode,
  onOpen,
}: {
  client: ChatbotClient;
  helplineCodes: string[];
  staffMode: boolean;
  onOpen: (code: string, botId?: string) => void;
}) => {
  const [summaries, setSummaries] = useState<ChatbotsSummary[]>();
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<Filter>('all');
  const [helpline, setHelpline] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    client
      .list()
      .then(setSummaries)
      .catch((err: Error) => setError(err.message));
  }, [client]);

  const allRows = (summaries ?? []).flatMap((summary) => summary.bots.map((bot) => ({ summary, bot })));
  const rows = allRows.filter((row) => !helpline || row.summary.code === helpline);
  const shown = rows.filter((row) => filter === 'all' || row.bot.status === filter);
  const withDesign = new Set((summaries ?? []).map((summary) => summary.code));

  return (
    <main className="area-home chatbots-home">
      <h2>Chatbots</h2>
      <p className="field-hint area-home-intro">
        The chatbots contacts talk to before (and after) a counselor: what they ask, the answers they understand, and
        the contact form fields they fill in.
      </p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="area-home-actions">
        <label className="field">
          <span className="field-label">Open a helpline&apos;s chatbots</span>
          <select value={code} aria-label="Helpline" onChange={(e) => setCode(e.target.value)}>
            <option value="">Choose…</option>
            {helplineCodes.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate.toUpperCase()}
                {withDesign.has(candidate) ? '' : ' (no design yet)'}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="primary-button" disabled={!code} onClick={() => onOpen(code)}>
          {code && !withDesign.has(code) && staffMode ? 'Start' : 'Open'}
        </button>
      </div>

      {!summaries && !error && <p>Loading chatbots…</p>}
      {summaries && allRows.length === 0 && <p>No chatbot designs yet.</p>}
      {allRows.length > 0 && (
        <>
          <div className="area-home-filters">
            <HelplineFilter codes={allRows.map((row) => row.summary.code)} value={helpline} onChange={setHelpline} />
            <div className="area-home-filter" role="group" aria-label="Show">
              {(['all', ...DESIGN_STATUSES.map((status) => status.value)] as Filter[]).map((candidate) => {
                const count =
                  candidate === 'all' ? rows.length : rows.filter((row) => row.bot.status === candidate).length;
                return (
                  <button
                    key={candidate}
                    type="button"
                    className={filter === candidate ? 'active' : ''}
                    aria-pressed={filter === candidate}
                    onClick={() => setFilter(candidate)}
                  >
                    {candidate === 'all' ? 'All' : DESIGN_STATUSES.find((status) => status.value === candidate)?.label}{' '}
                    ({count})
                  </button>
                );
              })}
            </div>
          </div>
          <table className="area-home-table">
            <thead>
              <tr>
                <th>Helpline</th>
                <th>Chatbot</th>
                <th>Language</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Live in</th>
                <th>Last change</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {shown.map(({ summary, bot }) => (
                <tr key={`${summary.code}-${bot.id}`}>
                  <td>{summary.code.toUpperCase()}</td>
                  <td className="area-home-name">{botLabel(bot.name)}</td>
                  <td>{languageLabel(bot.language)}</td>
                  <td>{bot.questions}</td>
                  <td>
                    <DesignStatusBadge status={bot.status} isNew={bot.isNew} />
                  </td>
                  <td>
                    {bot.environments.length === 0
                      ? '–'
                      : bot.environments.map((environment) => (
                          <span key={environment} className={`flow-env-badge ${environment}`}>
                            {environment === 'production' ? 'Production' : 'Staging'}
                          </span>
                        ))}
                  </td>
                  <td>
                    {summary.meta.updatedBy}, {new Date(summary.meta.updatedAt).toLocaleString()}
                  </td>
                  <td className="area-home-open">
                    <button
                      type="button"
                      className="secondary-button"
                      aria-label={`Open ${summary.code.toUpperCase()} ${botLabel(bot.name)} (${bot.language})`}
                      onClick={() => onOpen(summary.code, bot.id)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
};

export const ChatbotsArea = ({ client = httpChatbotClient, helplineCodes, staffMode, userName = 'Someone' }: Props) => {
  const [code, setCode] = useState(helplineCodes.length === 1 ? helplineCodes[0] : '');
  const [botId, setBotId] = useState<string>();
  const [stored, setStored] = useState<StoredChatbots | null>();
  const [error, setError] = useState<string>();
  const [preview, setPreview] = useState<ChatbotImport & FromBranch>();
  const [branch, setBranch] = useState('');
  const [loadCount, setLoadCount] = useState(0);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setStored(undefined);
    setPreview(undefined);
    setError(undefined);
    if (!code) return;
    client
      .load(code)
      .then((found) => setStored(found ?? null))
      .catch((err: Error) => setError(err.message));
  }, [client, code, loadCount]);

  const previewImport = async () => {
    setError(undefined);
    try {
      setPreview(await client.previewImport(code, branch));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Saves a design (imported, or empty to start from scratch) over the one there is now, if any
  const create = async (design: ChatbotDesign) => {
    setWorking(true);
    try {
      const current = await client.load(code);
      const outcome = await client.save(code, current?.meta.revision ?? 0, design);
      if (!outcome.ok)
        throw new Error(`${outcome.conflict.updatedBy ?? 'Someone else'} just saved chatbots for ${code}: reload.`);
      setLoadCount((count) => count + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const back = () => {
    setCode('');
    setBotId(undefined);
  };

  if (!code) {
    return (
      <ChatbotsHome
        client={client}
        helplineCodes={helplineCodes}
        staffMode={staffMode}
        onOpen={(openCode, openBotId) => {
          setBotId(openBotId);
          setCode(openCode);
        }}
      />
    );
  }

  return (
    <main className="routing-area chatbots-area">
      {(stored === null || preview || (staffMode && stored)) && (
        <div className="routing-pick">
          {(stored === null || preview) && (
            <button type="button" className="link-button area-back" onClick={back}>
              <ArrowLeft size={14} aria-hidden /> All chatbots
            </button>
          )}
          {staffMode && stored && !preview && (
            <>
              <BranchPicker load={client.branches} value={branch} onChange={setBranch} />
              <button type="button" className="link-button" onClick={previewImport}>
                Import again from the live config
              </button>
            </>
          )}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {stored === null && !preview && (
        <div className="routing-empty">
          <p>{code.toUpperCase()} has no chatbots design yet.</p>
          {staffMode ? (
            <div className="chatbot-start-options">
              <BranchPicker load={client.branches} value={branch} onChange={setBranch} />
              <button type="button" className="primary-button" disabled={working} onClick={previewImport}>
                Import them from the live config
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={working}
                onClick={() => create(emptyChatbots(code))}
              >
                Start from scratch
              </button>
            </div>
          ) : (
            <p className="field-hint">The Aselo team adds them.</p>
          )}
        </div>
      )}
      {preview && (
        <ImportPreview
          preview={preview}
          onUse={() => {
            // eslint-disable-next-line no-alert
            if (stored && !window.confirm(`Replace ${code.toUpperCase()}'s chatbots with the ones in the live config?`))
              return;
            setPreview(undefined);
            create(preview.source ? { ...preview.design, importedFrom: preview.source } : preview.design);
          }}
        />
      )}
      {stored && !preview && (
        <Editor
          key={`${code}-${stored.meta.revision}-${loadCount}`}
          stored={stored}
          client={client}
          staffMode={staffMode}
          author={userName}
          initialBotId={botId}
          onReload={() => setLoadCount((count) => count + 1)}
          onBack={back}
        />
      )}
    </main>
  );
};
