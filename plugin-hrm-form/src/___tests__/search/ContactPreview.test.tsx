import * as React from 'react';
import renderer from 'react-test-renderer';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import ContactPreview from '../../components/search/ContactPreview';
import ContactHeader from '../../components/search/ContactPreview/ChildNameAndDate';
import TagsAndCounselor from '../../components/search/ContactPreview/TagsAndCounselor';
import { mapCallType } from '../../utils';
import { getDefinitionVersions } from '../../HrmFormPlugin';
import { SearchUIContact } from '../../types/types';

const NonExisting = () => <>NonExisting</>;
NonExisting.displayName = 'NonExisting';

test('<ContactPreview> should mount', async () => {
  mockGetDefinitionsResponse(
    getDefinitionVersions,
    DefinitionVersionId.v1,
    await loadDefinition(DefinitionVersionId.v1),
  );
  const contact: SearchUIContact = {
    contactId: '123',
    overview: {
      dateTime: '2019-01-01T00:00:00.000Z',
      channel: 'whatsapp',
      name: 'Name Last',
      customerNumber: '+12025550440',
      callType: 'CHILD CALLING ABOUT SELF',
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
        name: {
          firstName: 'Name',
          lastName: 'Last',
        },
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
      callerInformation: { name: { firstName: '', lastName: '' } },
      contactlessTask: { channel: 'voice' },
    },
    counselorName: 'Counselor',
    csamReports: [],
  };

  const handleOpenConnectDialog = jest.fn();
  const handleViewDetails = jest.fn();

  const wrapper = renderer.create(
    <StorelessThemeProvider themeConf={{}}>
      <ContactPreview
        contact={contact}
        handleOpenConnectDialog={handleOpenConnectDialog}
        handleViewDetails={handleViewDetails}
      />
    </StorelessThemeProvider>,
  ).root;

  const component = wrapper.findByType(ContactPreview);

  expect(() => component.findByType(ContactHeader)).not.toThrow();
  expect(() => component.findByType(TagsAndCounselor)).not.toThrow();
  expect(() => component.findByType(NonExisting)).toThrow();

  const previewContact = component.props.contact;
  const { channel, callType, name, number, date } = component.findByType(ContactHeader).props;
  const { counselor, categories } = component.findByType(TagsAndCounselor).props;

  expect(previewContact).toEqual(contact);
  expect(name).toEqual(contact.overview.name);
  expect(callType).toEqual(mapCallType(contact.overview.callType));
  expect(channel).toEqual(contact.overview.channel);
  expect(number).toEqual(contact.overview.customerNumber);
  expect(counselor).toEqual(contact.counselorName);
  expect(date).toEqual(contact.overview.dateTime);
  expect(categories).toEqual(contact.overview.categories);
});
