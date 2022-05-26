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
