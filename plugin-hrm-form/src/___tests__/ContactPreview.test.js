import React from 'react';
import renderer from 'react-test-renderer';
import moment from 'moment';

import ContactPreview from '../components/search/ContactPreview';
import { mapAndToUpper } from '../components/search/ContactPreview/ContactPreview';
import CardRow1 from '../components/search/ContactPreview/CardRow1';
import CardRow2 from '../components/search/ContactPreview/CardRow2';
import CardRow3 from '../components/search/ContactPreview/CardRow3';
import CardRow4 from '../components/search/ContactPreview/CardRow4';

jest.mock('../Styles/search', () => ({
  AlertContainer: 'AlertContainer',
  ContactWrapper: 'ContactWrapper',
  NameText: 'NameText',
  ContactButtonsWrapper: 'ContactButtonsWrapper',
  CalltypeTag: 'CalltypeTag',
  CounselorText: 'CounselorText',
  TagText: 'TagText',
  SummaryText: 'SummaryText',
  SummaryText: 'SummaryText',
  NoneTransform: 'NoneTransform',
  ContactTag: 'ContactTag',
  DateText: 'DateText',
  TagText: 'TagText',
  RowWithMargin: () => 'RowWithMargin',
  StyledIcon: () => 'StyledIcon',
}));

test('Test mapAndToUpper helper specification', () => {
  const mapSelf = 'CHILD CALLING ABOUT SELF';
  const mapCaller = 'SOMEONE CALLING ABOUT A CHILD';
  const string = 'anything else';

  expect(mapAndToUpper(mapSelf)).toEqual('SELF');
  expect(mapAndToUpper(mapCaller)).toEqual('CALLER');
  expect(mapAndToUpper(string)).toEqual('ANYTHING');
});

test('<ContactPreview> should mount', () => {
  const contact = {
    contactId: '123',
    overview: {
      dateTime: '2019-01-01T00:00:00.000Z',
      name: 'Name Last',
      customerNumber: '',
      callType: 'CHILD CALLING ABOUT SELF',
      categories: '',
      counselor: '',
      notes: '',
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
    tags: ['Tag1', 'Tag2'],
  };
  const formatedDate = moment(contact.overview.dateTime).format('MMM DD, YYYY HH:mm a');

  const onClick = jest.fn();
  const handleConnect = jest.fn();

  const component = renderer.create(
    <ContactPreview contact={contact} onClick={onClick} handleConnect={handleConnect} />,
  ).root;

  expect(() => component.findByType(CardRow1)).not.toThrow();
  expect(() => component.findByType(CardRow2)).not.toThrow();
  expect(() => component.findByType(CardRow3)).not.toThrow();
  expect(() => component.findByType(CardRow4)).not.toThrow();
  expect(() => component.findByType(NonExisting)).toThrow();

  const previewContact = component.props.contact;
  const { name } = component.findByType(CardRow1).props;
  const { callType, counselor } = component.findByType(CardRow2).props;
  const { callSummary } = component.findByType(CardRow3).props;
  const { dateString, tag1, tag2, tag3 } = component.findByType(CardRow4).props;

  expect(previewContact).toEqual(contact);
  expect(name).toEqual(contact.overview.name.toUpperCase());
  expect(callType).toEqual(mapAndToUpper(contact.overview.callType));
  expect(counselor).toEqual(contact.counselor);
  expect(callSummary).toEqual(contact.details.caseInformation.callSummary);
  expect(dateString).toEqual(formatedDate);
  expect(tag1).toEqual(contact.tags[0]);
  expect(tag2).toEqual(contact.tags[1]);
  expect(tag3).toEqual('');
});
