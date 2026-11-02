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
 * Reviewing one form, or one of its fields: both sides' approvals (each person approves for
 * their own side) and the flags on it, each a thread: a question, something needing attention,
 * a change needed, or a note, for someone, with replies. A flag's icon shows until its thread is
 * resolved; "Reply and resolve" answers and closes it in one go.
 */
import { useState } from 'react';
import { Check, Trash2, Undo2 } from 'lucide-react';
import type { Approval, FlagKind, ReviewSide, ReviewThread } from '../../server/reviews';
import { FLAG_KINDS } from '../../server/reviews';
import type { ThreadChange } from '../draftClient';
import type { Person } from '../flows/model';
import {
  approvalOf,
  approvalState,
  FLAG_LABELS,
  isAnswered,
  isOpen,
  SIDE_LABELS,
  SIDES,
  threadsOn,
} from '../formReviews';
import { AutoTextarea } from './AutoTextarea';
import { ApprovalIcon, FlagIcon } from './ReviewIcons';

const personKey = (person: Person) => person.email ?? person.name;
const personLabel = (person: Person) =>
  person.email ? `${person.name} (${person.email})` : person.name;

const when = (at: string) =>
  new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export type ReviewContext = {
  approvals?: Record<string, Approval>;
  threads?: ReviewThread[];
  // The signed-in person, and the side they approve for
  userName: string;
  side: ReviewSide;
  isAseloStaff: boolean;
  people: Person[];
  onApprove: (target: string, fingerprint: string | null) => Promise<void>;
  onThread: (change: ThreadChange) => Promise<void>;
};

// Runs a review change, keeping track of it being saved and of errors
const useSaving = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const run = async (save: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await save();
      return true;
    } catch (err) {
      setError(`Couldn't save: ${(err as Error).message}`);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
};

const Approvals = ({
  review,
  target,
  fingerprint,
  what,
}: {
  review: ReviewContext;
  target: string;
  fingerprint: string;
  // "form" or "field", for the buttons
  what: string;
}) => {
  const { busy, error, run } = useSaving();
  return (
    <div className="review-approvals">
      {SIDES.map((side) => {
        const approval = approvalOf(review.approvals, side, target);
        const state = approvalState(review.approvals, side, target, fingerprint);
        const mine = side === review.side;
        return (
          <div key={side} className={`review-approval review-approval-${side}`}>
            <ApprovalIcon side={side} state={state} />
            <span>
              {SIDE_LABELS[side]}:{' '}
              {approval
                ? `${state === 'approved' ? 'approved' : 'changed since approved'} by ${approval.by}, ${when(approval.at)}`
                : 'not approved yet'}
            </span>
            {mine && state !== 'approved' && (
              <button
                type="button"
                className="secondary-button"
                disabled={busy}
                onClick={() => run(() => review.onApprove(target, fingerprint))}
              >
                {state === 'changed' ? `Approve ${what} again` : `Approve ${what}`}
              </button>
            )}
            {mine && approval && (
              <button
                type="button"
                className="link-button"
                disabled={busy}
                onClick={() => run(() => review.onApprove(target, null))}
              >
                Undo
              </button>
            )}
          </div>
        );
      })}
      {error && <p className="issue issue-error">{error}</p>}
    </div>
  );
};

const Thread = ({ review, thread }: { review: ReviewContext; thread: ReviewThread }) => {
  const [reply, setReply] = useState('');
  const { busy, error, run } = useSaving();
  const open = isOpen(thread);
  const sendReply = async (resolve: boolean) => {
    if (
      await run(() =>
        review.onThread({ action: 'reply', id: thread.id, text: reply.trim(), resolve }),
      )
    )
      setReply('');
  };
  return (
    <li className={open ? 'review-thread' : 'review-thread resolved'}>
      <div className="review-thread-head">
        <FlagIcon kind={thread.kind} answered={thread.kind === 'question' && isAnswered(thread)} />
        <strong>{FLAG_LABELS[thread.kind]}</strong>
        <span>
          {thread.author} <span className="muted">({SIDE_LABELS[thread.side]})</span>
        </span>
        <span className="muted">{when(thread.at)}</span>
        {thread.assignee && <span className="review-thread-for">For {thread.assignee}</span>}
        {!open && (
          <span className="muted">
            Resolved by {thread.resolvedBy}, {when(thread.resolvedAt!)}
          </span>
        )}
        <span className="review-thread-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={open ? 'Resolve' : 'Reopen'}
            title={open ? 'Resolve' : 'Reopen'}
            disabled={busy}
            onClick={() =>
              run(() => review.onThread({ action: 'resolve', id: thread.id, resolved: open }))
            }
          >
            {open ? <Check size={13} /> : <Undo2 size={13} />}
          </button>
          {(review.isAseloStaff || thread.author === review.userName) && (
            <button
              type="button"
              className="icon-button"
              aria-label="Delete comment"
              title="Delete"
              disabled={busy}
              onClick={() => run(() => review.onThread({ action: 'delete', id: thread.id }))}
            >
              <Trash2 size={13} />
            </button>
          )}
        </span>
      </div>
      <p>{thread.text}</p>
      {(thread.replies ?? []).map((message) => (
        <div key={message.id} className="review-reply">
          <div className="review-thread-head">
            <span>
              {message.author} <span className="muted">({SIDE_LABELS[message.side]})</span>
            </span>
            <span className="muted">{when(message.at)}</span>
          </div>
          <p>{message.text}</p>
        </div>
      ))}
      {open && (
        <div className="review-reply-add">
          <AutoTextarea
            value={reply}
            placeholder={thread.kind === 'question' ? 'Answer…' : 'Reply…'}
            aria-label="Reply"
            onChange={(e) => setReply(e.target.value)}
          />
          <button
            type="button"
            className="secondary-button"
            disabled={busy || !reply.trim()}
            onClick={() => sendReply(false)}
          >
            Reply
          </button>
          <button
            type="button"
            className="link-button"
            disabled={busy || !reply.trim()}
            onClick={() => sendReply(true)}
          >
            Reply and resolve
          </button>
        </div>
      )}
      {error && <p className="issue issue-error">{error}</p>}
    </li>
  );
};

const NewFlag = ({ review, target }: { review: ReviewContext; target: string }) => {
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<FlagKind>(review.side === 'helpline' ? 'question' : 'changes');
  const [text, setText] = useState('');
  const [assigneeKey, setAssigneeKey] = useState('');
  const { busy, error, run } = useSaving();

  if (!adding) {
    return (
      <button type="button" className="link-button" onClick={() => setAdding(true)}>
        + Flag or comment
      </button>
    );
  }
  const add = async () => {
    const assignee = review.people.find((person) => personKey(person) === assigneeKey);
    const added = await run(() =>
      review.onThread({
        action: 'add',
        target,
        kind,
        text: text.trim(),
        ...(assignee
          ? {
              assignee: assignee.name,
              ...(assignee.email ? { assigneeEmail: assignee.email } : {}),
            }
          : {}),
      }),
    );
    if (added) {
      setText('');
      setAssigneeKey('');
      setAdding(false);
    }
  };
  return (
    <form
      className="review-flag-add"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) add();
      }}
    >
      <label className="review-flag-field">
        <span>Kind</span>
        <select value={kind} onChange={(e) => setKind(e.target.value as FlagKind)}>
          {FLAG_KINDS.map((option) => (
            <option key={option} value={option}>
              {FLAG_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
      <label className="review-flag-field">
        <span>For</span>
        <select value={assigneeKey} onChange={(e) => setAssigneeKey(e.target.value)}>
          <option value="">No one in particular</option>
          {review.people.map((person) => (
            <option key={personKey(person)} value={personKey(person)}>
              {personLabel(person)}
            </option>
          ))}
        </select>
      </label>
      <AutoTextarea
        value={text}
        placeholder={kind === 'question' ? 'Your question…' : 'What should change, or why…'}
        aria-label="New comment"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
        }}
      />
      <div className="review-flag-buttons">
        <button type="submit" className="secondary-button" disabled={busy || !text.trim()}>
          Add
        </button>
        <button type="button" className="link-button" onClick={() => setAdding(false)}>
          Cancel
        </button>
      </div>
      {error && <p className="issue issue-error">{error}</p>}
    </form>
  );
};

export const ReviewPanel = ({
  review,
  target,
  fingerprint,
  what,
  title,
}: {
  review: ReviewContext;
  target: string;
  fingerprint: string;
  what: 'form' | 'field';
  title: string;
}) => {
  const [showResolved, setShowResolved] = useState(false);
  const threads = threadsOn(review.threads, target);
  const resolved = threads.filter((thread) => !isOpen(thread));
  const shown = threads.filter((thread) => isOpen(thread) || showResolved);
  return (
    <section className="review-panel" aria-label={title}>
      <h3>{title}</h3>
      <Approvals review={review} target={target} fingerprint={fingerprint} what={what} />
      {shown.length > 0 && (
        <ul className="review-threads">
          {shown.map((thread) => (
            <Thread key={thread.id} review={review} thread={thread} />
          ))}
        </ul>
      )}
      {resolved.length > 0 && (
        <button
          type="button"
          className="link-button"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? 'Hide resolved' : `Show ${resolved.length} resolved`}
        </button>
      )}
      <NewFlag key={target} review={review} target={target} />
    </section>
  );
};
