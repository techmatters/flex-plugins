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

import { AriaLiveHiddenText } from '../../styles';

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
    const isTarget = event =>
      !ref.current || ref.current.contains(event.target) || ignoreRefs?.some(r => r.current?.contains(event.target));

    const mousedownListener = event => {
      if (isTarget(event)) return;
      onClick(event);
    };

    const keydownListener = event => {
      if (!isTarget(event) || event.key !== 'Escape') return;

      onClick(event);
    };

    document.addEventListener('mousedown', mousedownListener);
    document.addEventListener('keydown', keydownListener);
    return () => {
      document.removeEventListener('mousedown', mousedownListener);
      document.removeEventListener('keydown', keydownListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, onClick, ignoreRefs]);
};

const ClickOutsideInterceptor = ({ children, ignoreRefs, onClick }: Props) => {
  const ref = useRef(null);
  useClickOutside({ ref, onClick, ignoreRefs });
  return (
    <div ref={ref}>
      <AriaLiveHiddenText aria-live="polite">
        You are in an interface that can be closed by hitting escape.
      </AriaLiveHiddenText>
      {children}
    </div>
  );
};

export default ClickOutsideInterceptor;
