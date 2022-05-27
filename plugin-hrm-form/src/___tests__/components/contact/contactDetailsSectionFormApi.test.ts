import each from 'jest-each';
import { DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import {
  ContactDetailsSectionFormApi,
  contactDetailsSectionFormApi,
  ContactFormValues,
  IssueCategorizationSectionFormApi,
} from '../../../components/contact/contactDetailsSectionFormApi';
import { SearchContact } from '../../../types/types';
import details from '../../../components/case/casePrint/styles/details';

let definition: DefinitionVersion;

beforeAll(async () => {
  const v1Def = await loadDefinition(DefinitionVersionId.v1);
  definition = {
    ...v1Def,
    tabbedForms: {
      ...v1Def.tabbedForms,
      ChildInformationTab: [
        { name: 'firstName', type: 'input', label: '' },
        { name: 'lastName', type: 'input', label: '' },
        { name: 'otherProp', type: 'input', label: '' },
      ],
      CallerInformationTab: [
        { name: 'firstName', type: 'input', label: '' },
        { name: 'lastName', type: 'input', label: '' },
        { name: 'prop', type: 'input', label: '' },
      ],
      CaseInformationTab: [
        { name: 'prop1', type: 'input', label: '' },
        { name: 'prop2', type: 'input', label: '' },
      ],
      IssueCategorizationTab: helpline => {
        if (helpline !== 'test helpline') throw Error();
        return {
          category1: { color: '', subcategories: ['sub1', 'sub2', 'sub3', 'sub4'] },
          category2: { color: '', subcategories: ['sub1', 'sub2', 'sub3', 'sub4'] },
        };
      },
    },
  };
});

const emptySearchContact: SearchContact = {
  contactId: '0',
  overview: {
    helpline: undefined,
    dateTime: undefined,
    name: undefined,
    customerNumber: undefined,
    callType: undefined,
    categories: {},
    counselor: undefined,
    notes: undefined,
    channel: undefined,
    conversationDuration: undefined,
    createdBy: undefined,
  },
  csamReports: [],
  details: {
    childInformation: {
      name: { firstName: undefined, lastName: undefined },
    },
    callerInformation: {
      name: { firstName: undefined, lastName: undefined },
    },
    caseInformation: {
      categories: {},
    },
    callType: undefined,
    contactlessTask: {},
  },
};

describe('getFormValues', () => {
  test('CHILD_INFORMATION - unnests name, and creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CHILD_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        details: {
          ...emptySearchContact.details,
          childInformation: {
            name: {
              firstName: 'Lorna',
              lastName: 'Ballantyne',
            },
          },
        },
      }),
    ).toStrictEqual({
      childInformation: {
        firstName: 'Lorna',
        lastName: 'Ballantyne',
        otherProp: undefined,
      },
    });
  });
  test('CALLER_INFORMATION - unnests name, and creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CALLER_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        details: {
          ...emptySearchContact.details,
          callerInformation: {
            name: {
              firstName: 'Lorna',
              lastName: 'Ballantyne',
            },
          },
        },
      }),
    ).toStrictEqual({
      callerInformation: {
        firstName: 'Lorna',
        lastName: 'Ballantyne',
        prop: undefined,
      },
    });
  });
  test('ISSUE_CATEGORIZATION - flattens overview categories into single string array', () => {
    expect(
      contactDetailsSectionFormApi.ISSUE_CATEGORIZATION.getFormValues(definition, {
        ...emptySearchContact,
        overview: {
          ...emptySearchContact.overview,
          categories: {
            category1: ['sub2', 'sub4'],
            category2: ['sub1', 'sub4'],
          },
        },
      }),
    ).toStrictEqual({
      categories: expect.arrayContaining([
        'categories.category1.sub2',
        'categories.category1.sub4',
        'categories.category2.sub1',
        'categories.category2.sub4',
      ]),
    });
  });
  test('CASE_INFORMATION - creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CASE_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        details: {
          ...emptySearchContact.details,
          caseInformation: {
            prop1: 'something',
            categories: emptySearchContact.details.caseInformation.categories,
          },
        },
      }),
    ).toStrictEqual({
      caseInformation: {
        prop1: 'something',
      },
    });
  });
});

describe('formToPayload', () => {
  test('CHILD_INFORMATION - nests name, and wraps in a contact payload structure', () => {
    expect(
      contactDetailsSectionFormApi.CHILD_INFORMATION.formToPayload(definition, {
        childInformation: {
          firstName: 'Lorna',
          otherProp: 'something',
        },
      }),
    ).toStrictEqual({
      rawJson: {
        childInformation: {
          name: {
            firstName: 'Lorna',
            lastName: undefined,
          },
          otherProp: 'something',
        },
      },
    });
  });

  test('CALLER_INFORMATION - nests name, and wraps in a contact payload structure', () => {
    expect(
      contactDetailsSectionFormApi.CALLER_INFORMATION.formToPayload(definition, {
        callerInformation: {
          firstName: 'Lorna',
          prop: 'something',
        },
      }),
    ).toStrictEqual({
      rawJson: {
        callerInformation: {
          name: {
            firstName: 'Lorna',
            lastName: undefined,
          },
          prop: 'something',
        },
      },
    });
  });
  test('ISSUE_CATEGORIZATION - builds map of boolean maps from flattened category paths', () => {
    expect(
      contactDetailsSectionFormApi.ISSUE_CATEGORIZATION.formToPayload(
        definition,
        {
          categories: [
            'categories.category1.sub2',
            'categories.category1.sub4',
            'categories.category2.sub1',
            'categories.category2.sub4',
          ],
        },
        'test helpline',
      ),
    ).toStrictEqual({
      rawJson: {
        caseInformation: {
          categories: {
            category1: { sub1: false, sub2: true, sub3: false, sub4: true },
            category2: { sub1: true, sub2: false, sub3: false, sub4: true },
          },
        },
      },
    });
  });
  test('CASE_INFORMATION - creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CASE_INFORMATION.formToPayload(definition, {
        caseInformation: {
          prop1: 'yerp',
        },
      }),
    ).toStrictEqual({
      rawJson: {
        caseInformation: {
          prop1: 'yerp',
          prop2: undefined,
        },
      },
    });
  });
});
