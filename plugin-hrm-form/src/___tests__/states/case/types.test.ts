import { isViewContact, ViewContact } from '../../../states/case/types';
import { CallerFormInformation } from '../../../components/common/forms/CallerForm';

const stringObject: string = 'string';

const viewContactObject: ViewContact = {
  contactId: 'contact-id',
  detailsExpanded: {
    section: true,
  },
  date: '8/19/2020',
  counselor: 'John Doe',
};

const callerFormInformationObject: CallerFormInformation = {
  name: {
    firstName: { value: 'John' },
    lastName: { value: 'Doe' },
  },
  relationshipToChild: { value: 'Friend' },
  gender: { value: 'Boy' },
  age: { value: '0-03' },
  language: { value: 'Language 1' },
  nationality: { value: 'Nationality 1' },
  ethnicity: { value: 'Ethnicity 1' },
  location: {
    streetAddress: { value: 'Orange St' },
    city: { value: 'San Francisco' },
    stateOrCounty: { value: 'CA' },
    postalCode: { value: '51011' },
    phone1: { value: '' },
    phone2: { value: '' },
  },
};

test('isType ViewContact', () => {
  expect(isViewContact(viewContactObject)).toBe(true);
  expect(isViewContact(callerFormInformationObject)).toBe(false);
  expect(isViewContact(stringObject)).toBe(false);
});
