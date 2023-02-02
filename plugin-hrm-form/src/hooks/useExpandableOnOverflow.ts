/**
 * Copyright (C) 2021-2023 Technology Matters
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

import React from 'react';

import { useIsOverflowing } from './useIsOverflowing';

export const useExpandableOnOverflow = ({ callback }: { callback?: (isOverflowing: boolean) => void }) => {
  const overflowingRef = React.useRef();
  const isOverflowing = useIsOverflowing(overflowingRef, callback);
  const [isExpanded, setExpanded] = React.useState(false);
  const expandButtonElementRef = React.useRef<HTMLButtonElement>(undefined);
  const collapseButtonElementRef = React.useRef<HTMLButtonElement>(undefined);

  const handleExpand = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
  };

  React.useEffect(() => {
    if (isExpanded) {
      collapseButtonElementRef.current?.focus();
    } else {
      expandButtonElementRef.current?.focus();
    }
  }, [isExpanded]);

  return {
    overflowingRef,
    isOverflowing,
    isExpanded,
    expandButtonElementRef,
    collapseButtonElementRef,
    handleExpand,
    handleCollapse,
  };
};
