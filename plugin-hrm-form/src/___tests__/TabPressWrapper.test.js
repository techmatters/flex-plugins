import React from 'react';
import renderer from 'react-test-renderer';

import './mockStyled';
import TabPressWrapper from '../components/TabPressWrapper';

const getFirstElement = component => component.getInstance().firstElementRef.current;
const getLastElement = component => component.getInstance().lastElementRef.current;

/**
 * firstElement and lastElement tests
 */

test('<TabPressWrapper> with no children', () => {
  const component = renderer.create(<TabPressWrapper />);

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement).toBeNull();
  expect(lastElement).toBeNull();
});

test('<TabPressWrapper> with no children with tabIndex', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="noTabIndex1" type="button" />
      <button id="noTabIndex2" type="button" />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement).toBeNull();
  expect(lastElement).toBeNull();
});

test('<TabPressWrapper> children with only one tabIndex', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="tabIndex1" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex1');
  expect(lastElement).toBeNull();
});

test('<TabPressWrapper> not only first level children with tabIndexes: 1, 2 and 3', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <div>
        <button id="tabIndex1" type="button" tabIndex={1} />
      </div>
      <div>
        <div>
          <button id="tabIndex2" type="button" tabIndex={2} />
        </div>
      </div>
      <button id="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex1');
  expect(lastElement.props.id).toEqual('tabIndex3');
});

test('<TabPressWrapper> children with tabIndexes: 1 and 3', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex1');
  expect(lastElement.props.id).toEqual('tabIndex3');
});

test('<TabPressWrapper> children with tabIndexes: 5 and 4', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="tabIndex5" type="button" tabIndex={5} />
      <button id="tabIndex4" type="button" tabIndex={4} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex4');
  expect(lastElement.props.id).toEqual('tabIndex5');
});

test('<TabPressWrapper> children with tabIndexes: 1, 2 and 1', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex1Again" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex1');
  expect(lastElement.props.id).toEqual('tabIndex2');
});

test('<TabPressWrapper> children with tabIndexes: 1, 2 and 2', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <button id="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex2Again" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex1');
  expect(lastElement.props.id).toEqual('tabIndex2Again');
});

test('<TabPressWrapper> complex children structure', () => {
  const component = renderer.create(
    <TabPressWrapper>
      <div>
        <button id="tabIndex7" type="button" tabIndex={7} />
        <div />
        <button id="tabIndex6" type="button" tabIndex={6} />
        <button id="tabIndex3" type="button" tabIndex={3} />
      </div>
      <div>
        <button id="tabIndex3Again" type="button" tabIndex={3} />
        <button id="tabIndex7Again" type="button" tabIndex={7} />
        <button id="tabIndex6Again" type="button" tabIndex={6} />
      </div>
      <div>
        <div>
          <button id="tabIndex2" type="button" tabIndex={2} />
        </div>
      </div>
      <button id="tabIndex2Again" type="button" tabIndex={2} />
      <button id="tabIndex3AgainAgain" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getFirstElement(component);
  const lastElement = getLastElement(component);

  expect(firstElement.props.id).toEqual('tabIndex2');
  expect(lastElement.props.id).toEqual('tabIndex7Again');
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
