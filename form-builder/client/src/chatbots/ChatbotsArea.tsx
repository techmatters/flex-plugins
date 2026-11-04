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
 * Saved automatically, with the same "someone else changed it" check as boards. What's open, edited
 * and saved, and how, lives in chatbotsSlice.ts.
 */
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bot, CircleAlert, Download, Plus, TriangleAlert } from 'lucide-react';
import type { ChatbotImport } from '@tech-matters/form-builder-shared';
import type { FromBranch } from '@tech-matters/form-builder-shared';
import { BranchPicker, ImportedFrom } from '../common/BranchPicker';
import { Loading } from '../common/Loading';
import type { DesignStatus } from '@tech-matters/form-builder-shared/designStatus';
import { DESIGN_STATUSES } from '@tech-matters/form-builder-shared/designStatus';
import { DesignStatusBadge, DesignStatusPicker } from '../common/DesignStatusPicker';
import { AutoTextarea } from '../common/AutoTextarea';
import { HelplineFilter } from '../common/HelplineFilter';
import type { Chatbot } from '@tech-matters/form-builder-shared/chatbots/model';
import { botLabel, languageLabel } from '@tech-matters/form-builder-shared/chatbots/model';
import type { ChatbotIssue } from './chatbotChecks';
import { openComments } from './edit';
import { botStatusOf, isNewBot } from '@tech-matters/form-builder-shared/chatbots/status';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  applyImport,
  botSelected,
  branchChanged,
  changeBot,
  closeChatbots,
  createChatbot,
  ChatbotsFilter,
  exportForClaude,
  homeCodeChanged,
  homeFilterChanged,
  homeHelplineChanged,
  intentSelected,
  isNewChatbotTaken,
  loadChatbotsList,
  loadImportBranches,
  LOCALES,
  newChatbotClosed,
  newChatbotCopyFromChanged,
  newChatbotLanguageChanged,
  newChatbotLocaleChanged,
  newChatbotNameChanged,
  openChatbots,
  openNewChatbot,
  previewImport,
  reloadChatbots,
  selectChatbotChanges,
  selectChatbotIssues,
  selectChatbots,
  selectChatbotsReadOnly,
  selectCommentAuthor,
  selectHelplineCodes,
  selectSelectedBot,
  selectSelectedIntent,
  setChatbotStatus,
  showIssue,
  startChatbots,
  startFromScratch,
  tabChanged,
} from './chatbotsSlice';
import { selectActingAsStaff } from '../app/sessionSlice';
import { Conversation } from './Conversation';
import { ChatPreview } from './ChatPreview';
import { AnswersPanel } from './AnswersPanel';
import { CommentsToggle, CommentThread } from './Comments';
import './chatbots.css';

// "When they answer Yes" for intents started by a reply; the bot's own name otherwise
const intentLabel = (name: string, utterances: string[], botName: string) => {
  if (name === botName || name === `${botName}_intent`) return botLabel(botName);
  const reply = utterances.find((utterance) => !/^trigger/i.test(utterance));
  return reply ? `When they answer “${reply}”` : botLabel(name);
};

// The flex-plugins branches an import can read
const useLoadBranches = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(loadImportBranches()), [dispatch]);
};

/**
 * A new chatbot: its name, language and Lex locale, empty or as a copy of one of the helpline's
 */
const NewChatbotForm = () => {
  const dispatch = useAppDispatch();
  const { design, newChatbot } = useAppSelector(selectChatbots);
  if (!design || !newChatbot) return null;
  const { name, language, locale, copyFrom } = newChatbot;
  const languages = [...new Set(design.bots.map((bot) => bot.language))];
  const taken = isNewChatbotTaken(design, newChatbot);
  return (
    <form
      className="chatbot-new"
      aria-label="New chatbot"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(createChatbot());
      }}
    >
      <h3>New chatbot</h3>
      <label className="field">
        <span className="field-label">Name</span>
        <input
          type="text"
          value={name}
          aria-label="Chatbot name"
          onChange={(e) => dispatch(newChatbotNameChanged(e.target.value))}
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
          onChange={(e) => dispatch(newChatbotLanguageChanged(e.target.value))}
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
        <select
          value={locale}
          aria-label="Lex locale"
          onChange={(e) => dispatch(newChatbotLocaleChanged(e.target.value))}
        >
          {[...new Set([locale, ...LOCALES])].map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Start from</span>
        <select
          value={copyFrom}
          aria-label="Start from"
          onChange={(e) => dispatch(newChatbotCopyFromChanged(e.target.value))}
        >
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
        <button type="button" className="link-button" onClick={() => dispatch(newChatbotClosed())}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// What the chatbot is for, and the conversation about it
const BotNotes = ({ bot }: { bot: Chatbot }) => {
  const dispatch = useAppDispatch();
  const author = useAppSelector(selectCommentAuthor);
  const readOnly = useAppSelector(selectChatbotsReadOnly);
  // Layout only: whether the comments are unfolded
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
          onChange={(e) => dispatch(changeBot(bot.id, { notes: e.target.value || undefined }))}
        />
      )}
      {showComments && (
        <CommentThread
          comments={bot.comments}
          author={author}
          canEdit={!readOnly}
          onChange={(comments) => dispatch(changeBot(bot.id, { comments }))}
        />
      )}
    </section>
  );
};

const Editor = () => {
  const dispatch = useAppDispatch();
  const { stored, design, saveStatus: status, conflict, tab, newChatbot } = useAppSelector(selectChatbots);
  const staffMode = useAppSelector(selectActingAsStaff);
  const readOnly = useAppSelector(selectChatbotsReadOnly);
  const issues = useAppSelector(selectChatbotIssues);
  const changes = useAppSelector(selectChatbotChanges);
  const bot = useAppSelector(selectSelectedBot);
  const intent = useAppSelector(selectSelectedIntent);
  if (!stored || !design) return null;

  // Shown where it is, then scrolled to once it's there
  const show = (issue: ChatbotIssue) => {
    dispatch(showIssue(issue));
    if (issue.answerType) {
      setTimeout(() => document.getElementById(`answers-${issue.answerType!.name}`)?.scrollIntoView(), 50);
    } else if (issue.botId && issue.questionId) {
      setTimeout(
        () => document.getElementById(`question-${issue.questionId}`)?.scrollIntoView({ block: 'center' }),
        50,
      );
    }
  };

  const errors = issues.filter((issue) => issue.severity === 'error').length;

  return (
    <div className="chatbot-editor">
      <div className="flow-toolbar">
        <button type="button" className="link-button area-back" onClick={() => dispatch(closeChatbots())}>
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
          <button
            type="button"
            className="secondary-button flow-refresh"
            onClick={() => dispatch(exportForClaude())}
          >
            <Download size={15} aria-hidden /> Export for Claude
          </button>
        )}
      </div>
      {status === 'conflict' && (
        <div className="alert alert-error flow-conflict">
          {conflict?.updatedBy ?? 'Someone else'} changed these chatbots
          {conflict?.updatedAt ? ` at ${new Date(conflict.updatedAt).toLocaleTimeString()}` : ''}. Your latest changes
          weren&apos;t saved.{' '}
          <button type="button" className="secondary-button" onClick={() => dispatch(reloadChatbots())}>
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
                onClick={() => dispatch(botSelected(candidate.id))}
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
            <button
              type="button"
              className="secondary-button chatbot-list-add"
              onClick={() => dispatch(openNewChatbot())}
            >
              <Plus size={14} aria-hidden /> New chatbot
            </button>
          )}
        </nav>

        <div className="chatbot-main">
          {newChatbot ? (
            <NewChatbotForm />
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
                    onClick={() => dispatch(tabChanged(value))}
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
                        onChange={(next: DesignStatus) => dispatch(setChatbotStatus(bot.id, next))}
                      />
                    </div>
                    <BotNotes bot={bot} />
                    {bot.intents.length > 1 && (
                      <div className="chatbot-intents" role="tablist" aria-label="Paths">
                        {bot.intents.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            role="tab"
                            aria-selected={candidate.id === intent.id}
                            onClick={() => dispatch(intentSelected(candidate.id))}
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
                    <Conversation />
                  </div>
                  <aside className="chatbot-preview">
                    <ChatPreview />
                  </aside>
                </div>
              )}
              {tab === 'conversation' && !bot && (
                <p className="routing-intro field-hint">
                  {readOnly ? 'No chatbots yet.' : 'No chatbots yet: start one with “New chatbot”.'}
                </p>
              )}
              {tab === 'answers' && <AnswersPanel />}
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

/**
 * The start page: every chatbot this person can see, with its status, and (Aselo staff) adding a
 * helpline's chatbots
 */
const ChatbotsHome = () => {
  const dispatch = useAppDispatch();
  const helplineCodes = useAppSelector(selectHelplineCodes);
  const staffMode = useAppSelector(selectActingAsStaff);
  const { summaries, error, filter, helpline, code } = useAppSelector(selectChatbots).home;

  // Listed again each time the start page shows
  useEffect(() => {
    dispatch(loadChatbotsList());
  }, [dispatch]);

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
          <select value={code} aria-label="Helpline" onChange={(e) => dispatch(homeCodeChanged(e.target.value))}>
            <option value="">Choose…</option>
            {helplineCodes.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate.toUpperCase()}
                {withDesign.has(candidate) ? '' : ' (no design yet)'}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="primary-button"
          disabled={!code}
          onClick={() => dispatch(openChatbots(code))}
        >
          {code && !withDesign.has(code) && staffMode ? 'Start' : 'Open'}
        </button>
      </div>

      {!summaries && !error && <Loading text="Loading chatbots…" />}
      {summaries && allRows.length === 0 && <p>No chatbot designs yet.</p>}
      {allRows.length > 0 && (
        <>
          <div className="area-home-filters">
            <HelplineFilter
              codes={allRows.map((row) => row.summary.code)}
              value={helpline}
              onChange={(value) => dispatch(homeHelplineChanged(value))}
            />
            <div className="area-home-filter" role="group" aria-label="Show">
              {(['all', ...DESIGN_STATUSES.map((status) => status.value)] as ChatbotsFilter[]).map((candidate) => {
                const count =
                  candidate === 'all' ? rows.length : rows.filter((row) => row.bot.status === candidate).length;
                return (
                  <button
                    key={candidate}
                    type="button"
                    className={filter === candidate ? 'active' : ''}
                    aria-pressed={filter === candidate}
                    onClick={() => dispatch(homeFilterChanged(candidate))}
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
                      onClick={() => dispatch(openChatbots(summary.code, bot.id))}
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

export const ChatbotsArea = () => {
  const dispatch = useAppDispatch();
  const staffMode = useAppSelector(selectActingAsStaff);
  const { started, code, stored, error, preview, branch, importing, working } = useAppSelector(selectChatbots);
  const loadBranches = useLoadBranches();

  // The first time it shows (a person with one helpline goes straight to its chatbots)
  useEffect(() => {
    dispatch(startChatbots());
  }, [dispatch]);

  if (!started) return null;
  if (!code) return <ChatbotsHome />;

  const back = () => dispatch(closeChatbots());

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
              <BranchPicker load={loadBranches} value={branch} onChange={(value) => dispatch(branchChanged(value))} />
              <button
                type="button"
                className="link-button"
                disabled={importing}
                onClick={() => dispatch(previewImport())}
              >
                Import again from the live config
              </button>
            </>
          )}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {importing && <Loading text="Reading the live config…" />}
      {stored === undefined && !error && <Loading text={`Loading ${code.toUpperCase()}'s chatbots…`} />}
      {stored === null && !preview && (
        <div className="routing-empty">
          <p>{code.toUpperCase()} has no chatbots design yet.</p>
          {staffMode ? (
            <div className="chatbot-start-options">
              <BranchPicker load={loadBranches} value={branch} onChange={(value) => dispatch(branchChanged(value))} />
              <button
                type="button"
                className="primary-button"
                disabled={working || importing}
                onClick={() => dispatch(previewImport())}
              >
                Import them from the live config
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={working}
                onClick={() => dispatch(startFromScratch())}
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
            dispatch(applyImport());
          }}
        />
      )}
      {stored && !preview && <Editor />}
    </main>
  );
};
