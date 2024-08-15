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
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DeepPartial } from 'redux';

import { mockLocalFetchDefinitions } from '../mockFetchDefinitions';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import ContactPreview from '../../components/search/ContactPreview';
import ContactHeader from '../../components/search/ContactPreview/ContactHeader';
import TagsAndCounselor from '../../components/search/TagsAndCounselor';
import { getDefinitionVersions } from '../../hrmConfig';
import { Contact } from '../../types/types';
import { RootState } from '../../states';
import { configurationBase, namespace } from '../../states/storeNamespaces';
import { VALID_EMPTY_CONTACT } from '../testContacts';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

const mockStore = configureMockStore([]);

const NonExisting = () => <>NonExisting</>;
NonExisting.displayName = 'NonExisting';

beforeEach(() => {
  mockReset();
});

test('<ContactPreview> should mount', async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  const defaultDef = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, defaultDef);

  const counselorsHash = {
    WKxxxx: 'John Doe',
  };

  const initialState: DeepPartial<RootState> = {
    [namespace]: {
      [configurationBase]: {
        definitionVersions: {
          [DefinitionVersionId.v1]: defaultDef,
        },
        counselors: {
          hash: counselorsHash,
        },
      },
    },
  };
  const contact: Contact = {
    ...VALID_EMPTY_CONTACT,
    id: '123',
    accountSid: '',
    timeOfContact: '2019-01-01T00:00:00.000Z',
    number: '+12025550440',
    channel: 'whatsapp',
    twilioWorkerId: 'WKxxxx',
    helpline: 'test helpline',
    conversationDuration: 0,
    taskId: 'TASK_ID',
    rawJson: {
      definitionVersion: DefinitionVersionId.v1,
      callType: 'Child calling about self',
      categories: { category1: ['Tag1', 'Tag2'] },
      childInformation: {
        firstName: 'Name',
        lastName: 'Last',
        gender: '',
        age: '',
        language: '',
        nationality: '',
        ethnicity: '',
        refugee: false,
      },
      caseInformation: {
        callSummary: 'Summary',
        referredTo: '',
        status: '',
        keepConfidential: false,
        okForCaseWorkerToCall: false,
        howDidTheChildHearAboutUs: '',
        didYouDiscussRightsWithTheChild: false,
        didTheChildFeelWeSolvedTheirProblem: false,
        wouldTheChildRecommendUsToAFriend: false,
      },
      callerInformation: {},
      contactlessTask: { ...VALID_EMPTY_CONTACT.rawJson.contactlessTask, channel: 'voice' },
    },
  };

  const handleViewDetails = jest.fn();
  const store = mockStore(initialState);

  const wrapper = renderer.create(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <ContactPreview contact={contact} handleViewDetails={handleViewDetails} />
      </Provider>
    </StorelessThemeProvider>,
  ).root;

  expect(() => wrapper.findByType(ContactHeader)).not.toThrow();
  expect(() => wrapper.findByType(TagsAndCounselor)).not.toThrow();
  expect(() => wrapper.findByType(NonExisting)).toThrow();

  const { channel, callType, name, number, date } = wrapper.findByType(ContactHeader).props;
  const { counselor, categories } = wrapper.findByType(TagsAndCounselor).props;

  expect(name).toEqual('Name Last');
  expect(callType).toEqual(contact.rawJson.callType);
  expect(channel).toEqual(contact.channel);
  expect(number).toEqual(contact.number);
  expect(counselor).toEqual(counselorsHash[contact.twilioWorkerId]);
  expect(date).toEqual(contact.timeOfContact);
  expect(categories).toEqual(contact.rawJson.categories);
});
