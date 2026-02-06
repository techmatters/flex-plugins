/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { render, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';
import { BASE_MOCK_REDUX, resetMockRedux } from '../../__mocks__/redux/mockRedux';
import { EngagementPhase } from '../../store/definitions';
import { RootContainer } from '../RootContainer';

jest.mock('../EntryPoint', () => ({
  EntryPoint: () => <div title="EntryPoint" />,
}));

jest.mock('../LoadingPhase', () => ({
  LoadingPhase: () => <div title="LoadingPhase" />,
}));

jest.mock('../MessagingCanvasPhase', () => ({
  MessagingCanvasPhase: () => <div title="MessagingCanvasPhase" />,
}));

jest.mock('../PreEngagementFormPhase', () => ({
  PreEngagementFormPhase: () => <div title="PreEngagementFormPhase" />,
}));

describe('Root Container', () => {
  beforeEach(() => {
    resetMockRedux({
      config: {
        ...BASE_MOCK_REDUX.config,
        alwaysOpen: false,
      },
    });
  });

  it('renders the root container', () => {
    const { container } = render(<RootContainer />);

    expect(container).toBeInTheDocument();
  });

  it('renders the entry point', () => {
    const { queryByTestId } = render(<RootContainer />);
    waitFor(() => {
      expect(queryByTestId('entry-point-button')).toBeInTheDocument();
    });
  });

  it('renders the loading phase when supplied as phase', () => {
    resetMockRedux({
      session: {
        ...BASE_MOCK_REDUX.session,
        expanded: true,
        currentPhase: EngagementPhase.Loading,
      },
    });

    const { queryByTitle } = render(<RootContainer />);

    expect(queryByTitle('LoadingPhase')).toBeInTheDocument();
  });

  it('renders the messaging canvas phase when supplied as phase', () => {
    resetMockRedux({
      session: {
        ...BASE_MOCK_REDUX.session,
        expanded: true,
        currentPhase: EngagementPhase.MessagingCanvas,
      },
    });

    const { queryByTitle } = render(<RootContainer />);

    expect(queryByTitle('MessagingCanvasPhase')).toBeInTheDocument();
  });

  it('renders pre-engagement form phase when supplied as phase', () => {
    resetMockRedux({
      session: {
        ...BASE_MOCK_REDUX.session,
        expanded: true,
        currentPhase: EngagementPhase.PreEngagementForm,
      },
    });
    const { queryByTitle } = render(<RootContainer />);

    expect(queryByTitle('PreEngagementFormPhase')).toBeInTheDocument();
  });

  it('renders the re-engagement form phase as default phase', () => {
    resetMockRedux({
      session: {
        ...BASE_MOCK_REDUX.session,
        currentPhase: null as any,
        expanded: true,
      },
    });

    const { queryByTitle } = render(<RootContainer />);

    expect(queryByTitle('PreEngagementFormPhase')).toBeInTheDocument();
  });

  it('does not render phase when not expanded', () => {
    resetMockRedux({
      session: {
        ...BASE_MOCK_REDUX.session,
        currentPhase: EngagementPhase.MessagingCanvas,
      },
    });

    const { queryByTitle } = render(<RootContainer />);

    expect(queryByTitle('MessagingCanvasPhase')).not.toBeInTheDocument();
  });
});
