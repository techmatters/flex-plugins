import React from 'react';
import renderer from 'react-test-renderer';

import './mockStyled';
import TabPressWrapper from '../components/TabPressWrapper';

const getFirstElement = component => component.getInstance().firstElementRef.current;
const getLastElement = component => component.getInstance().lastElementRef.current;

test('<TabPressWrapper> children with tabIndexes: 1 and 2', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="firstElement" type="button" tabIndex={1} />
      <button id="secondElement" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('firstElement');
  expect(lastElement.props.id).toEqual('secondElement');
});

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
