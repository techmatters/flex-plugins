/* eslint-disable react/no-find-dom-node */
/**
 * Component that handles element navigation with 'tab' or 'shift+tab', so that
 * it will only navigate between the desired elements.
 *
 * Usage: <TabPressWrapper><YourComponent /></TabPressWrapper>
 *
 * What it requires?
 * It requires that every navigable element of <YourComponent> has a unique tabIndex value.
 *
 * How does it work?
 * 1) It detects the first and last navigable elements according to the tabIndexes.
 * 2) It adds a Ref to these elements, in order to access the HTML native element.
 * 3) It listens to 'tab' or 'shift+tab' key presses:
 *    a) If it's on the lastElement and listens to a 'tab', it focus the firstElement
 *    b) If it's on the firstElement and listens a 'shif+tab', it focus the lastElement
 *    c) Otherwise, it lets the browser handle it
 */
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import RootRef from '@material-ui/core/RootRef';

import { isNullOrUndefined } from '../utils';

class TabPressWrapper extends Component {
  static displayName = 'TabPressWrapper';

  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  constructor(props) {
    super(props);

    this.firstElementRef = createRef();
    this.lastElementRef = createRef();
  }

  state = {
    childrenWithRef: null,
  };

  componentDidMount() {
    const { children } = this.props;

    const maxTabIndex = this.countTabIndexElements(children);
    const childrenWithRef = this.addRefToFirstAndLastElement(children, maxTabIndex);

    this.setState({ childrenWithRef });
  }

  handleTab = (key, event) => {
    const { activeElement } = document;
    const isFirstElement = activeElement === this.firstElementRef.current;
    const isLastElement = activeElement === this.lastElementRef.current;

    if (isLastElement && key === 'tab') {
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

  addRefToFirstAndLastElement = (children, maxTabIndex) =>
    React.Children.map(children, element => {
      const hasTabIndex = Boolean(element.props && !isNullOrUndefined(element.props.tabIndex));
      const hasChildren = Boolean(element.props && !isNullOrUndefined(element.props.children));

      if (hasTabIndex) {
        const { tabIndex } = element.props;
        const isFirstElement = tabIndex === 1;
        const isLastElement = tabIndex === maxTabIndex;

        if (isFirstElement) {
          return this.addRef(element, this.firstElementRef);
        }

        if (isLastElement) {
          return this.addRef(element, this.lastElementRef);
        }

        return element;
      } else if (hasChildren) {
        const updatedChildren = this.addRefToFirstAndLastElement(element.props.children, maxTabIndex);
        return React.cloneElement(element, {}, updatedChildren);
      }

      return element;
    });

  addRef = (node, elementRef) => (
    <RootRef rootRef={elementRef}>{React.cloneElement(node, { ref: elementRef })}</RootRef>
  );

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
