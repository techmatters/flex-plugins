import React from 'react';
import renderer from 'react-test-renderer';
import { format } from 'date-fns';

import '../mockStyled';

import ContactPreview from '../../components/search/ContactPreview';
import ChildNameAndDate from '../../components/search/ContactPreview/ChildNameAndDate';
import CallTypeAndCounselor from '../../components/search/ContactPreview/CallTypeAndCounselor';
import CallSummary from '../../components/search/ContactPreview/CallSummary';
import DateAndTags from '../../components/search/ContactPreview/TagsAndCounselor';
import { mapCallType } from '../../utils';

const NonExisting = () => <>NonExisting</>;
NonExisting.displayName = 'NonExisting';

test('<ContactPreview> should mount', () => {
  const contact = {
    contactId: '123',
    overview: {
      dateTime: '2019-01-01T00:00:00.000Z',
      name: 'Name Last',
      customerNumber: '',
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
  const formatedDate = `${format(new Date(contact.overview.dateTime), 'MMM d, yyyy h:mm aaaaa')}m`;

  const handleOpenConnectDialog = jest.fn();
  const handleViewDetails = jest.fn();
  const handleMockedMessage = jest.fn();

  const component = renderer.create(
    <ContactPreview
      contact={contact}
      handleOpenConnectDialog={handleOpenConnectDialog}
      handleViewDetails={handleViewDetails}
      handleMockedMessage={handleMockedMessage}
    />,
  ).root;

  expect(() => component.findByType(ChildNameAndDate)).not.toThrow();
  expect(() => component.findByType(CallTypeAndCounselor)).not.toThrow();
  expect(() => component.findByType(CallSummary)).not.toThrow();
  expect(() => component.findByType(DateAndTags)).not.toThrow();
  expect(() => component.findByType(NonExisting)).toThrow();

  const previewContact = component.props.contact;
  const { name } = component.findByType(ChildNameAndDate).props;
  const { callType, counselor } = component.findByType(CallTypeAndCounselor).props;
  const { callSummary } = component.findByType(CallSummary).props;
  const { dateString, category1, category2, category3 } = component.findByType(DateAndTags).props;

  expect(previewContact).toEqual(contact);
  expect(name).toEqual(contact.overview.name.toUpperCase());
  expect(callType).toEqual(mapCallType(contact.overview.callType));
  expect(counselor).toEqual(contact.counselor);
  expect(callSummary).toEqual(contact.details.caseInformation.callSummary);
  expect(dateString).toEqual(formatedDate);
  expect(category1).toEqual(contact.overview.categories.category1[0]);
  expect(category2).toEqual(contact.overview.categories.category1[1]);
  expect(category3).toEqual('');
});
