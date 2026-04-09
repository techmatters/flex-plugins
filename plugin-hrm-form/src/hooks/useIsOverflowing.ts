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

// https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
import { debounce } from 'lodash';
import React from 'react';

export const useIsOverflowing = ({ ref, callback }: { ref: any; callback?: (isOverflowing: boolean) => void }) => {
  const [isOverflow, setOverflow] = React.useState(undefined);

  const trigger = React.useCallback(() => {
    if (!ref.current) {
      return;
    }

    const hasOverflow =
      ref.current.scrollHeight > ref.current.clientHeight || ref.current.scrollWidth > ref.current.clientWidth;

    setOverflow(hasOverflow);

    if (callback) {
      // eslint-disable-next-line callback-return
      callback(hasOverflow);
    }
  }, [callback, ref]);

  React.useLayoutEffect(() => {
    trigger();
  }, [trigger, ref]);

  return { trigger, isOverflowing: isOverflow };
};
