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

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { FormInputType } from 'hrm-form-definitions';

import { sessionDataHandler } from '../../sessionDataHandler';
import * as initAction from '../../store/actions/initActions';
import { AppState, EngagementPhase } from '../../store/definitions';
import { preloadStore } from '../../store/store';
import { PreEngagementFormPhase } from '../PreEngagementFormPhase';

const token = 'token';
const conversationSid = 'sid';
jest.mock('../../sessionDataHandler', () => ({
  sessionDataHandler: {
    fetchAndStoreNewSession: () => ({ token, conversationSid }),
    getRegion: jest.fn(),
  },
  contactBackend: jest.fn(),
}));

jest.mock('../Header', () => ({
  Header: () => <div title="Header" />,
}));

jest.mock('../NotificationBar', () => ({
  NotificationBar: () => <div title="NotificationBar" />,
}));

describe('Pre Engagement Form Phase', () => {
  const namePlaceholderText = 'Please enter your name';
  const emailPlaceholderText = 'Please enter your email address';
  const queryPlaceholderText = 'Ask a question';
  const nameLabelText = 'Name';
  const emailLabelText = 'Email address';
  const queryLabelText = 'How can we help you?';

  const name = 'John';
  const email = 'email@email.email';
  const query = 'Why is a potato?';

  const preloadedState: Partial<AppState> = {
    config: {
      environment: 'test',
      helplineCode: '',
      quickExitUrl: 'https://',
      translations: {},
      defaultLocale: 'en-US',
      deploymentKey: '',
      aseloBackendUrl: '',
      definitionVersion: '',
      preEngagementFormDefinition: {
        description: 'Description',
        submitLabel: 'Submit Label',
        fields: [
          { name: 'friendlyName', type: FormInputType.Input, label: nameLabelText, placeholder: namePlaceholderText },
          { name: 'email', type: FormInputType.Email, label: emailLabelText, placeholder: emailPlaceholderText },
          { name: 'query', type: FormInputType.Input, label: queryLabelText, placeholder: queryPlaceholderText },
        ],
      },
    },
  };

  const store = preloadStore(preloadedState);

  const withStore = (Component: React.ReactElement) => <Provider store={store}>{Component}</Provider>;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(initAction, 'initSession').mockImplementation((data: any) => data);
  });

  it('renders the pre-engagement form', () => {
    const { container } = render(withStore(<PreEngagementFormPhase />));

    expect(container).toBeInTheDocument();
  });

  it('renders the header', () => {
    const { queryByTitle } = render(withStore(<PreEngagementFormPhase />));

    expect(queryByTitle('Header')).toBeInTheDocument();
  });

  it('renders the notification bar', () => {
    const { queryByTitle } = render(withStore(<PreEngagementFormPhase />));

    expect(queryByTitle('NotificationBar')).toBeInTheDocument();
  });

  it('renders the pre-engagement form inputs and labels', () => {
    const { getByPlaceholderText, getByText } = render(withStore(<PreEngagementFormPhase />));
    const nameInput = getByPlaceholderText(namePlaceholderText);
    const emailInput = getByPlaceholderText(emailPlaceholderText);
    const queryInput = getByPlaceholderText(queryPlaceholderText);
    const nameLabel = getByText(nameLabelText);
    const emailLabel = getByText(emailLabelText);
    const queryLabel = getByText(queryLabelText);

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(queryInput).toBeInTheDocument();
    expect(nameLabel).toBeInTheDocument();
    expect(emailLabel).toBeInTheDocument();
    expect(queryLabel).toBeInTheDocument();
  });

  it('changes engagement phase to loading on submit', () => {
    const { container } = render(withStore(<PreEngagementFormPhase />));
    const formBox = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(formBox);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.Loading);
  });

  it('initializes session with correct arguments on submit', async () => {
    const { container } = render(withStore(<PreEngagementFormPhase />));
    const formBox = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(formBox);

    await waitFor(() => {
      expect(initAction.initSession).toHaveBeenCalledWith({ token, conversationSid });
    });
  });

  it('renders name input value', () => {
    const { getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));

    const nameInput = getByPlaceholderText(namePlaceholderText);
    fireEvent.change(nameInput, { target: { value: name } });

    expect(nameInput).toHaveValue(name);
  });

  it('renders email input value', () => {
    const { getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));

    const emailInput = getByPlaceholderText(emailPlaceholderText);
    fireEvent.change(emailInput, { target: { value: email } });

    expect(emailInput).toHaveValue(email);
  });

  it('renders query input value', () => {
    const { getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));

    const queryInput = getByPlaceholderText(queryPlaceholderText);
    fireEvent.change(queryInput, { target: { value: query } });

    expect(queryInput).toHaveValue(query);
  });

  it('creates session with correct input values on submit', () => {
    const fetchAndStoreNewSessionSpy = jest.spyOn(sessionDataHandler, 'fetchAndStoreNewSession');

    const { container, getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));
    const formBox = container.querySelector('form') as HTMLFormElement;
    const nameInput = getByPlaceholderText(namePlaceholderText);
    const emailInput = getByPlaceholderText(emailPlaceholderText);
    const queryInput = getByPlaceholderText(queryPlaceholderText);

    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.blur(nameInput);
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.blur(emailInput);
    fireEvent.change(queryInput, { target: { value: query } });
    fireEvent.blur(queryInput);
    fireEvent.submit(formBox);

    expect(fetchAndStoreNewSessionSpy).toHaveBeenCalledWith({ formData: { friendlyName: name, query, email } });
  });
});
