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
