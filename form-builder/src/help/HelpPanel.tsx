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
 * The help panel, opened from "Help" in the top bar: the guides and common questions of the area
 * the person is in, and a box to ask a question in their own words (search.ts finds the answer).
 * It stays open beside the builder, so a guide's steps can be followed while working. Questions
 * it can't answer can be sent to the Aselo team, who write the answers.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CircleHelp,
  Inbox,
  ListChecks,
  MousePointerClick,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import type { HelpArea, HelpArticle } from './articles';
import { articleBySlug, HELP_ARTICLES, visibleTo } from './articles';
import { searchHelp } from './search';
import { HelpMarkdown } from './HelpMarkdown';
import { SentQuestions } from './SentQuestions';
import type { HelpClient, HelpQuestion } from './helpClient';
import { httpHelpClient } from './helpClient';
import './help.css';

export const HELP_AREA_LABELS: Record<HelpArea, string> = {
  forms: 'Forms',
  flows: 'Contact flows',
  routing: 'Routing',
  chatbots: 'Chatbots',
  general: 'Getting started',
};

type Props = {
  area: HelpArea;
  isAseloStaff: boolean;
  onClose: () => void;
  client?: HelpClient;
  articles?: HelpArticle[];
  // An article to show, e.g. from a section's "Need help?" (a new one each time it's asked for)
  request?: { slug: string; at: number };
  // Starts a guide's "Show me" tour (optional: without it, tours aren't offered)
  onStartTour?: (article: HelpArticle) => void;
};

const KIND_TITLES = {
  guide: 'Guides, step by step',
  section: 'About each section',
  answer: 'Common questions',
};

type View = { kind: 'home' } | { kind: 'article'; slug: string } | { kind: 'sent' } | { kind: 'questions' };

const ArticleLink = ({ article, onOpen }: { article: HelpArticle; onOpen: (slug: string) => void }) => (
  <li>
    <button type="button" className="help-article-link" onClick={() => onOpen(article.slug)}>
      {article.kind === 'guide' ? <ListChecks size={15} aria-hidden /> : <BookOpen size={15} aria-hidden />}
      <span>{article.title}</span>
      {article.audience === 'aselo' && <span className="help-badge">Aselo staff</span>}
    </button>
  </li>
);

export const HelpPanel = ({
  area,
  isAseloStaff,
  onClose,
  client = httpHelpClient,
  articles = HELP_ARTICLES,
  request,
  onStartTour,
}: Props) => {
  const [query, setQuery] = useState('');
  // What's searched: the query once typing pauses
  const [searched, setSearched] = useState('');
  const [view, setView] = useState<View>(request ? { kind: 'article', slug: request.slug } : { kind: 'home' });
  const [feedback, setFeedback] = useState<'yes' | 'no'>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const [questions, setQuestions] = useState<HelpQuestion[]>();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!request) searchRef.current?.focus();
    // (Only when it opens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!request) return;
    setQuery('');
    setSearched('');
    setFeedback(undefined);
    setView({ kind: 'article', slug: request.slug });
  }, [request]);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearched(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const visible = articles.filter((article) => visibleTo(article, isAseloStaff));
  const ofArea = visible.filter((article) => article.area === area);
  const general = visible.filter((article) => article.area === 'general');
  const { results, confident } = useMemo(
    () =>
      searched
        ? searchHelp(searched, { area, isAseloStaff, articles: articles === HELP_ARTICLES ? undefined : articles })
        : { results: [], confident: false },
    [searched, area, isAseloStaff, articles],
  );
  const answered = confident && results.length > 0;

  const open = (slug: string) => {
    setFeedback(undefined);
    setView({ kind: 'article', slug });
  };
  const send = async (reason: 'unanswered' | 'notHelpful', article?: string) => {
    setSending(true);
    setError(undefined);
    try {
      await client.send({ question: query.trim() || articleBySlug(article ?? '')?.title || '', area, reason, article });
      setView({ kind: 'sent' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };
  const loadQuestions = () =>
    client
      .list()
      .then(setQuestions)
      .catch((err: Error) => setError(err.message));
  const showQuestions = () => {
    setView({ kind: 'questions' });
    loadQuestions();
  };
  // Aselo staff: how many were sent, next to the link
  useEffect(() => {
    if (isAseloStaff) client.list().then(setQuestions, () => undefined);
  }, [isAseloStaff, client]);

  const article = view.kind === 'article' ? articles.find((candidate) => candidate.slug === view.slug) : undefined;
  const back = (
    <button type="button" className="link-button help-back" onClick={() => setView({ kind: 'home' })}>
      <ArrowLeft size={14} aria-hidden /> {searched ? 'Back to the answers' : 'All help'}
    </button>
  );

  return (
    <aside className="help-panel" aria-label="Help">
      <div className="help-panel-head">
        <CircleHelp size={18} aria-hidden />
        <h2>Help</h2>
        <span className="help-area">{HELP_AREA_LABELS[area]}</span>
        <button type="button" className="help-close" aria-label="Close help" onClick={onClose}>
          <X size={16} aria-hidden />
        </button>
      </div>

      <form
        className="help-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(query.trim());
          setView({ kind: 'home' });
        }}
      >
        <Search size={15} aria-hidden />
        <input
          ref={searchRef}
          type="search"
          value={query}
          aria-label="Ask a question"
          placeholder="Ask a question, e.g. how do I send my changes?"
          onChange={(e) => {
            setQuery(e.target.value);
            if (view.kind !== 'questions') setView({ kind: 'home' });
          }}
        />
      </form>

      <div className="help-panel-body">
        {error && <p className="issue issue-error">{error}</p>}

        {article && (
          <article className="help-article">
            {back}
            <h3>{article.title}</h3>
            {article.audience === 'aselo' && <span className="help-badge">For Aselo staff</span>}
            {article.tour && onStartTour && <ShowMe article={article} onStartTour={onStartTour} />}
            <HelpMarkdown source={article.body} onOpenArticle={open} steps={article.kind === 'guide'} />
            <div className="help-feedback">
              {feedback === 'yes' && <p>Glad it helped.</p>}
              {feedback === 'no' && (
                <div className="help-unanswered">
                  <p>Sorry about that. Send your question to the Aselo team and they’ll add an answer.</p>
                  <PrivacyNote />
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={sending}
                    onClick={() => send('notHelpful', article.slug)}
                  >
                    <Send size={14} aria-hidden /> Send {query.trim() ? `“${query.trim()}”` : 'it'} to the Aselo team
                  </button>
                </div>
              )}
              {!feedback && (
                <>
                  <span>Did this help?</span>
                  <button type="button" className="help-feedback-button" onClick={() => setFeedback('yes')}>
                    <ThumbsUp size={14} aria-hidden /> Yes
                  </button>
                  <button type="button" className="help-feedback-button" onClick={() => setFeedback('no')}>
                    <ThumbsDown size={14} aria-hidden /> No
                  </button>
                </>
              )}
            </div>
          </article>
        )}

        {view.kind === 'sent' && (
          <div className="help-sent">
            {back}
            <p>
              <strong>Thanks, it’s been sent.</strong> The Aselo team reads these questions and adds the answers here.
            </p>
            <p>
              If you need an answer now, email <a href="mailto:support@aselo.org">support@aselo.org</a> (with URGENT in
              the subject only if counselors are affected).
            </p>
          </div>
        )}

        {view.kind === 'questions' && (
          <div className="help-questions">
            {back}
            <h3>Questions sent to the Aselo team</h3>
            <p className="field-hint">
              The last three months’, those asked most first. Add each to its closest article as another way of asking,
              or write a new article when nothing is close.
            </p>
            {!questions && !error && <p className="field-hint">Loading…</p>}
            {questions && <SentQuestions questions={questions} areaLabels={HELP_AREA_LABELS} onOpenArticle={open} />}
          </div>
        )}

        {view.kind === 'home' && searched && (
          <div className="help-results" aria-live="polite">
            {answered ? (
              <>
                <div className="help-best">
                  <p className="help-section-title">Best answer</p>
                  <h3>{results[0].article.title}</h3>
                  <HelpMarkdown source={results[0].article.summary} onOpenArticle={open} />
                  <div className="help-best-actions">
                    <button type="button" className="secondary-button" onClick={() => open(results[0].article.slug)}>
                      {results[0].article.kind === 'guide' ? 'Open the guide' : 'Read all of it'}
                    </button>
                    {results[0].article.tour && onStartTour && (
                      <ShowMe article={results[0].article} onStartTour={onStartTour} />
                    )}
                  </div>
                </div>
                {results.length > 1 && (
                  <>
                    <p className="help-section-title">Also related</p>
                    <ul className="help-list">
                      {results.slice(1).map(({ article: related }) => (
                        <ArticleLink key={related.slug} article={related} onOpen={open} />
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <div className="help-unanswered">
                <p>
                  <strong>I couldn’t find an answer to that yet.</strong>
                  {results.length > 0 && ' These might be related:'}
                </p>
                {results.length > 0 && (
                  <ul className="help-list">
                    {results.map(({ article: related }) => (
                      <ArticleLink key={related.slug} article={related} onOpen={open} />
                    ))}
                  </ul>
                )}
                <p>Send your question to the Aselo team and they’ll add an answer.</p>
                <PrivacyNote />
                <button
                  type="button"
                  className="secondary-button"
                  disabled={sending}
                  onClick={() => send('unanswered')}
                >
                  <Send size={14} aria-hidden /> Send it to the Aselo team
                </button>
              </div>
            )}
          </div>
        )}

        {view.kind === 'home' && !searched && (
          <>
            {ofArea.length === 0 && area !== 'general' && (
              <p className="field-hint">
                Help for {HELP_AREA_LABELS[area]} is on its way.
                {area === 'flows' && ' Meanwhile, the (i) on each step says what it does.'}
              </p>
            )}
            {(['guide', 'section', 'answer'] as const).map((kind) => {
              const list = ofArea.filter((candidate) => candidate.kind === kind);
              return (
                list.length > 0 && (
                  <section key={kind}>
                    <p className="help-section-title">{KIND_TITLES[kind]}</p>
                    <ul className="help-list">
                      {list.map((candidate) => (
                        <ArticleLink key={candidate.slug} article={candidate} onOpen={open} />
                      ))}
                    </ul>
                  </section>
                )
              );
            })}
            {general.length > 0 && area !== 'general' && (
              <section>
                <p className="help-section-title">{HELP_AREA_LABELS.general}</p>
                <ul className="help-list">
                  {general.map((candidate) => (
                    <ArticleLink key={candidate.slug} article={candidate} onOpen={open} />
                  ))}
                </ul>
              </section>
            )}
            {isAseloStaff && (
              <button type="button" className="link-button help-staff-link" onClick={showQuestions}>
                <Inbox size={14} aria-hidden /> Questions sent to the Aselo team
                {questions && questions.length > 0 && <span className="help-count">{questions.length}</span>}
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

// A guide's tour, offered and never started by itself
const ShowMe = ({ article, onStartTour }: { article: HelpArticle; onStartTour: (article: HelpArticle) => void }) => (
  <button
    type="button"
    className="help-show-me"
    title="Highlights each step on the page, one at a time. You can stop whenever you like."
    onClick={() => onStartTour(article)}
  >
    <MousePointerClick size={14} aria-hidden /> Show me on the page
  </button>
);

const PrivacyNote = () => (
  <p className="field-hint">
    Only the question is sent, with your name. Please don’t include names or personal details of anyone who contacted
    your helpline.
  </p>
);
