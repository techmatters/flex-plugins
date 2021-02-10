import React from 'react';
import renderer from 'react-test-renderer';
import { format } from 'date-fns';

import '../mockStyled';
import '../mockGetConfig';

import ContactPreview from '../../components/search/ContactPreview';
import ChildNameAndDate from '../../components/search/ContactPreview/ChildNameAndDate';
import CallSummary from '../../components/search/ContactPreview/CallSummary';
import TagsAndCounselor from '../../components/search/ContactPreview/TagsAndCounselor';
import { mapCallType } from '../../utils';

const NonExisting = () => <>NonExisting</>;
NonExisting.displayName = 'NonExisting';

test('<ContactPreview> should mount', () => {
  const contact = {
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
    },
    details: {
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
        location: {},
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
    },
    counselor: 'Counselor',
  };

  const handleOpenConnectDialog = jest.fn();
  const handleViewDetails = jest.fn();

  const component = renderer.create(
    <ContactPreview
      contact={contact}
      handleOpenConnectDialog={handleOpenConnectDialog}
      handleViewDetails={handleViewDetails}
    />,
  ).root;

  expect(() => component.findByType(ChildNameAndDate)).not.toThrow();
  expect(() => component.findByType(CallSummary)).not.toThrow();
  expect(() => component.findByType(TagsAndCounselor)).not.toThrow();
  expect(() => component.findByType(NonExisting)).toThrow();

  const previewContact = component.props.contact;
  const { channel, callType, name, number, date } = component.findByType(ChildNameAndDate).props;
  const { callSummary } = component.findByType(CallSummary).props;
  const { counselor, categories } = component.findByType(TagsAndCounselor).props;

  expect(previewContact).toEqual(contact);
  expect(name).toEqual(contact.overview.name);
  expect(callType).toEqual(mapCallType(contact.overview.callType));
  expect(channel).toEqual(contact.overview.channel);
  expect(number).toEqual(contact.overview.customerNumber);
  expect(callSummary).toEqual(contact.details.caseInformation.callSummary);
  expect(counselor).toEqual(contact.counselor);
  expect(date).toEqual(contact.overview.dateTime);
  expect(categories).toEqual(contact.overview.categories);
});
