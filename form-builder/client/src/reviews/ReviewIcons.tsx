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
 * The icons of reviewing forms, the same in the menu, on field cards and in threads: a check per
 * side (blue for the helpline, green for Aselo; a grey dot once what was approved changed) and
 * one per kind of flag.
 */
import { AlertCircle, AlertTriangle, CircleCheck, HelpCircle, MessageCircle } from 'lucide-react';
import type { FlagKind, ReviewSide } from '@tech-matters/form-builder-shared';
import { ApprovalState, FLAG_LABELS, SIDE_LABELS } from './formReviews';

export const ApprovalIcon = ({
  side,
  state,
  size = 14,
}: {
  side: ReviewSide;
  state?: ApprovalState;
  size?: number;
}) => {
  if (!state) return null;
  const label =
    state === 'approved' ? `Approved by ${SIDE_LABELS[side]}` : `Changed since ${SIDE_LABELS[side]} approved it`;
  return (
    <span className={`review-icon approval-${side} approval-${state}`} role="img" aria-label={label} title={label}>
      {state === 'approved' ? <CircleCheck size={size} aria-hidden /> : '●'}
    </span>
  );
};

const FLAG_ICONS: Record<FlagKind, typeof AlertCircle> = {
  question: HelpCircle,
  attention: AlertCircle,
  changes: AlertTriangle,
  note: MessageCircle,
};

export const FlagIcon = ({
  kind,
  answered = false,
  size = 14,
}: {
  kind: FlagKind;
  answered?: boolean;
  size?: number;
}) => {
  const Icon = FLAG_ICONS[kind];
  const label = answered ? `${FLAG_LABELS[kind]} (answered)` : FLAG_LABELS[kind];
  return (
    <span
      className={`review-icon flag-${kind}${answered ? ' flag-answered' : ''}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <Icon size={size} aria-hidden />
    </span>
  );
};
