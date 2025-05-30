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

/* eslint-disable react/no-find-dom-node */
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
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { isNullOrUndefined } from '../utils/checkers';

class TabPressWrapper extends Component {
  static displayName = 'TabPressWrapper';

  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
  };

  constructor(props) {
    super(props);

    this.firstElementRef = createRef();
    this.lastElementRef = createRef();
    this.foundFirstElement = false;
  }

  state = {
    tabIndexCount: 0,
    childrenWithRef: null,
  };

  componentDidMount() {
    const { children } = this.props;

    const minTabIndex = this.findMinTabIndex(children);
    const maxTabIndex = this.findMaxTabIndex(children);

    const childrenWithRef = this.addRefToFirstAndLastElement(children, minTabIndex, maxTabIndex);

    this.setState({ childrenWithRef });
  }

  incrementTabIndexCount = () => this.setState(prevState => ({ tabIndexCount: prevState.tabIndexCount + 1 }));

  isSingleElement = () => this.state.tabIndexCount === 1;

  handleTab = (key, event) => {
    const { activeElement } = document;
    const isFirstElement = activeElement === this.firstElementRef.current;
    const isLastElement = activeElement === this.lastElementRef.current;

    if (isFirstElement && this.isSingleElement()) {
      this.focusElement(this.firstElementRef, event);
    } else if (isLastElement && key === 'tab') {
      this.focusElement(this.firstElementRef, event);
    } else if (isFirstElement && key === 'shift+tab') {
      this.focusElement(this.lastElementRef, event);
    }
  };

  focusElement = (elementRef, event) => {
    event.preventDefault();
    event.stopPropagation();
    elementRef.current.focus();
  };

  reduceChildren = (children, comparator, initialValue) =>
    React.Children.toArray(children).reduce((result, element) => {
      const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
      const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

      if (hasTabIndex) {
        const { tabIndex } = element.props;

        if (result === null || comparator(tabIndex, result)) {
          return tabIndex;
        }

        return result;
      } else if (hasChildren) {
        return this.reduceChildren(element.props.children, comparator, result);
      }

      return result;
    }, initialValue);

  findMinTabIndex = children => this.reduceChildren(children, (tabIndex, minTabIndex) => tabIndex < minTabIndex, null);

  findMaxTabIndex = children => this.reduceChildren(children, (tabIndex, maxTabIndex) => tabIndex > maxTabIndex, null);

  countTabIndexElements = children => {
    let childrenCount = 0;

    React.Children.forEach(children, element => {
      const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
      const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

      if (hasTabIndex) {
        childrenCount += 1;
      } else if (hasChildren) {
        childrenCount += this.countTabIndexElements(element.props.children);
      }
    });

    return childrenCount;
  };

  addRefToFirstAndLastElement = (children, minTabIndex, maxTabIndex) =>
    React.Children.map(children, element => {
      const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
      const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

      if (hasTabIndex) {
        this.incrementTabIndexCount();

        const { tabIndex } = element.props;
        const isFirstElement = tabIndex === minTabIndex;
        const isLastElement = tabIndex === maxTabIndex;

        if (isFirstElement && !this.foundFirstElement) {
          this.foundFirstElement = true;
          return this.addRef(element, this.firstElementRef);
        }

        if (isLastElement) {
          return this.addRef(element, this.lastElementRef);
        }

        return element;
      } else if (hasChildren) {
        const updatedChildren = this.addRefToFirstAndLastElement(element.props.children, minTabIndex, maxTabIndex);
        return React.cloneElement(element, {}, updatedChildren);
      }

      return element;
    });

  /*
   * addRef = (node, elementRef) => (
   *   <RootRef rootRef={elementRef}>{React.cloneElement(node, { ref: elementRef })}</RootRef>
   * );
   */

  addRef = (node, elementRef) => {
    return React.cloneElement(node, { ref: elementRef });
  };

  render() {
    const { childrenWithRef } = this.state;

    return (
      <KeyboardEventHandler
        id="KeyboardEventHandler"
        handleKeys={['tab', 'shift+tab']}
        onKeyEvent={this.handleTab}
        handleFocusableElements
      >
        {childrenWithRef}
      </KeyboardEventHandler>
    );
  }
}

export default TabPressWrapper;
