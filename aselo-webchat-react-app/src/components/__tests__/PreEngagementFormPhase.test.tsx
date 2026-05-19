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

jest.mock('@twilio-paste/core/spinner', () => {
  // eslint-disable-next-line global-require
  const React = require('react');
  return {
    Spinner: () => React.createElement('span', { 'data-testid': 'spinner' }),
  };
});

let mockRecaptchaOnChange: ((state: 'verified' | 'unverified' | 'pending') => void) | undefined;
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
      onRecaptchaChange: (state: 'verified' | 'unverified' | 'pending') => void;
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
        location: 'http://localhost/',
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

  it('Input: form is valid when a "required" input has a DOM value but has not been blurred', async () => {
    const namePlaceholder = 'Enter name';
    const store = createValidationStore([
      {
        name: 'name',
        type: FormInputType.Input,
        label: 'Name',
        required: true,
        placeholder: namePlaceholder,
      } as PreEngagementFormItem,
    ]);
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    const nameInput = getByPlaceholderText(namePlaceholder);
    // Fill the input but do NOT blur — Redux has no value yet
    fireEvent.change(nameInput, { target: { value: 'John' } });
    await submitForm(container);
    // DOM sync on submit should have pushed the value into Redux before validation
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith({
      formData: { name: 'John', location: 'http://localhost/' },
    });
    expect(initAction.initSession).toHaveBeenCalled();
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
    const namePlaceholder = 'Enter name';
    const store = createValidationStore([
      {
        name: 'name',
        type: FormInputType.Input,
        label: 'Name',
        required: true,
        placeholder: namePlaceholder,
      } as PreEngagementFormItem,
    ]);
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    // Fill the input but do NOT blur — DOM sync on submit will capture the value
    fireEvent.change(getByPlaceholderText(namePlaceholder), { target: { value: 'John' } });
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
    const emailPlaceholder = 'Enter email';
    const store = createValidationStore([
      {
        name: 'email',
        type: FormInputType.Email,
        label: 'Email',
        required: true,
        placeholder: emailPlaceholder,
      } as PreEngagementFormItem,
    ]);
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    // Fill the input but do NOT blur — DOM sync on submit will capture the value
    fireEvent.change(getByPlaceholderText(emailPlaceholder), { target: { value: 'test@test.com' } });
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
        // Empty placeholder option ensures the select defaults to an empty value in the DOM
        options: [
          { value: '', label: 'Please select...' },
          { value: 'opt1', label: 'Option 1' },
        ],
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
    // Check the checkbox in the DOM but do NOT blur — DOM sync on submit will capture the state
    const checkbox = container.querySelector('#agree') as HTMLInputElement;
    fireEvent.click(checkbox);
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('Select: form is valid when a "required" select is changed to a non-empty option via the DOM', async () => {
    const store = createValidationStore([
      {
        name: 'choice',
        type: FormInputType.Select,
        label: 'Choice',
        required: true,
        options: [
          { value: '', label: 'Please select...' },
          { value: 'opt1', label: 'Option 1' },
        ],
      } as PreEngagementFormItem,
    ]);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    const selectEl = container.querySelector('#choice') as HTMLSelectElement;
    fireEvent.change(selectEl, { target: { value: 'opt1' } });
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalled();
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('onChange syncs field values to Redux so validation reflects the current DOM state', async () => {
    const namePlaceholder = 'Your name';
    const store = createValidationStore([
      {
        name: 'name',
        type: FormInputType.Input,
        label: 'Name',
        required: true,
        placeholder: namePlaceholder,
      } as PreEngagementFormItem,
    ]);
    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    const nameInput = getByPlaceholderText(namePlaceholder);
    // Trigger onChange without blur — setItemValue calls setPreEngagementDataFromDom which reads all DOM values
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    // Verify the value is captured during submission (not just on blur), confirming onChange syncs the DOM
    await submitForm(container);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith(
      expect.objectContaining({ formData: expect.objectContaining({ name: 'Alice' }) }),
    );
    expect(initAction.initSession).toHaveBeenCalled();
  });

  it('uses preloaded redux values as form default values through getItem for all form input types', () => {
    const namePlaceholder = 'Your name';
    const emailPlaceholder = 'Your email';
    const categoryPlaceholderLabel = 'Please select...';
    const parentLabel = 'Country';
    const dependentLabel = 'State';
    const store = createValidationStore(
      [
        {
          name: 'name',
          type: FormInputType.Input,
          label: 'Name',
          placeholder: namePlaceholder,
        } as PreEngagementFormItem,
        {
          name: 'email',
          type: FormInputType.Email,
          label: 'Email',
          placeholder: emailPlaceholder,
        } as PreEngagementFormItem,
        {
          name: 'choice',
          type: FormInputType.Select,
          label: 'Choice',
          options: [
            { value: '', label: categoryPlaceholderLabel },
            { value: 'opt1', label: 'Option 1' },
          ],
        } as PreEngagementFormItem,
        {
          name: 'country',
          type: FormInputType.Select,
          label: parentLabel,
          options: [
            { value: '', label: 'Select country' },
            { value: 'US', label: 'United States' },
            { value: 'UK', label: 'United Kingdom' },
          ],
        } as PreEngagementFormItem,
        {
          name: 'state',
          type: FormInputType.DependentSelect,
          label: dependentLabel,
          dependsOn: 'country',
          options: {
            US: [
              { value: 'CA', label: 'California' },
              { value: 'NY', label: 'New York' },
            ],
            UK: [{ value: 'ENG', label: 'England' }],
          },
        } as PreEngagementFormItem,
        {
          name: 'terms',
          type: FormInputType.Checkbox,
          label: 'Accept terms',
        } as PreEngagementFormItem,
      ],
      {
        name: { value: 'Alice', error: null, dirty: true },
        email: { value: 'alice@example.com', error: null, dirty: true },
        choice: { value: 'opt1', error: null, dirty: true },
        country: { value: 'US', error: null, dirty: true },
        state: { value: 'NY', error: null, dirty: true },
        terms: { value: true, error: null, dirty: true },
      },
    );

    const { container, getByPlaceholderText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );

    expect(getByPlaceholderText(namePlaceholder)).toHaveValue('Alice');
    expect(getByPlaceholderText(emailPlaceholder)).toHaveValue('alice@example.com');
    expect(container.querySelector('#choice')).toHaveValue('opt1');
    expect(container.querySelector('#country')).toHaveValue('US');
    expect(container.querySelector('#state')).toHaveValue('NY');
    expect(container.querySelector('#terms')).toBeChecked();
  });

  it('validation errors are hidden before the first submit attempt even when the Redux state has an error', () => {
    // Pre-populate the store with a field that already has a validation error
    const store = createValidationStore(
      [{ name: 'name', type: FormInputType.Input, label: 'Name', required: true } as PreEngagementFormItem],
      { name: { value: '', error: 'RequiredFieldError', dirty: true } },
    );
    const { queryByText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    // showError is false before any submit or field touch, so the error span must not render
    expect(queryByText('RequiredFieldError')).not.toBeInTheDocument();
  });

  it('validation errors become visible after the first submit attempt', async () => {
    const store = createValidationStore([
      { name: 'name', type: FormInputType.Input, label: 'Name', required: true } as PreEngagementFormItem,
    ]);
    const { container, queryByText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    // No error visible before submit
    expect(queryByText('RequiredFieldError')).not.toBeInTheDocument();
    // Submit with the required field empty — validation fails and wasSubmitAttempted becomes true
    await submitForm(container);
    // showError is now true for all fields, so the error span must be rendered
    expect(queryByText('RequiredFieldError')).toBeInTheDocument();
  });

  it('validation error for a field becomes visible after that field is touched without a submit', async () => {
    const namePlaceholder = 'Enter name';
    const store = createValidationStore([
      {
        name: 'name',
        type: FormInputType.Input,
        label: 'Name',
        required: true,
        placeholder: namePlaceholder,
      } as PreEngagementFormItem,
    ]);
    const { getByPlaceholderText, queryByText } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    // No error visible before any interaction
    expect(queryByText('RequiredFieldError')).not.toBeInTheDocument();
    // Blur the empty required field — this adds it to fieldsTouched and syncs the empty value to Redux
    await act(async () => {
      fireEvent.blur(getByPlaceholderText(namePlaceholder));
    });
    // showError is now true for this field (fieldsTouched.has('name')), so the error must be rendered
    expect(queryByText('RequiredFieldError')).toBeInTheDocument();
  });
});

describe('Pre Engagement Form Phase - ReCaptcha', () => {
  const recaptchaSiteKey = 'test-recaptcha-site-key';
  const aseloBackendUrl = 'https://hrm-test.tl.techmatters.org';

  const createRecaptchaStore = (enableRecaptcha: boolean, recaptchaValid: boolean = false) =>
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
        recaptchaValid,
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
    const store = createRecaptchaStore(true, true);
    const { getByTestId, container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );
    expect(getByTestId('recaptcha-mock')).toBeInTheDocument();
    const submitButton = container.querySelector('[data-test="pre-engagement-start-chat-button"]');

    expect(submitButton).not.toBeDisabled();
  });

  it('form can be submitted after ReCaptcha is verified', async () => {
    const store = createRecaptchaStore(true, true);
    const { container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );

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

  it('shows spinner (hides submit label) when recaptcha verification is in progress', async () => {
    const store = createRecaptchaStore(true);
    const { queryByTestId, container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );

    // Before pending: submit label is visible and no spinner
    expect(queryByTestId('pre-engagement-start-chat-button-label')).not.toHaveStyle({ visibility: 'hidden' });
    expect(queryByTestId('spinner')).not.toBeInTheDocument();

    // Simulate recaptcha pending state via the captured callback
    await act(async () => {
      mockRecaptchaOnChange!('pending');
    });

    // Submit label should now be hidden and spinner visible
    expect(queryByTestId('pre-engagement-start-chat-button-label')).toHaveStyle({ visibility: 'hidden' });
    expect(queryByTestId('spinner')).toBeInTheDocument();
    // Button remains disabled while pending (recaptcha not yet verified)
    const submitButton = container.querySelector('[data-test="pre-engagement-start-chat-button"]');
    expect(submitButton).toBeDisabled();
  });

  it('hides spinner when recaptcha verification completes', async () => {
    const store = createRecaptchaStore(true);
    const { queryByTestId, container } = render(
      <Provider store={store}>
        <PreEngagementFormPhase />
      </Provider>,
    );

    await act(async () => {
      mockRecaptchaOnChange!('pending');
    });
    expect(queryByTestId('pre-engagement-start-chat-button-label')).toHaveStyle({ visibility: 'hidden' });
    expect(queryByTestId('spinner')).toBeInTheDocument();

    await act(async () => {
      mockRecaptchaOnChange!('verified');
    });

    // Submit label visible again, spinner gone, and button enabled
    expect(queryByTestId('pre-engagement-start-chat-button-label')).not.toHaveStyle({ visibility: 'hidden' });
    expect(queryByTestId('spinner')).not.toBeInTheDocument();
    const submitButton = container.querySelector('[data-test="pre-engagement-start-chat-button"]');
    expect(submitButton).not.toBeDisabled();
  });
});
