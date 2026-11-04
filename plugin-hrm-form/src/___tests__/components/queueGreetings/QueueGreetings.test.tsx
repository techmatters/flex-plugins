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
import { ITask, StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import QueueGreetingPill from '../../../components/queueGreetings/QueueGreetingPill';
import QueueGreetingPopover from '../../../components/queueGreetings/QueueGreetingPopover';
import { namespace } from '../../../states/storeNamespaces';

const queueGreetings = {
  greetedQueue: {
    pillText: 'A pill text longer than twenty characters',
    popoverTitle: 'Greeted queue title',
    popoverContent: 'Hello, greeted queue.',
  },
};

const store = configureMockStore([])({
  [namespace]: { configuration: { currentDefinitionVersion: { queueGreetings } } },
});

const renderWithStore = (element: React.ReactElement) =>
  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>{element}</Provider>
    </StorelessThemeProvider>,
  );

const taskFromQueue = (sid: string, queueName: string) => ({ sid, queueName } as ITask);

describe('QueueGreetingPill', () => {
  test('shows the pill text, capped to 20 characters, for a queue with a greeting', () => {
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WT1', 'greetedQueue')} />);

    expect(screen.getByText('A pill text longer t')).toBeInTheDocument();
  });

  test('has a white background only when its task is selected', () => {
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WT1', 'greetedQueue')} selectedTaskSid="WT1" />);
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WT2', 'greetedQueue')} selectedTaskSid="WT1" />);

    const [selectedPill, unselectedPill] = screen.getAllByText('A pill text longer t');
    expect(selectedPill.parentElement).toHaveStyle('background-color: rgb(255, 255, 255)');
    expect(unselectedPill.parentElement).toHaveStyle('background-color: inherit');
  });

  test('renders nothing for a queue without a greeting', () => {
    renderWithStore(<QueueGreetingPill task={taskFromQueue('WT1', 'otherQueue')} />);

    expect(screen.queryByText('A pill text longer t')).not.toBeInTheDocument();
  });
});

describe('QueueGreetingPopover', () => {
  test('shows the greeting for the task until it is dismissed', () => {
    renderWithStore(<QueueGreetingPopover task={taskFromQueue('WT1', 'greetedQueue')} />);

    expect(screen.getByText('Greeted queue title')).toBeInTheDocument();
    expect(screen.getByText('Hello, greeted queue.')).toBeInTheDocument();

    screen.getByTestId('QueueGreeting-CloseButton').click();

    expect(screen.queryByText('Greeted queue title')).not.toBeInTheDocument();
  });

  test('renders nothing when the task comes from a queue without a greeting', () => {
    renderWithStore(<QueueGreetingPopover task={taskFromQueue('WT2', 'otherQueue')} />);

    expect(screen.queryByText('Greeted queue title')).not.toBeInTheDocument();
  });
});
