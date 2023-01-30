// https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
import React from 'react';

export const useIsOverflowing = (ref, callback?: (isOverflowing: boolean) => void) => {
  const [isOverflow, setOverflow] = React.useState(undefined);

  React.useLayoutEffect(() => {
    const { current } = ref;

    const trigger = () => {
      const hasOverflow = current.scrollHeight > current.clientHeight || current.scrollWidth > current.clientWidth;

      setOverflow(hasOverflow);

      if (callback) {
        // eslint-disable-next-line callback-return
        callback(hasOverflow);
      }
    };

    if (current) {
      trigger();
    }
  }, [callback, ref]);

  return isOverflow;
};
