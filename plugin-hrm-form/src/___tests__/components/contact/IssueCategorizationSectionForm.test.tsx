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
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import IssueCategorizationSectionForm from '../../../components/contact/IssueCategorizationSectionForm';
import { ToggleViewButton } from '../../../styles';
import { setCategoriesGridView } from '../../../states/contacts/existingContacts';
import { forExistingContact } from '../../../states/contacts/issueCategorizationStateApi';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { FeatureFlags } from '../../../types/types';
import { contactFormsBase, namespace } from '../../../states/storeNamespaces';

jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    clearErrors: jest.fn(),
    register: jest.fn(),
  }),
}));
jest.mock('../../../components/CSAMReport/CSAMReportFormDefinition');
jest.mock('../../../hrmConfig');

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

let mockV1;
const helpline = 'ChildLine Zambia (ZM)';
let definition;

// Copy paste from state/contacts initial state
let expanded;

const contactId = 'contact-id';
const mockStore = configureMockStore([]);

const mockGetAseloFeatureFlags = getAseloFeatureFlags as jest.MockedFunction<typeof getAseloFeatureFlags>;

mockGetAseloFeatureFlags.mockReturnValue(
  // eslint-disable-next-line camelcase
  { enable_counselor_toolkits: true } as FeatureFlags,
);

const getGridIcon = wrapper => wrapper.find(ToggleViewButton).at(0);
const getListIcon = wrapper => wrapper.find(ToggleViewButton).at(1);

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  definition = mockV1.tabbedForms.IssueCategorizationTab(helpline);
  expanded = Object.keys(definition).reduce((acc, category) => ({ ...acc, [category]: false }), {});
  // eslint-disable-next-line camelcase
});

test('Click on view subcategories as grid icon', () => {
  const store = mockStore({
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          [contactId]: { metadata: { categories: { expanded, gridView: false } }, savedContact: VALID_EMPTY_CONTACT },
        },
      },
    },
  });
  store.dispatch = jest.fn();

  const wrapper = mount(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <IssueCategorizationSectionForm
          autoFocus={true}
          definition={definition}
          display={true}
          stateApi={forExistingContact(contactId)}
        />
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(store.dispatch).not.toHaveBeenCalled();

  getGridIcon(wrapper).simulate('click');

  expect(store.dispatch).toHaveBeenCalled();
  expect(store.dispatch).toHaveBeenCalledWith(setCategoriesGridView(contactId, true));
  store.dispatch.mockClear();
});

test('Click on view subcategories as list icon', () => {
  const store = mockStore({
    [namespace]: {
      [contactFormsBase]: {
        existingContacts: {
          [contactId]: {
            savedContact: { ...VALID_EMPTY_CONTACT },
            metadata: { categories: { expanded, gridView: false } },
          },
        },
      },
    },
  });
  store.dispatch = jest.fn();

  const wrapper = mount(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <IssueCategorizationSectionForm
          autoFocus={true}
          definition={definition}
          display={true}
          stateApi={forExistingContact(contactId)}
        />
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(store.dispatch).not.toHaveBeenCalled();

  getListIcon(wrapper).simulate('click');

  expect(store.dispatch).toHaveBeenCalled();
  expect(store.dispatch).toHaveBeenCalledWith(setCategoriesGridView(contactId, false));
  store.dispatch.mockClear();
});
