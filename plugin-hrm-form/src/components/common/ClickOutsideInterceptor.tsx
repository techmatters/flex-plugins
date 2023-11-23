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

import React, { useEffect, useRef } from 'react';

type CommonTypes = {
  onClick: (event: MouseEvent) => void;
  ignoreRefs?: React.RefObject<HTMLElement>[];
};

type Props = CommonTypes & {
  children: React.ReactNode;
};

type UseClickOutsideParams = CommonTypes & {
  ref: React.RefObject<HTMLElement>;
};

const useClickOutside = ({ ref, onClick, ignoreRefs }: UseClickOutsideParams) => {
  useEffect(() => {
    const listener = event => {
      if (
        !ref.current ||
        ref.current.contains(event.target) ||
        ignoreRefs?.some(r => r.current?.contains(event.target))
      ) {
        return;
      }
      onClick(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, onClick, ignoreRefs]);
};

const ClickOutsideInterceptor = ({ children, ignoreRefs, onClick }: Props) => {
  const ref = useRef(null);
  useClickOutside({ ref, onClick, ignoreRefs });
  return <div ref={ref}>{children}</div>;
};

export default ClickOutsideInterceptor;
