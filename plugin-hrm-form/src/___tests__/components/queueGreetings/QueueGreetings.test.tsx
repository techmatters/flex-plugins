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
import { render, screen } from '@testing-library/react';
import { Actions, ITask, StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import QueueGreetingPill from '../../../components/queueGreetings/QueueGreetingPill';
import QueueGreetingPopover from '../../../components/queueGreetings/QueueGreetingPopover';
import { namespace } from '../../../states/storeNamespaces';
import { newSetQueueGreetingPopupDismissedAction } from '../../../states/taskScopedMetadata';

jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: { invokeAction: jest.fn() },
}));

// jsdom does not implement ResizeObserver
global.ResizeObserver = class {
  observe = jest.fn();

  disconnect = jest.fn();
} as any;

const queueGreetings = {
  greetedQueue: {
    pillText: 'Greeted queue pill',
    popoverTitle: 'Greeted queue title',
    popoverContent: 'Hello, greeted queue.',
  },
};

const mockStore = configureMockStore([]);
const createStore = ({ dismissedPopup = false } = {}) =>
  mockStore({
    flex: { view: { selectedTaskSid: 'WR1' } },
    [namespace]: {
      configuration: { currentDefinitionVersion: { queueGreetings } },
      taskScopedMetadata: {
        'task-WR1': { queueGreetings: { dismissedPopup } },
      },
    },
  });

const renderWithStore = (element: React.ReactElement, store = createStore()) =>
  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>{element}</Provider>
    </StorelessThemeProvider>,
  );

const taskFromQueue = (reservationSid: string, queueName: string) =>
  ({ sid: reservationSid, taskSid: `task-${reservationSid}`, queueName } as ITask);

describe('QueueGreetingPill', () => {
  test('shows the pill text for a queue with a greeting', () => {
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WR1', 'greetedQueue')} />);

    expect(screen.getByText('Greeted queue pill')).toBeInTheDocument();
  });

  // jsdom applies :hover rules to computed styles, so the background can't be asserted here; the outline is checked instead
  test('continues the task outline only when its task is selected', () => {
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WR1', 'greetedQueue')} selectedTaskSid="WR1" />);
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WR2', 'greetedQueue')} selectedTaskSid="WR1" />);

    const [selectedPill, unselectedPill] = screen.getAllByRole('button', { name: 'Greeted queue pill' });
    expect(selectedPill.parentElement).toHaveStyle('margin-top: -2px');
    expect(unselectedPill.parentElement).not.toHaveStyle('margin-top: -2px');
  });

  test('clicking it reopens the greeting and selects its task', () => {
    const store = createStore();
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WR2', 'greetedQueue')} />, store);

    screen.getByRole('button', { name: 'Greeted queue pill' }).click();

    expect(store.getActions()).toStrictEqual([newSetQueueGreetingPopupDismissedAction('task-WR2', false)]);
    expect(Actions.invokeAction).toHaveBeenCalledWith('SelectTask', { sid: 'WR2' });
  });

  test('renders nothing for a queue without a greeting', () => {
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WR1', 'otherQueue')} />);

    expect(screen.queryByText('Greeted queue pill')).not.toBeInTheDocument();
  });
});

describe('QueueGreetingPopover', () => {
  test('shows the greeting of the selected task, and dismisses it when closed', () => {
    const store = createStore();
    renderWithStore(<QueueGreetingPopover task={taskFromQueue('WR1', 'greetedQueue')} />, store);

    expect(screen.getByText('Greeted queue title')).toBeInTheDocument();
    expect(screen.getByText('Hello, greeted queue.')).toBeInTheDocument();

    screen.getByTestId('Popover-CloseButton').click();

    expect(store.getActions()).toStrictEqual([newSetQueueGreetingPopupDismissedAction('task-WR1', true)]);
  });

  test('renders nothing once the greeting was dismissed', () => {
    const store = createStore({ dismissedPopup: true });
    renderWithStore(<QueueGreetingPopover task={taskFromQueue('WR1', 'greetedQueue')} />, store);

    expect(screen.queryByText('Greeted queue title')).not.toBeInTheDocument();
  });

  test('renders nothing when another task is selected', () => {
    renderWithStore(<QueueGreetingPopover task={taskFromQueue('WR2', 'greetedQueue')} />);

    expect(screen.queryByText('Greeted queue title')).not.toBeInTheDocument();
  });

  test('renders nothing when the task comes from a queue without a greeting', () => {
    renderWithStore(<QueueGreetingPopover task={taskFromQueue('WR1', 'otherQueue')} />);

    expect(screen.queryByText('Greeted queue title')).not.toBeInTheDocument();
  });
});
