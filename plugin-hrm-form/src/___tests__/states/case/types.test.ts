import each from 'jest-each';

import { CaseInfo, CaseItemEntry, ReferralEntry } from '../../../types/types';
import { updateCaseListByIndex, updateCaseSectionListByIndex } from '../../../states/case/types';

const testCaseItemEntry = (payload: any): CaseItemEntry => ({
  form: payload,
  id: 'TEST_CASE_INFO_SECTION',
  createdAt: new Date(2000, 1, 1).toISOString(),
  twilioWorkerId: 'TEST_CASE_INFO_WORKER',
});

const expectedUpdatedCaseItem = (item: CaseItemEntry, property: string) => {
  const { form, ...entry } = item;
  return { [property]: form, ...entry };
};

describe('updateCaseSectionListByIndex', () => {
  const testCase = () => ({
    case: { childIsAtRisk: false },
    description: 'case with no list defined',
  });
  const testCaseWithList = () => ({
    case: { referrals: [{}, {}, {}, {}] },
    description: 'case with populated list',
  });

  const payload = {};
  const update = testCaseItemEntry(payload);

  each([
    {
      entryProperty: undefined,
      index: undefined,
      baselineCase: testCase(),
      expectedList: [expectedUpdatedCaseItem(update, 'referrals')],
      expectationDescription: "a new list with the provided item as it's only item to be created",
    },
    {
      entryProperty: undefined,
      index: undefined,
      baselineCase: testCaseWithList(),
      expectedList: [{}, {}, {}, {}, expectedUpdatedCaseItem(update, 'referrals')],
      expectationDescription: 'the provided item to be added to the end of the existing list',
    },
    {
      entryProperty: 'myEntry',
      baselineCase: testCase(),
      expectedList: [expectedUpdatedCaseItem(update, 'myEntry')],
      expectationDescription: "a new list with the provided item as it's only item to be created",
    },
    {
      entryProperty: 'myEntry',
      baselineCase: testCaseWithList(),
      expectedList: [{}, {}, {}, {}, expectedUpdatedCaseItem(update, 'myEntry')],
      expectationDescription: 'the provided item to be added to the end of the existing list',
    },
    {
      entryProperty: 'myEntry',
      index: 2,
      baselineCase: testCase(),
      expectedList: [undefined, undefined, expectedUpdatedCaseItem(update, 'myEntry')],
      expectationDescription: "a new list with 2 empty items and the provided item as it's 3rd to be created",
    },
    {
      entryProperty: 'myEntry',
      index: 2,
      baselineCase: testCaseWithList(),
      expectedList: [{}, {}, expectedUpdatedCaseItem(update, 'myEntry'), {}],
      expectationDescription: 'the provided item to replace the 3rd item in the existing list',
    },
  ]).test(
    `Running on $baselineCase.description, Specifying index: $index, entryProperty: '$entryProperty' - expect the item to have it's payload moved from 'form' to '$entryProperty' and $expectationDescription`,
    ({ baselineCase, expectedList, entryProperty, index }) => {
      const updatedCase = updateCaseSectionListByIndex('referrals', entryProperty)(
        baselineCase.case,
        testCaseItemEntry(payload),
        index,
      );
      expect(updatedCase).toHaveProperty('referrals', expectedList);
      expect(payload).not.toHaveProperty('referrals');
    },
  );
  test(`Keeps entry property on form when explicitly set to`, () => {
    const updatedCase = updateCaseSectionListByIndex('referrals', 'form')(
      testCase().case,
      testCaseItemEntry(payload),
      undefined,
    );
    expect(updatedCase).toHaveProperty('referrals', [expectedUpdatedCaseItem(update, 'form')]);
    expect(payload).not.toHaveProperty('referrals');
  });
  test(`Throws if list property set to non array case property`, () => {
    expect(() =>
      updateCaseSectionListByIndex('childIsAtRisk', 'form')(testCase().case, testCaseItemEntry(payload), undefined),
    ).toThrow();
  });
});

describe('updateCaseListByIndex', () => {
  const testCase = () => ({
    case: { referrals: [] },
    description: 'case with no list defined',
  });
  const testCaseWithList = () => ({
    case: { referrals: [{}, {}, {}, {}] },
    description: 'case with populated list',
  });

  const payload = {};
  const convertedReferral: ReferralEntry = { hello: 'world' };
  const caseItemToListItem: (item: CaseItemEntry) => ReferralEntry = () => convertedReferral;

  // Need to be assigned before 'beforeEach' runs, but also be reset for each test.

  each([
    {
      baselineCase: testCaseWithList(),
      expectedList: [{}, {}, {}, {}, convertedReferral],
      expectationDescription: 'the provided item to be added to the end of the returned list',
    },
    {
      index: 2,
      baselineCase: testCase(),
      expectedList: [undefined, undefined, convertedReferral],
      expectationDescription: "a list with 2 empty items and the provided item as it's 3rd to be created",
    },
    {
      index: 2,
      baselineCase: testCaseWithList(),
      expectedList: [{}, {}, convertedReferral, {}],
      expectationDescription: 'the provided item to replace the 3rd item in the existing list',
    },
  ]).test(
    `Running on $baselineCase.description, Specifying index: $index - expect the item to be converted by the 'caseItemToListItem' function parameter and and $expectationDescription`,
    ({ baselineCase, expectedList, index }) => {
      const updatedCase = updateCaseListByIndex(caseInfo => caseInfo.referrals, caseItemToListItem)(
        baselineCase.case,
        testCaseItemEntry(payload),
        index,
      );
      expect(updatedCase).toHaveProperty('referrals', expectedList);
      expect(payload).not.toHaveProperty('referrals');
    },
  );

  test(`Throws if listGetter returns nothing`, () => {
    expect(() =>
      updateCaseListByIndex(() => undefined, caseItemToListItem)(
        testCase().case,
        testCaseItemEntry(payload),
        undefined,
      ),
    ).toThrow();
  });
});
