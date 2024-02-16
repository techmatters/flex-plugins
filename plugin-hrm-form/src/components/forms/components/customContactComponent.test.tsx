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
import '@testing-library/jest-dom/extend-expect';
import { FormInputType } from 'hrm-form-definitions';

import customContactComponentRegistry from '../customContactComponentRegistry';
import { generateCustomContactFormItem } from './customContactComponent';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe('generateCustomContactFormItem', () => {
  beforeAll(() => {
    customContactComponentRegistry.register('fake-component', parameters => (
      <div data-testid={`fake-contact-component-${parameters.name}-${parameters.contactId}`}>
        fake component, contactId: {parameters.contactId}
      </div>
    ));
    customContactComponentRegistry.register('broken-component', () => {
      throw new Error('This component is broken');
    });
  });

  test('should render component passing in contactId if contactId provided in context', () => {
    render(
      generateCustomContactFormItem(
        {
          type: FormInputType.CustomContactComponent,
          name: 'test',
          label: 'Custom Component',
          component: 'fake-component',
          saveable: false,
        },
        'mock-input-id',
        { contactId: 'contact-id' },
      ),
    );
    expect(screen.getByTestId('fake-contact-component-test-contact-id')).toBeInTheDocument();
  });

  test('should render placeholder message if component not registered', () => {
    render(
      generateCustomContactFormItem(
        {
          type: FormInputType.CustomContactComponent,
          name: 'test',
          label: 'Unregistered Component',
          component: 'unregistered-component',
          saveable: false,
        },
        'mock-input-id',
        { contactId: 'contact-id' },
      ),
    );
    expect(screen.getByTestId('unregistered-error-mock-input-id')).toBeInTheDocument();
  });

  test('should render placeholder message if taskSid or contactId are not provided in the context', () => {
    render(
      generateCustomContactFormItem(
        {
          type: FormInputType.CustomContactComponent,
          name: 'test',
          label: 'Custom Component',
          component: 'fake-component',
          saveable: false,
        },
        'mock-input-id',
        {},
      ),
    );
    expect(screen.getByTestId('context-error-mock-input-id')).toBeInTheDocument();
  });

  test('should render placeholder message if the component generator function throw', () => {
    render(
      generateCustomContactFormItem(
        {
          type: FormInputType.CustomContactComponent,
          name: 'test',
          label: 'Broken Component',
          component: 'broken-component',
          saveable: false,
        },
        'mock-input-id',
        { contactId: 'contact-id' },
      ),
    );
    expect(screen.getByTestId('unhandled-error-mock-input-id')).toBeInTheDocument();
  });
});
