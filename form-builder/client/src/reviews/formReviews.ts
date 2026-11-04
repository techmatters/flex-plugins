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
 * The builder's side of reviewing forms (the data and its rules are in shared/src/reviews.ts): which
 * forms are reviewed, what each approval and flag is on, and whether an approval still counts.
 *
 * Only forms are reviewed: the contact form tabs and the case sections' forms. An approval
 * keeps a fingerprint of what was approved (the whole form, or one field): once that changes,
 * whoever changes it, the approval shows as "changed since".
 */
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import type { Approval, FlagKind, ReviewSide, ReviewThread } from '@tech-matters/form-builder-shared';
import { approvalKey } from '@tech-matters/form-builder-shared';
import { hashJson } from '../drafts/useDraft';

// The builder's screens that are forms
export type FormView =
  { kind: 'contactTab'; tabKey: string } | { kind: 'caseSection'; sectionKey: string };

export const SIDES: ReviewSide[] = ['helpline', 'aselo'];

export const SIDE_LABELS: Record<ReviewSide, string> = { helpline: 'Helpline', aselo: 'Aselo' };

export const FLAG_LABELS: Record<FlagKind, string> = {
  question: 'Question',
  attention: 'Needs attention',
  changes: 'Needs changes',
  note: 'Note',
};

// Most pressing first, as they're shown in the menu; notes don't get an icon there
const FLAG_ORDER: FlagKind[] = ['changes', 'question', 'attention'];

export const isFormView = (view: { kind: string }): view is FormView =>
  view.kind === 'contactTab' || view.kind === 'caseSection';

export const formTargetOf = (view: FormView) =>
  view.kind === 'contactTab' ? `contactTab:${view.tabKey}` : `caseSection:${view.sectionKey}`;

export const fieldTargetOf = (formTarget: string, fieldName: string) =>
  `${formTarget}#${fieldName}`;

const formOfTarget = (target: string) => target.split('#')[0];

export const formFingerprint = (form: FormItemJsonDefinition[] | undefined) => hashJson(form ?? []);

export const fieldFingerprint = (item: FormItemJsonDefinition) => hashJson(item);

// approved: approved, and unchanged since; changed: approved, then changed
export type ApprovalState = 'approved' | 'changed';

export const approvalOf = (
  approvals: Record<string, Approval> | undefined,
  side: ReviewSide,
  target: string,
) => approvals?.[approvalKey(side, target)];

export const approvalState = (
  approvals: Record<string, Approval> | undefined,
  side: ReviewSide,
  target: string,
  fingerprint: string,
): ApprovalState | undefined => {
  const approval = approvalOf(approvals, side, target);
  if (!approval) return undefined;
  return approval.fingerprint === fingerprint ? 'approved' : 'changed';
};

export const isOpen = (thread: ReviewThread) => !thread.resolvedAt;

// A question someone on the other side has replied to
export const isAnswered = (thread: ReviewThread) =>
  (thread.replies ?? []).some((reply) => reply.side !== thread.side);

export const threadsOn = (threads: ReviewThread[] | undefined, target: string) =>
  (threads ?? []).filter((thread) => thread.target === target);

// Open threads on a form or any of its fields
export const openThreadsInForm = (threads: ReviewThread[] | undefined, formTarget: string) =>
  (threads ?? []).filter((thread) => isOpen(thread) && formOfTarget(thread.target) === formTarget);

// The kinds of open flags, most pressing first (each once), for icons
export const flagKinds = (threads: ReviewThread[]) =>
  FLAG_ORDER.filter((kind) => threads.some((thread) => isOpen(thread) && thread.kind === kind));
