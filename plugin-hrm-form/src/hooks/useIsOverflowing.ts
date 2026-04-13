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
import React from 'react';

// Walks up the DOM tree and returns all ancestors that have display:none
const getHiddenAncestors = (node: Element): Element[] => {
  const hiddenAncestors: Element[] = [];

  let current = node?.parentElement;

  while (current) {
    if (getComputedStyle(current).display === 'none') {
      hiddenAncestors.push(current);
    }
    current = current.parentElement;
  }

  return hiddenAncestors;
};

/**
 * Computes if a given component (via ref) has overflow, i.e. if it's child content does not fit within the component.
 *
 * **IMPORTANT:** if a callback is given, it **MUST** be a stable reference (e.g. wrapped within React.useCallback).
 */
export const useIsOverflowing = ({ ref, callback }: { ref: any; callback?: (isOverflowing: boolean) => void }) => {
  const [isOverflow, setOverflow] = React.useState(undefined);
  const mutationObserversRef = React.useRef<MutationObserver[]>([]);

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

  const cleanupMutationObservers = React.useCallback(() => {
    mutationObserversRef.current.forEach(obs => obs.disconnect());
    mutationObserversRef.current = [];
  }, []);

  const setupObservers = React.useCallback(() => {
    // Check if any ancestor is hidden — if so, we need MutationObservers as a fallback
    const hiddenAncestors = getHiddenAncestors(ref.current);

    if (hiddenAncestors.length > 0) {
      hiddenAncestors.forEach(ancestor => {
        const mutationObserver = new MutationObserver(() => {
          // Once the ancestor is no longer hidden, check overflow and clean up
          // mutation observers since ResizeObserver will take over from here
          if (getComputedStyle(ancestor).display !== 'none') {
            trigger();
          }
        });

        mutationObserver.observe(ancestor, {
          attributes: true,
          attributeFilter: ['style', 'class'], // only watch style/class changes since those are what typically toggle display
        });

        mutationObserversRef.current.push(mutationObserver);
      });
    }
  }, [trigger, ref]);

  React.useLayoutEffect(() => {
    trigger();
  }, [trigger, ref]);

  React.useEffect(() => {
    setupObservers();

    return () => {
      cleanupMutationObservers();
    };
  }, [ref, setupObservers, cleanupMutationObservers]);

  return { trigger, isOverflowing: isOverflow };
};
