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

/**
 * Component that handles element navigation with 'tab' or 'shift+tab', so that
 * it will only navigate between the desired elements.
 *
 * Usage: <TabPressWrapper><YourComponent /></TabPressWrapper>
 *
 * What it requires?
 * It requires that every navigable element of <YourComponent> has a tabIndex value.
 *
 * How does it work?
 * 1) It detects the first and last navigable elements according to the tabIndexes.
 * 2) In case of elements with same tabIndex
 *   a) First element will be the first one found with min tabIndex
 *   b) Last element will be the last one found with max tabIndex
 * 3) It adds a Ref to these elements, in order to access the HTML native element.
 * 4) It listens to 'tab' or 'shift+tab' key presses:
 *    a) If it's on the lastElement and listens to a 'tab', it focus the firstElement
 *    b) If it's on the firstElement and listens a 'shif+tab', it focus the lastElement
 *    c) Otherwise, it lets the browser handle it
 */
import React, { useMemo, useRef } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { isNullOrUndefined } from '../utils/checkers';

type Props = {
  children?: React.ReactNode;
};

const reduceChildren = (
  children: React.ReactNode,
  comparator: (tabIndex: number, result: number) => boolean,
  initialValue: number | null,
): number | null =>
  React.Children.toArray(children).reduce<number | null>((result, element) => {
    if (!React.isValidElement(element)) return result;
    const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
    const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

    if (hasTabIndex) {
      const { tabIndex } = element.props;

      if (result === null || comparator(tabIndex, result)) {
        return tabIndex;
      }

      return result;
    } else if (hasChildren) {
      return reduceChildren(element.props.children, comparator, result);
    }

    return result;
  }, initialValue);

const countTabIndexElements = (children: React.ReactNode): number => {
  let childrenCount = 0;

  React.Children.forEach(children, element => {
    if (!React.isValidElement(element)) return;
    const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
    const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

    if (hasTabIndex) {
      childrenCount += 1;
    } else if (hasChildren) {
      childrenCount += countTabIndexElements(element.props.children);
    }
  });

  return childrenCount;
};

const addRefsToElements = (
  children: React.ReactNode,
  minTabIndex: number | null,
  maxTabIndex: number | null,
  firstRef: React.RefObject<HTMLElement>,
  lastRef: React.RefObject<HTMLElement>,
  state: { foundFirstElement: boolean },
): React.ReactNode =>
  React.Children.map(children, element => {
    if (!React.isValidElement(element)) return element;
    const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
    const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

    if (hasTabIndex) {
      const { tabIndex } = element.props;
      const isFirstElement = tabIndex === minTabIndex;
      const isLastElement = tabIndex === maxTabIndex;

      if (isFirstElement && !state.foundFirstElement) {
        state.foundFirstElement = true;
        return React.cloneElement(element, { ref: firstRef });
      }

      if (isLastElement) {
        return React.cloneElement(element, { ref: lastRef });
      }

      return element;
    } else if (hasChildren) {
      const updatedChildren = addRefsToElements(
        element.props.children,
        minTabIndex,
        maxTabIndex,
        firstRef,
        lastRef,
        state,
      );
      return React.cloneElement(element, {}, updatedChildren);
    }

    return element;
  });

const TabPressWrapper: React.FC<Props> = ({ children = null }) => {
  const firstElementRef = useRef<HTMLElement>(null);
  const lastElementRef = useRef<HTMLElement>(null);
  const tabIndexCountRef = useRef<number>(0);

  const childrenWithRef = useMemo(() => {
    const minTabIndex = reduceChildren(children, (tabIndex, minTabIndex) => tabIndex < minTabIndex, null);
    const maxTabIndex = reduceChildren(children, (tabIndex, maxTabIndex) => tabIndex > maxTabIndex, null);

    tabIndexCountRef.current = countTabIndexElements(children);

    const refState = { foundFirstElement: false };
    return addRefsToElements(children, minTabIndex, maxTabIndex, firstElementRef, lastElementRef, refState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const handleTab = (key: string, event: KeyboardEvent) => {
    const { activeElement } = document;
    const isFirstElement = activeElement === firstElementRef.current;
    const isLastElement = activeElement === lastElementRef.current;
    const isSingleElement = tabIndexCountRef.current === 1;

    if ((isFirstElement && isSingleElement) || (isLastElement && key === 'tab')) {
      event.preventDefault();
      event.stopPropagation();
      firstElementRef.current.focus();
    } else if (isFirstElement && key === 'shift+tab') {
      event.preventDefault();
      event.stopPropagation();
      lastElementRef.current.focus();
    }
  };

  return (
    <KeyboardEventHandler
      id="KeyboardEventHandler"
      handleKeys={['tab', 'shift+tab']}
      onKeyEvent={handleTab}
      handleFocusableElements
    >
      {childrenWithRef}
    </KeyboardEventHandler>
  );
};

TabPressWrapper.displayName = 'TabPressWrapper';

export default TabPressWrapper;
