import { hrmServiceContactToSearchContact, retrieveCategories } from '../../../states/contacts/contactDetailsAdapter';

describe('retrieveCategories', () => {
  test('falsy input, empty object output', () => expect(retrieveCategories(null)).toStrictEqual({}));
  test('empty object input, empty object output', () => expect(retrieveCategories({})).toStrictEqual({}));
  test('Categories with enabled subcategories input, categories with enables subcategories in a list as output', () =>
    expect(
      retrieveCategories({
        category1: { sub1: true, sub2: false, sub3: true },
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toStrictEqual({ category1: ['sub1', 'sub3'], category2: ['sub1', 'sub2'] }));
  test('Falsy categories - throw', () =>
    expect(() =>
      retrieveCategories({
        category1: null,
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toThrow());
  test('Categories with no subcategories input, not included in output', () =>
    expect(
      retrieveCategories({
        category1: {},
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toStrictEqual({ category2: ['sub1', 'sub2'] }));
  test('Categories with no enabled subcategories input, not included in output', () =>
    expect(
      retrieveCategories({
        category1: { sub1: false, sub2: false, sub3: false },
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toStrictEqual({ category2: ['sub1', 'sub2'] }));
});

describe('hrmServiceContactToSearchContact', () => {
  const emptyOverview = {
    helpline: undefined,
    dateTime: undefined,
    name: 'undefined undefined',
    customerNumber: undefined,
    callType: undefined,
    categories: {},
    counselor: undefined,
    notes: undefined,
    channel: undefined,
    conversationDuration: undefined,
    createdBy: undefined,
  };

  test('input rawJson.caseInformation.categories are converted using retrieveCategories and added to overview', () => {
    const input = {
      rawJson: {
        caseInformation: {
          categories: {
            category1: { sub1: true, sub2: false, sub3: true },
            category2: { sub1: true, sub2: true, sub3: false },
          },
        },
        childInformation: { name: {} },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: {
        ...emptyOverview,
        categories: { category1: ['sub1', 'sub3'], category2: ['sub1', 'sub2'] },
      },
      details: input.rawJson,
      csamReports: undefined,
    });
  });

  test('input conversationDuration, channel, createdBy & helpline are added to overview as is', () => {
    const input = {
      rawJson: {
        caseInformation: {},
        childInformation: { name: {} },
      },
      conversationDuration: 1234,
      helpline: 'my-helpline',
      createdBy: 'bob',
      channel: 'a channel',
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: {
        ...emptyOverview,
        conversationDuration: input.conversationDuration,
        helpline: input.helpline,
        createdBy: input.createdBy,
        channel: input.channel,
      },
      details: input.rawJson,
      csamReports: undefined,
    });
  });

  test('input csamReports are added to top level as is', () => {
    const input = {
      rawJson: {
        caseInformation: {},
        childInformation: { name: {} },
      },
      csamReports: [{ with: 'something' }],
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: emptyOverview,
      csamReports: input.csamReports,
      details: input.rawJson,
    });
  });

  test('input rawJson.callType is added to overview as is', () => {
    const input = {
      rawJson: {
        callType: 'a call type',
        caseInformation: {},
        childInformation: { name: {} },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, callType: input.rawJson.callType },
      csamReports: undefined,
      details: input.rawJson,
    });
  });

  test('input id is added to top level as contactId', () => {
    const input = {
      id: 'an id',
      rawJson: {
        caseInformation: {},
        childInformation: { name: {} },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: input.id,
      overview: emptyOverview,
      csamReports: undefined,
      details: input.rawJson,
    });
  });

  test("firstName and lastName from rawJson.childInformation.name are concatenated and added to overview as 'name'", () => {
    const input = {
      rawJson: {
        caseInformation: {},
        childInformation: { name: { firstName: 'Lorna', lastName: 'Ballantyne' } },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, name: 'Lorna Ballantyne' },
      csamReports: undefined,
      details: input.rawJson,
    });
    const missingLastNameInput = {
      rawJson: {
        caseInformation: {},
        childInformation: { name: { firstName: 'Lorna' } },
      },
    };
    expect(hrmServiceContactToSearchContact(missingLastNameInput)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, name: 'Lorna undefined' },
      csamReports: undefined,
      details: missingLastNameInput.rawJson,
    });
    const missingFirstNameInput = {
      rawJson: {
        caseInformation: {},
        childInformation: { name: { lastName: 'Ballantyne' } },
      },
    };
    expect(hrmServiceContactToSearchContact(missingFirstNameInput)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, name: 'undefined Ballantyne' },
      csamReports: undefined,
      details: missingFirstNameInput.rawJson,
    });
  });

  test('input rawJson.caseInformation.callSummary mapped to output overView.notes', () => {
    const input = {
      rawJson: {
        caseInformation: {
          callSummary: 'a summary',
        },
        childInformation: { name: {} },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, notes: input.rawJson.caseInformation.callSummary },
      csamReports: undefined,
      details: input.rawJson,
    });
  });

  test('input twilioWorkerId mapped to output overView.counselor', () => {
    const input = {
      twilioWorkerId: 'a worker',
      rawJson: {
        caseInformation: {},
        childInformation: { name: {} },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, counselor: input.twilioWorkerId },
      csamReports: undefined,
      details: input.rawJson,
    });
  });

  test('input timeOfContact mapped to output overView.dateTime', () => {
    const input = {
      timeOfContact: 'a string, not a JS Date',
      rawJson: {
        caseInformation: {},
        childInformation: { name: {} },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, dateTime: input.timeOfContact },
      csamReports: undefined,
      details: input.rawJson,
    });
  });

  test('missing rawJson, rawJson.childInformation, rawJson.childIformation.name or rawJson.caseInformation objects on input throw', () => {
    expect(() => hrmServiceContactToSearchContact({})).toThrow();
    expect(() => hrmServiceContactToSearchContact({ rawJson: { caseInformation: {} } })).toThrow();
    expect(() =>
      hrmServiceContactToSearchContact({ rawJson: { caseInformation: {}, childInformation: {} } }),
    ).toThrow();
    expect(() => hrmServiceContactToSearchContact({ rawJson: { childInformation: { name: {} } } })).toThrow();
  });
});
