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

import { useRef, useEffect } from 'react';

import type { HTMLElementRef } from '../components/common/forms/types';

/**
 * Custom Hook to handle element focus at forms.
 *
 * This hook returns a reference to an element and make the element focused whenever the
 * 'shouldFocus' parameter is true. If no parameter is given, the element will be focused at
 * the first render. The returned element reference should be linked to an HTMLElement by
 * using properties such as 'ref', 'innerRef', 'buttonRef' etc.
 *
 * @param shouldFocus optional boolean that indicates if the element should be focused
 * @returns Reference to the focusable element
 */
const useFocus = (shouldFocus: boolean = true): HTMLElementRef => {
  const elementRef = useRef(null);

  useEffect(() => {
    const setFocus = () => {
      if (elementRef.current && elementRef.current.focus) {
        elementRef.current.focus();
      }
    };

    if (shouldFocus) {
      setFocus();
    }
  }, [shouldFocus]);

  return elementRef;
};

export default useFocus;
