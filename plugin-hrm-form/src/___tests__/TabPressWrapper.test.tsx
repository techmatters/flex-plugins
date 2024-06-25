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

import * as React from 'react';
import renderer from 'react-test-renderer';
import { getByTestId, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import './mockStyled';
import TabPressWrapper from '../components/TabPressWrapper';

const getFirstElement = component => component.getInstance().firstElementRef.current;
const getLastElement = component => component.getInstance().lastElementRef.current;

/**
 * firstElement and lastElement tests
 */

test('<TabPressWrapper> with no children, and it should have no element that can be focused', async () => {
  const { container } = render(<TabPressWrapper />);
  await userEvent.tab();
  expect(container).not.toHaveFocus();
  expect(container.getAttribute('tabIndex')).toBeNull();
});

test('<TabPressWrapper> with no children with a tabIndex, and not tabbable, this should have no elements that can be focused', async () => {
  const { container } = render(
    <TabPressWrapper>
      <div id="noTabIndex1" data-testid="noTabIndex1" />
      <div id="noTabIndex2" data-testid="noTabIndex2" />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'noTabIndex1');
  await userEvent.tab();
  expect(firstElement).not.toHaveFocus();
  expect(firstElement.getAttribute('tabIndex')).toBeNull();

  const secondElement = getByTestId(container, 'noTabIndex2');
  await userEvent.tab();
  expect(secondElement).not.toHaveFocus();
  expect(secondElement.getAttribute('tabIndex')).toBeNull();
});

test('<TabPressWrapper> children with only one tabIndex, and after tabbing once, should focus on the first element', async () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabbableButton" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabbableButton');
  await userEvent.tab();
  expect(firstElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 1, 2 and 3. Tabbing through each element will show focus based on tabIndex', async () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex3" data-testid="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex3');
  await userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> with second and third level children with tabIndexes: 1, 2 and 3. Tabbing through each element will show focus based on tabIndex', async () => {
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
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex3');
  await userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 1 and 3. Tabbing through each element will cycle focus based on tabIndex', async () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex3" data-testid="tabIndex3" type="button" tabIndex={3} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex3');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes: 5 and 4. Given 4 has higher priority, first element focused will be tabIndex of 4, followed by element with tabIndex of 5', async () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex5" data-testid="tabIndex5" type="button" tabIndex={5} />
      <button id="tabIndex4" data-testid="tabIndex4" type="button" tabIndex={4} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex4');
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex5');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();
});

test('<TabPressWrapper> children with two tabIndexs out of order.  Given 1 has higher priority, first & second elements focused will be tabIndex of 1, followed by element with tabIndex of 2', async () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex1Again" data-testid="tabIndex1Again" type="button" tabIndex={1} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex1Again');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex2');
  await userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> children with tabIndexes with repeating tabIndexes. Tabbing through each element will cycle focus based on tabIndex chronology', async () => {
  const { container } = render(
    <TabPressWrapper>
      <button id="tabIndex1" data-testid="tabIndex1" type="button" tabIndex={1} />
      <button id="tabIndex2" data-testid="tabIndex2" type="button" tabIndex={2} />
      <button id="tabIndex2Again" data-testid="tabIndex2Again" type="button" tabIndex={2} />
    </TabPressWrapper>,
  );

  const firstElement = getByTestId(container, 'tabIndex1');
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();

  const lastElement = getByTestId(container, 'tabIndex2Again');
  await userEvent.tab();
  expect(lastElement).toHaveFocus();
});

test('<TabPressWrapper> complex children structure. Tabbing through each element will cycle focus based on tabIndex chronology', async () => {
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
  await userEvent.tab();
  expect(firstElement).toHaveFocus();

  const secondElement = getByTestId(container, 'tabIndex2Again');
  await userEvent.tab();
  expect(secondElement).toHaveFocus();

  const elementCount = await screen.findAllByRole('button');
  expect(elementCount).toHaveLength(9);

  // Out of 9 focusable button elements, 2 have already been focused on, hence 7 more tab cycles will focus on the last element
  for (let i = 0; i < 9 - 2; i++) {
    await userEvent.tab();
  }

  const lastElement = getByTestId(container, 'tabIndex7Again');
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

test('<TabPressWrapper> lastElement focused and hit "tab"', async () => {
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

test('<TabPressWrapper> firstElement focused and hit "shift+tab"', async () => {
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

test('<TabPressWrapper> single element hit "tab"', async () => {
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

test('<TabPressWrapper> single element hit "shift+tab"', async () => {
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
