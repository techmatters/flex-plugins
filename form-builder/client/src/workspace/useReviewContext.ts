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
 * What the review panels and icons need (reviews/ReviewPanel.tsx), from the store: the forms'
 * review is kept in the draft (both sides see it), and each person approves for their own side.
 * Undefined until the saved draft has loaded.
 */
import type { ReviewSide } from '@tech-matters/form-builder-shared';

import { useAppSelector } from '../app/store';
import { selectActingAsStaff, selectUser } from '../app/sessionSlice';
import { selectDraft } from '../drafts/draftSlice';
import type { ReviewContext } from '../reviews/ReviewPanel';
import { selectPeople } from './workspaceSlice';

export const useReviewContext = (): ReviewContext | undefined => {
  const { saveState, meta } = useAppSelector(selectDraft);
  const userName = useAppSelector(selectUser)?.name ?? '';
  // Aselo staff (unless viewing as helpline staff) approve for Aselo
  const canApply = useAppSelector(selectActingAsStaff);
  const people = useAppSelector(selectPeople);
  if (saveState === 'loading') return undefined;
  const side: ReviewSide = canApply ? 'aselo' : 'helpline';
  return {
    approvals: meta?.approvals,
    threads: meta?.threads,
    userName,
    side,
    isAseloStaff: canApply,
    people,
  };
};
