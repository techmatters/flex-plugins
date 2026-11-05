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
 * Reviewing a draft's forms, kept in the draft's metadata (see drafts.ts):
 *
 * - Approvals, one per side: the helpline (what the form should say) and Aselo (whether it's
 *   technically right), on a whole form or on one of its fields. Each keeps a fingerprint of what
 *   was approved: once that changes, the approval no longer counts (client/src/reviews/formReviews.ts).
 * - Threads: a flag on a form or field (a question, something needing attention, a change needed,
 *   or a note) with its replies, for someone. Its icon shows until the thread is resolved.
 * - A log of who did what, when.
 *
 * Targets: a form (`contactTab:CallerInformationTab`, `caseSection:note`) or one of its fields
 * (`contactTab:CallerInformationTab#firstName`).
 */
import type { ApiUser } from './api';

export type ReviewSide = 'helpline' | 'aselo';

export type Approval = { side: ReviewSide; by: string; at: string; fingerprint: string };

export type FlagKind = 'question' | 'attention' | 'changes' | 'note';
export const FLAG_KINDS: FlagKind[] = ['question', 'attention', 'changes', 'note'];

export type ThreadMessage = {
  id: string;
  text: string;
  author: string;
  side: ReviewSide;
  at: string;
};

export type ReviewThread = ThreadMessage & {
  target: string;
  kind: FlagKind;
  // Who should act on it (from the people lists, see people.ts)
  assignee?: string;
  assigneeEmail?: string;
  replies?: ThreadMessage[];
  resolvedBy?: string;
  resolvedAt?: string;
};

export type ReviewAction = 'approved' | 'unapproved' | 'flagged' | 'replied' | 'resolved' | 'reopened' | 'deleted';

export type ReviewLogEntry = {
  at: string;
  by: string;
  side: ReviewSide;
  action: ReviewAction;
  target: string;
  kind?: FlagKind;
};

export type DraftReview = {
  // By approvalKey(side, target)
  approvals?: Record<string, Approval>;
  threads?: ReviewThread[];
  reviewLog?: ReviewLogEntry[];
};

export const approvalKey = (side: ReviewSide, target: string) => `${side}|${target}`;

export const sideOf = (user: ApiUser): ReviewSide => (user.role === 'aselo-staff' ? 'aselo' : 'helpline');

const TARGET_PATTERN = /^(contactTab|caseSection):[A-Za-z0-9_-]{1,100}(#[A-Za-z0-9_-]{1,100})?$/;
const FINGERPRINT_PATTERN = /^[0-9a-f]{1,16}$/;
const MAX_TEXT_LENGTH = 5000;
const MAX_THREADS = 500;
const MAX_REPLIES = 100;
const MAX_LOG_ENTRIES = 2000;

export const isValidTarget = (target: unknown): target is string =>
  typeof target === 'string' && TARGET_PATTERN.test(target);

type Actor = { name: string; side: ReviewSide; isStaff: boolean };
type Outcome = { ok: true; review: DraftReview } | { ok: false; status: number; message: string };

const failed = (status: number, message: string): Outcome => ({ ok: false, status, message });

const withLog = (review: DraftReview, entry: ReviewLogEntry): DraftReview => ({
  ...review,
  reviewLog: [...(review.reviewLog ?? []), entry].slice(-MAX_LOG_ENTRIES),
});

const validText = (text: unknown): text is string =>
  typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TEXT_LENGTH;

// Approve a target for the actor's side (with the fingerprint of what they saw), or take the
// approval back (fingerprint null)
export const applyApproval = (review: DraftReview, body: unknown, actor: Actor, now: string): Outcome => {
  const { target, fingerprint } = (body ?? {}) as { target?: unknown; fingerprint?: unknown };
  if (!isValidTarget(target)) return failed(400, 'Invalid form or field');
  if (fingerprint !== null && (typeof fingerprint !== 'string' || !FINGERPRINT_PATTERN.test(fingerprint))) {
    return failed(400, 'Invalid fingerprint');
  }
  const key = approvalKey(actor.side, target);
  const { [key]: _previous, ...others } = review.approvals ?? {};
  const approvals =
    fingerprint === null ? others : { ...others, [key]: { side: actor.side, by: actor.name, at: now, fingerprint } };
  return {
    ok: true,
    review: withLog(
      { ...review, approvals },
      {
        at: now,
        by: actor.name,
        side: actor.side,
        action: fingerprint === null ? 'unapproved' : 'approved',
        target,
      },
    ),
  };
};

// Flag a target (a new thread), reply to a thread, resolve or reopen it, or delete it (its
// author, or Aselo staff)
// eslint-disable-next-line complexity
export const applyThreadChange = (
  review: DraftReview,
  body: unknown,
  actor: Actor,
  now: string,
  newId: () => string,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Outcome => {
  const change = (body ?? {}) as Record<string, unknown>;
  const threads = review.threads ?? [];
  const log = (action: ReviewAction, target: string, kind?: FlagKind) => ({
    at: now,
    by: actor.name,
    side: actor.side,
    action,
    target,
    ...(kind ? { kind } : {}),
  });

  if (change.action === 'add') {
    const { target, kind, text, assignee, assigneeEmail } = change;
    if (!isValidTarget(target)) return failed(400, 'Invalid form or field');
    if (!FLAG_KINDS.includes(kind as FlagKind)) return failed(400, 'Invalid kind of flag');
    if (!validText(text)) return failed(400, `A comment needs text, up to ${MAX_TEXT_LENGTH} characters.`);
    if (assignee !== undefined && (typeof assignee !== 'string' || !assignee.trim() || assignee.length > 200)) {
      return failed(400, 'Invalid assignee');
    }
    if (assigneeEmail !== undefined && (typeof assigneeEmail !== 'string' || assigneeEmail.length > 200)) {
      return failed(400, 'Invalid assignee email');
    }
    if (threads.length >= MAX_THREADS) return failed(400, 'This draft has too many comments.');
    const thread: ReviewThread = {
      id: newId(),
      target,
      kind: kind as FlagKind,
      text: text.trim(),
      author: actor.name,
      side: actor.side,
      at: now,
      ...(assignee ? { assignee: assignee.trim() } : {}),
      ...(assignee && assigneeEmail ? { assigneeEmail } : {}),
    };
    return {
      ok: true,
      review: withLog({ ...review, threads: [...threads, thread] }, log('flagged', target, thread.kind)),
    };
  }

  const thread = threads.find(candidate => candidate.id === change.id);
  if (!thread) return failed(404, 'No such comment');
  const replace = (next: ReviewThread | undefined) =>
    // eslint-disable-next-line no-nested-ternary
    threads.flatMap(candidate => (candidate === thread ? (next ? [next] : []) : [candidate]));

  if (change.action === 'reply') {
    if (!validText(change.text)) return failed(400, `A reply needs text, up to ${MAX_TEXT_LENGTH} characters.`);
    if ((thread.replies ?? []).length >= MAX_REPLIES) return failed(400, 'This comment has too many replies.');
    const reply: ThreadMessage = {
      id: newId(),
      text: change.text.trim(),
      author: actor.name,
      side: actor.side,
      at: now,
    };
    let next: ReviewThread = { ...thread, replies: [...(thread.replies ?? []), reply] };
    let reviewed = withLog({ ...review, threads: replace(next) }, log('replied', thread.target, thread.kind));
    // "Answer and resolve": e.g. Aselo answers a helpline's question, which takes its icon away
    if (change.resolve === true) {
      next = { ...next, resolvedBy: actor.name, resolvedAt: now };
      reviewed = withLog({ ...reviewed, threads: replace(next) }, log('resolved', thread.target, thread.kind));
    }
    return { ok: true, review: reviewed };
  }

  if (change.action === 'resolve') {
    const { resolvedBy: _by, resolvedAt: _at, ...open } = thread;
    const next = change.resolved === true ? { ...open, resolvedBy: actor.name, resolvedAt: now } : open;
    return {
      ok: true,
      review: withLog(
        { ...review, threads: replace(next) },
        log(change.resolved === true ? 'resolved' : 'reopened', thread.target, thread.kind),
      ),
    };
  }

  if (change.action === 'delete') {
    if (!actor.isStaff && thread.author !== actor.name) {
      return failed(403, 'Only its author or Aselo staff can delete a comment.');
    }
    return {
      ok: true,
      review: withLog({ ...review, threads: replace(undefined) }, log('deleted', thread.target, thread.kind)),
    };
  }

  return failed(400, 'Unknown comment action');
};
