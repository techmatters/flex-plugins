import * as React from 'react';
import renderer from 'react-test-renderer';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { callTypes, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DeepPartial } from 'redux';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import ContactPreview from '../../components/search/ContactPreview';
import ContactHeader from '../../components/search/ContactPreview/ContactHeader';
import TagsAndCounselor from '../../components/search/TagsAndCounselor';
import { getDefinitionVersions } from '../../HrmFormPlugin';
import { SearchUIContact } from '../../types/types';
import { configurationBase, namespace, RootState } from '../../states';

const mockStore = configureMockStore([]);

const NonExisting = () => <>NonExisting</>;
NonExisting.displayName = 'NonExisting';

test('<ContactPreview> should mount', async () => {
  const defaultDef = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, defaultDef);

  const initialState: DeepPartial<RootState> = {
    [namespace]: {
      [configurationBase]: {
        definitionVersions: {
          [DefinitionVersionId.v1]: defaultDef,
        },
      },
    },
  };
  const contact: SearchUIContact = {
    contactId: '123',
    overview: {
      dateTime: '2019-01-01T00:00:00.000Z',
      channel: 'whatsapp',
      customerNumber: '+12025550440',
      callType: 'Child calling about self',
      counselor: '',
      notes: '',
      categories: { category1: ['Tag1', 'Tag2'] },
      helpline: 'test helpline',
      conversationDuration: 0,
      createdBy: '',
      taskId: 'TASK_ID',
    },
    details: {
      definitionVersion: DefinitionVersionId.v1,
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
        categories: {},
      },
      callType: 'Someone calling about a child',
      conversationMedia: [],
      callerInformation: {},
      contactlessTask: { channel: 'voice' },
    },
    counselorName: 'Counselor',
    csamReports: [],
  };

  const handleOpenConnectDialog = jest.fn();
  const handleViewDetails = jest.fn();
  const store = mockStore(initialState);

  const wrapper = renderer.create(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <ContactPreview
          contact={contact}
          handleOpenConnectDialog={handleOpenConnectDialog}
          handleViewDetails={handleViewDetails}
        />
      </Provider>
    </StorelessThemeProvider>,
  ).root;

  expect(() => wrapper.findByType(ContactHeader)).not.toThrow();
  expect(() => wrapper.findByType(TagsAndCounselor)).not.toThrow();
  expect(() => wrapper.findByType(NonExisting)).toThrow();

  const { channel, callType, name, number, date } = wrapper.findByType(ContactHeader).props;
  const { counselor, categories } = wrapper.findByType(TagsAndCounselor).props;

  expect(name).toEqual('Name Last');
  expect(callType).toEqual(contact.overview.callType);
  expect(channel).toEqual(contact.overview.channel);
  expect(number).toEqual(contact.overview.customerNumber);
  expect(counselor).toEqual(contact.counselorName);
  expect(date).toEqual(contact.overview.dateTime);
  expect(categories).toEqual(contact.overview.categories);
});
