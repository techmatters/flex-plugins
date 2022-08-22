import React from 'react';
import renderer from 'react-test-renderer';
import { getByTestId, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import './mockStyled';
import TabPressWrapper from '../components/TabPressWrapper';

const getFirstElement = component => component.getInstance().firstElementRef.current;
const getLastElement = component => component.getInstance().lastElementRef.current;

/**
 * firstElement and lastElement tests
 */

test('<TabPressWrapper> with no children', () => {
  const { container } = render(<TabPressWrapper />);

  expect(container.getAttribute('tabIndex')).toBeNull();
});

test('<TabPressWrapper> with no children with tabIndex', () => {
  const { container } = render(
    <TabPressWrapper>
      <div id="noTabIndex1" data-testid="noTabIndex1" />
      <div id="noTabIndex2" data-testid="noTabIndex2" />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'noTabIndex1');
  userEvent.tab();
  expect(firstElement).not.toHaveFocus();
  expect(firstElement.getAttribute('tabIndex')).toBeNull();

  const secondElement = getByTestId(container, 'noTabIndex2');
  userEvent.tab();
  expect(secondElement).not.toHaveFocus();
  expect(secondElement.getAttribute('tabIndex')).toBeNull();
});

test('<TabPressWrapper> children with only one tabIndex', () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabbableButton" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabbableButton');
  userEvent.tab();
  expect(firstElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 1, 2 and 3', () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex3" data-testid="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2');
  userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex3');
  userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> not only first level children with tabIndexes: 1, 2 and 3', () => {
  const { container } = render(
    <TabPressWrapper>
      <div>
        <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      </div>
      <div>
        <div>
          <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
        </div>
      </div>
      <button id="tabIndex3" data-testid="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2');
  userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex3');
  userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 1 and 3', () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex3" data-testid="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex3');
  userEvent.tab();
  expect(secondElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 5 and 4', () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex5" data-testid="tabIndex5" type="button" tabIndex={5} />
      <button id="tabIndex4" data-testid="tabIndex4" type="button" tabIndex={4} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex4');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex5');
  userEvent.tab();
  expect(secondElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 1, 2 and 1', () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex1Again" data-testid="tabIndex1Again" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex1Again');
  userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex2');
  userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 1, 2 and 2', () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex2Again" data-testid="tabIndex2Again" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2');
  userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex2Again');
  userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> complex children structure', () => {
  const { container } = render(
    <TabPressWrapper>
      <div>
        <button id="tabIndex7" data-testid="tabIndex7" type="button" tabIndex={7} />
        <div />
        <button id="tabIndex6" type="button" tabIndex={6} />
        <button id="tabIndex3" type="button" tabIndex={3} />
      </div>
      <div>
        <button id="tabIndex3Again" type="button" tabIndex={3} />
        <button id="tabIndex7Again" data-testid="tabIndex7Again" type="button" tabIndex={7} />
        <button id="tabIndex6Again" type="button" tabIndex={6} />
      </div>
      <div>
        <div>
          <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
        </div>
      </div>
      <button id="tabIndex2Again" data-testid="tabIndex2Again" type="button" tabIndex={2} />
      <button id="tabIndex3AgainAgain" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex2');
  userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2Again');
  userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex7Again');
  userEvent.tab();
  userEvent.tab();
  userEvent.tab();
  userEvent.tab();
  userEvent.tab();
  userEvent.tab();
  userEvent.tab();
  expect(lastElement).toHaveFocus();
});

/**
 * tab and shift+tab tests
 */

const setActiveElement = element => jest.spyOn(document, 'activeElement', 'get').mockReturnValue(element);
const event = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
};
const pressTab = component => component.getInstance().handleTab('tab', event);
const pressShiftTab = component => component.getInstance().handleTab('shift+tab', event);

const assertCalledFocusElementWith = (component, element) => {
  const focusElementMethod = component.getInstance().focusElement;
  const firstArgument = focusElementMethod.mock.calls[0][0];

  expect(focusElementMethod).toHaveBeenCalled();
  expect(firstArgument.current).toEqual(element);
};

test('<TabPressWrapper> lastElement focused and hit "tab"', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="firstElement" type="button" tabIndex={1} />
      <button id="secondElement" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const lastElement = getLastElement(component);
  setActiveElement(lastElement);

  // Mock TabPressWrapper.focusElement()
  component.getInstance().focusElement = jest.fn();

  pressTab(component);

  const firstElement = getFirstElement(component);
  assertCalledFocusElementWith(component, firstElement);
});

test('<TabPressWrapper> firstElement focused and hit "shift+tab"', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="firstElement" type="button" tabIndex={1} />
      <button id="secondElement" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  setActiveElement(firstElement);

  // Mock TabPressWrapper.focusElement()
  component.getInstance().focusElement = jest.fn();

  pressShiftTab(component);

  const lastElement = getLastElement(component);
  assertCalledFocusElementWith(component, lastElement);
});

test('<TabPressWrapper> single element hit "tab"', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="singleElement" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  setActiveElement(firstElement);

  // Mock TabPressWrapper.focusElement()
  component.getInstance().focusElement = jest.fn();

  pressTab(component);

  assertCalledFocusElementWith(component, firstElement);
});

test('<TabPressWrapper> single element hit "shift+tab"', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="singleElement" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  setActiveElement(firstElement);

  // Mock TabPressWrapper.focusElement()
  component.getInstance().focusElement = jest.fn();

  pressShiftTab(component);

  assertCalledFocusElementWith(component, firstElement);
});
