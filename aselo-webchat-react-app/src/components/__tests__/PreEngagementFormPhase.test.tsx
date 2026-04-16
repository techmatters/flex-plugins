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
import { FormInputType, PreEngagementFormItem } from 'hrm-form-definitions';

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

let mockRecaptchaOnChange: ((verified: boolean) => void) | undefined;
jest.mock('../ReCaptcha', () => {
  // eslint-disable-next-line global-require
  const React = require('react');
  return {
    __esModule: true,
    default: ({
      onRecaptchaChange,
    }: {
      siteKey: string;
      recaptchaVerifyUrl: string;
      onRecaptchaChange: (verified: boolean) => void;
    }) => {
      mockRecaptchaOnChange = onRecaptchaChange;
      return React.createElement('div', { 'data-testid': 'recaptcha-mock' });
    },
  };
});

describe('Pre Engagement Form Phase', () => {
  const namePlaceholderText = 'Please enter your name';
  const emailPlaceholderText = 'Please enter your email address';
  const queryPlaceholderText = 'Ask a question';
  const nameLabelText = 'Name';
  const emailLabelText = 'Email address';
  const queryLabelText = 'How can we help you?';

  const name = 'John';
  const email = 'email@email.com';
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

    expect(fetchAndStoreNewSessionSpy).toHaveBeenCalledWith({
      formData: {
        friendlyName: name,
        query,
        email,
      },
    });
  });
});

describe('Pre Engagement Form Phase - validation', () => {
  const createValidationStore = (fields: PreEngagementFormItem[], preEngagementData: Record<string, any> = {}) =>
    preloadStore({
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
          submitLabel: 'Submit',
          fields,
        },
      },
      session: {
        currentPhase: EngagementPhase.PreEngagementForm,
        expanded: false,
        preEngagementData,
      },
    });

  const submitForm = async (container: HTMLElement) => {
    const formBox = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(formBox);
    });
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(sessionDataHandler, 'fetchAndStoreNewSession').mockReturnValue({ token, conversationSid } as any);
    jest.spyOn(initAction, 'initSession').mockImplementation((data: any) => data);
  });

  it('Input: form is not valid when a "required" input is empty', async () => {
    const store = createValidationStore([
      { name: 'name', type: FormInputType.Input, label: 'Name', required: true } as PreEngagementFormItem,
    ]);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
    expect(initAction.initSession).not.toHaveBeenCalled();
  });

  it('Input: form is valid when a "required" input has a value', async () => {
    const store = createValidationStore(
      [{ name: 'name', type: FormInputType.Input, label: 'Name', required: true } as PreEngagementFormItem],
      { name: { value: 'John', error: null, dirty: true } },
    );
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('Email: form is not valid when a "required" email input is empty', async () => {
    const store = createValidationStore([
      { name: 'email', type: FormInputType.Email, label: 'Email', required: true } as PreEngagementFormItem,
    ]);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
    expect(initAction.initSession).not.toHaveBeenCalled();
  });

  it('Email: form is valid when a "required" email input has a valid email', async () => {
    const store = createValidationStore(
      [{ name: 'email', type: FormInputType.Email, label: 'Email', required: true } as PreEngagementFormItem],
      { email: { value: 'test@test.com', error: null, dirty: true } },
    );
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('Email: form is not valid when email does not match EMAIL_PATTERN', async () => {
    const emailPlaceholder = 'Enter email';
    const store = createValidationStore([
      {
        name: 'email',
        type: FormInputType.Email,
        label: 'Email',
        placeholder: emailPlaceholder,
      } as PreEngagementFormItem,
    ]);
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    const emailInput = getByPlaceholderText(emailPlaceholder);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.blur(emailInput);
    await submitForm(container);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
    expect(initAction.initSession).not.toHaveBeenCalled();
  });

  it('Email: form is valid when email matches EMAIL_PATTERN', async () => {
    const store = createValidationStore(
      [{ name: 'email', type: FormInputType.Email, label: 'Email' } as PreEngagementFormItem],
      { email: { value: 'test@test.com', error: null, dirty: true } },
    );
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('Select: form is not valid when a "required" select input is empty', async () => {
    const store = createValidationStore([
      {
        name: 'choice',
        type: FormInputType.Select,
        label: 'Choice',
        required: true,
        options: [{ value: 'opt1', label: 'Option 1' }],
      } as PreEngagementFormItem,
    ]);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
    expect(initAction.initSession).not.toHaveBeenCalled();
  });

  it('Select: form is valid when a "required" select input has a value', async () => {
    const store = createValidationStore(
      [
        {
          name: 'choice',
          type: FormInputType.Select,
          label: 'Choice',
          required: true,
          options: [{ value: 'opt1', label: 'Option 1' }],
        } as PreEngagementFormItem,
      ],
      { choice: { value: 'opt1', error: null, dirty: true } },
    );
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('DependentSelect: form is not valid when a "required" dependent select input is empty', async () => {
    const store = createValidationStore([
      {
        name: 'parent',
        type: FormInputType.Select,
        label: 'Parent',
        options: [{ value: 'parentVal', label: 'Parent Option' }],
      },
      {
        name: 'child',
        type: FormInputType.DependentSelect,
        label: 'Child',
        required: true,
        dependsOn: 'parent',
        defaultOption: { value: '', label: '' },
        options: { parentVal: [{ value: 'childVal', label: 'Child Option' }] },
      },
    ] as PreEngagementFormItem[]);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
    expect(initAction.initSession).not.toHaveBeenCalled();
  });

  it('DependentSelect: form is valid when a "required" dependent select input has a value', async () => {
    const store = createValidationStore(
      [
        {
          name: 'parent',
          type: FormInputType.Select,
          label: 'Parent',
          options: [{ value: 'parentVal', label: 'Parent Option' }],
        },
        {
          name: 'child',
          type: FormInputType.DependentSelect,
          label: 'Child',
          required: true,
          dependsOn: 'parent',
          defaultOption: { value: '', label: '' },
          options: { parentVal: [{ value: 'childVal', label: 'Child Option' }] },
        },
      ] as PreEngagementFormItem[],
      {
        parent: { value: 'parentVal', error: null, dirty: true },
        child: { value: 'childVal', error: null, dirty: true },
      },
    );
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('Checkbox: form is not valid when a "required" checkbox is unchecked', async () => {
    const store = createValidationStore([
      {
        name: 'agree',
        type: FormInputType.Checkbox,
        label: 'I agree',
        required: { value: true, message: 'RequiredFieldError' },
      } as PreEngagementFormItem,
    ]);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
    expect(initAction.initSession).not.toHaveBeenCalled();
  });

  it('Checkbox: form is valid when a "required" checkbox is checked', async () => {
    const store = createValidationStore(
      [
        {
          name: 'agree',
          type: FormInputType.Checkbox,
          label: 'I agree',
          required: { value: true, message: 'RequiredFieldError' },
        } as PreEngagementFormItem,
      ],
      { agree: { value: true, error: null, dirty: true } },
    );
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });
});

describe('Pre Engagement Form Phase - ReCaptcha', () => {
  const recaptchaSiteKey = 'test-recaptcha-site-key';
  const aseloBackendUrl = 'https://hrm-test.tl.techmatters.org';

  const createRecaptchaStore = (enableRecaptcha: boolean) =>
    preloadStore({
      config: {
        environment: 'test',
        helplineCode: '',
        quickExitUrl: 'https://',
        translations: {},
        defaultLocale: 'en-US',
        deploymentKey: '',
        aseloBackendUrl,
        definitionVersion: '',
        preEngagementFormDefinition: {
          description: 'Description',
          submitLabel: 'Submit',
          fields: [{ name: 'name', type: FormInputType.Input, label: 'Name' } as PreEngagementFormItem],
        },
        enableRecaptcha,
        recaptchaSiteKey,
      },
      session: {
        currentPhase: EngagementPhase.PreEngagementForm,
        expanded: false,
        preEngagementData: {},
      },
    });

  beforeEach(() => {
    jest.resetAllMocks();
    mockRecaptchaOnChange = undefined;
    jest.spyOn(sessionDataHandler, 'fetchAndStoreNewSession').mockReturnValue({ token, conversationSid } as any);
    jest.spyOn(initAction, 'initSession').mockImplementation((data: any) => data);
  });

  it('renders ReCaptcha widget when enableRecaptcha is true and recaptchaSiteKey is set', () => {
    const store = createRecaptchaStore(true);
    const { getByTestId } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    expect(getByTestId('recaptcha-mock')).toBeInTheDocument();
  });

  it('does not render ReCaptcha widget when enableRecaptcha is false', () => {
    const store = createRecaptchaStore(false);
    const { queryByTestId } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    expect(queryByTestId('recaptcha-mock')).not.toBeInTheDocument();
  });

  it('submit button is disabled when enableRecaptcha is true and ReCaptcha is not verified', () => {
    const store = createRecaptchaStore(true);
    const { getByTestId, container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    expect(getByTestId('recaptcha-mock')).toBeInTheDocument();
    const submitButton = container.querySelector('[data-test="pre-engagement-start-chat-button"]');
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled after ReCaptcha is verified', async () => {
    const store = createRecaptchaStore(true);
    const { getByTestId, container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    expect(getByTestId('recaptcha-mock')).toBeInTheDocument();
    const submitButton = container.querySelector('[data-test="pre-engagement-start-chat-button"]');
    expect(submitButton).toBeDisabled();

    await act(async () => {
      mockRecaptchaOnChange?.(true);
    });

    expect(submitButton).not.toBeDisabled();
  });

  it('form can be submitted after ReCaptcha is verified', async () => {
    const store = createRecaptchaStore(true);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    await act(async () => {
      mockRecaptchaOnChange?.(true);
    });

    const formBox = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(formBox);

    expect(store.getState().session.currentPhase).toBe(EngagementPhase.Loading);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
  });

  it('form cannot be submitted when ReCaptcha is enabled but not verified', () => {
    const store = createRecaptchaStore(true);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    const formBox = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(formBox);

    expect(store.getState().session.currentPhase).toBe(EngagementPhase.PreEngagementForm);
    expect(sessionDataHandler.fetchAndStoreNewSession).not.toHaveBeenCalled();
  });
});
