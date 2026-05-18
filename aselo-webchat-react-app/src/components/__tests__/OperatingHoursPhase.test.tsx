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

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';

import { AppState, EngagementPhase } from '../../store/definitions';
import { preloadStore } from '../../store/store';
import { OperatingHoursPhase } from '../OperatingHoursPhase';

jest.mock('../Header', () => ({
  Header: () => <div title="Header" />,
}));

describe('OperatingHoursPhase', () => {
  const baseState: Partial<AppState> = {
    config: {
      environment: 'test',
      helplineCode: '',
      quickExitUrl: 'https://',
      translations: {
        'en-US': {
          'OperatingHours-Closed-Message': 'We are currently closed.',
        },
      },
      defaultLocale: 'en-US',
      deploymentKey: '',
      aseloBackendUrl: '',
      definitionVersion: '',
      preEngagementFormDefinition: null,
    },
    session: {
      currentPhase: EngagementPhase.OperatingHours,
      expanded: true,
      preEngagementData: {},
    },
  };

  const withStore = (Component: React.ReactElement, stateOverride: Partial<AppState> = {}) => {
    const store = preloadStore({ ...baseState, ...stateOverride });
    return <Provider store={store}>{Component}</Provider>;
  };

  it('renders the operating hours phase', () => {
    const { container } = render(withStore(<OperatingHoursPhase />));
    expect(container).toBeInTheDocument();
  });

  it('renders the header', () => {
    const { queryByTitle } = render(withStore(<OperatingHoursPhase />));
    expect(queryByTitle('Header')).toBeInTheDocument();
  });

  it('renders the operating hours message from the session state', () => {
    const message = 'We are closed for maintenance.';
    const { getByText } = render(
      withStore(<OperatingHoursPhase />, {
        session: {
          ...baseState.session!,
          operatingHoursMessage: message,
        },
      }),
    );
    expect(getByText(message)).toBeInTheDocument();
  });

  it('renders fallback translation key when no message is set', () => {
    const { getByText } = render(withStore(<OperatingHoursPhase />));
    // The translation key 'OperatingHours-Closed-Message' is in the translations, so it should be translated
    expect(getByText('We are currently closed.')).toBeInTheDocument();
  });

  it('renders the container with the correct data-test attribute', () => {
    const { container } = render(withStore(<OperatingHoursPhase />));
    expect(container.querySelector('[data-test="operating-hours-container"]')).toBeInTheDocument();
  });
});
