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

import { DefinitionVersionId, FormInputType, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { CaseState, CaseStateEntry, CaseSummaryWorkingCopy, CaseWorkingCopy } from '../../../states/case/types';
import { reduce } from '../../../states/case/reducer';
import {
  initialiseCaseSummaryWorkingCopy,
  initialiseExistingCaseSectionWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
  removeCaseSectionWorkingCopy,
  removeCaseSummaryWorkingCopy,
  updateCaseSectionWorkingCopy,
  updateCaseSummaryWorkingCopy,
} from '../../../states/case/caseWorkingCopy';
import { RootState } from '../../../states';
import { RecursivePartial } from '../../RecursivePartial';
import { VALID_EMPTY_CASE } from '../../testCases';
import { CaseSectionTypeSpecificData } from '../../../services/caseSectionService';
import { setWorkingCopy } from '../../../states/case/sections/workingCopy';

jest.mock('../../../states/case/sections/workingCopy', () => ({
  getWorkingCopy: jest.fn(),
  setWorkingCopy: jest.fn(),
}));

const mockConfiguredSetWorkingCopy = jest.fn();
const mockSetWorkingCopy = setWorkingCopy as jest.MockedFunction<typeof setWorkingCopy>;

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

const partialRootState: RecursivePartial<RootState['plugin-hrm-form']> = {
  configuration: {
    counselors: { hash: {}, list: undefined },
    definitionVersions: {},
    language: '',
    workerInfo: { chatChannelCapacity: 0 },
    currentDefinitionVersion: {
      caseSectionTypes: {
        household: {
          form: [
            {
              label: 'Other Property',
              name: 'otherProp',
              type: FormInputType.Input,
            },
          ],
        },
      },
    },
  },
};

const stubRootState = partialRootState as RootState['plugin-hrm-form'];

beforeEach(() => {
  mockReset();
  mockSetWorkingCopy.mockReturnValue(mockConfiguredSetWorkingCopy);
});

describe('Working copy reducers', () => {
  const caseStateEntry: RecursivePartial<CaseStateEntry> = {
    connectedCase: { info: { definitionVersion: DefinitionVersionId.v1 } },
  };
  const state: CaseState = { cases: { 1: caseStateEntry as CaseStateEntry } };
  let mockV1;

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  const baselineDate = new Date(2022, 1, 28);
  const updatedSection: CaseSectionTypeSpecificData = { otherProp: 'other-value' };

  const stubUpdateWorkingCopy: CaseWorkingCopy = { sections: { incident: { existing: { mockId: updatedSection } } } };

  beforeEach(() => {
    mockConfiguredSetWorkingCopy.mockReturnValue(stubUpdateWorkingCopy);
  });
  describe('UPDATE_CASE_WORKING_COPY', () => {
    test('Specifies id - updates case working copy using APIs updateWorkingCopy function', () => {
      const initialState: CaseState = {
        cases: {
          1: {
            ...state.cases[1],
            caseWorkingCopy: {
              sections: {
                household: {
                  existing: {
                    existingHousehold: { prop: 'value' },
                  },
                },
              },
            },
          },
        },
      };

      const expected: CaseState = {
        cases: {
          1: {
            ...state.cases[1],
            caseWorkingCopy: stubUpdateWorkingCopy,
          },
        },
      };

      const result = reduce(
        { ...stubRootState, connectedCase: initialState },
        updateCaseSectionWorkingCopy('1', 'household', updatedSection, 'existingHousehold'),
      );
      expect(result).toStrictEqual({ ...stubRootState, connectedCase: expected });
      expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(
        initialState.cases[1].caseWorkingCopy,
        updatedSection,
        'existingHousehold',
      );
    });
    test('Specifies no id - updates case working copy using APIs updateWorkingCopy function without setting an id', () => {
      const initialState: CaseState = {
        cases: {
          1: {
            ...state.cases[1],
            caseWorkingCopy: {
              sections: {},
            },
          },
        },
      };

      const expected: CaseState = {
        cases: {
          1: {
            ...state.cases[1],
            caseWorkingCopy: stubUpdateWorkingCopy,
          },
        },
      };

      const result = reduce(
        { ...stubRootState, connectedCase: initialState },
        updateCaseSectionWorkingCopy('1', 'household', updatedSection),
      );
      expect(result).toStrictEqual({ ...stubRootState, connectedCase: expected });
      expect(mockSetWorkingCopy).toHaveBeenCalledWith('household');
      expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(
        initialState.cases[1].caseWorkingCopy,
        updatedSection,
        undefined,
      );
    });
  });

  describe('Initialise case section', () => {
    describe('INIT_EXISTING_CASE_SECTION_WORKING_COPY', () => {
      const initTask: CaseStateEntry = {
        connectedCase: {
          ...VALID_EMPTY_CASE,
          accountSid: 'ACxxx',
          id: '1',
          helpline: '',
          status: 'open',
          twilioWorkerId: 'WK123',
          info: null,
          createdAt: '2020-07-31T20:39:37.408Z',
          updatedAt: '2020-07-31T20:39:37.408Z',
          categories: {},
        },
        caseWorkingCopy: {
          sections: {},
        },
        sections: {},
        timelines: {},
        availableStatusTransitions: [],
        references: new Set(['x']),
        outstandingUpdateCount: 0,
      };

      test('Specifies id that exists in case - updates case working copy using APIs updateWorkingCopy function, copying the section from the connected case', () => {
        const initialState: CaseState = {
          cases: {
            1: {
              ...initTask,
              caseWorkingCopy: {
                sections: {},
              },
              sections: {
                household: {
                  existingHousehold: {
                    sectionId: 'existingHousehold',
                    sectionType: 'household',
                    createdBy: 'WK-other-worker-sid',
                    sectionTypeSpecificData: { otherProp: 'other-value' },
                    createdAt: baselineDate,
                    eventTimestamp: baselineDate,
                  },
                },
              },
            },
          },
        };

        const expected: CaseState = {
          cases: {
            1: {
              ...initialState.cases[1],
              caseWorkingCopy: stubUpdateWorkingCopy,
            },
          },
        };

        const result = reduce(
          { ...stubRootState, connectedCase: initialState },
          initialiseExistingCaseSectionWorkingCopy('1', 'household', 'existingHousehold'),
        );
        expect(result).toStrictEqual({ ...stubRootState, connectedCase: expected });
        expect(mockSetWorkingCopy).toHaveBeenCalledWith('household');
        expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(
          initialState.cases[1].caseWorkingCopy,
          updatedSection,
          'existingHousehold',
        );
      });

      test('Section not present in the connected case - throws', () => {
        const initialState: CaseState = {
          cases: {
            1: {
              ...initTask,
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        expect(() =>
          reduce(
            { ...stubRootState, connectedCase: initialState },
            initialiseExistingCaseSectionWorkingCopy('1', 'household', 'existingHousehold'),
          ),
        ).toThrow();
      });
    });
    describe('INIT_NEW_CASE_SECTION_WORKING_COPY', () => {
      test('Specifies empty form - updates case working copy using APIs updateWorkingCopy function specifying a blank CaseItemEntry with a random ID', () => {
        const initialState: CaseState = {
          cases: {
            1: {
              ...state.cases[1],
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        const expected: CaseState = {
          cases: {
            1: {
              ...initialState.cases[1],
              caseWorkingCopy: stubUpdateWorkingCopy,
            },
          },
        };

        const result = reduce(
          { ...stubRootState, connectedCase: initialState },
          initialiseNewCaseSectionWorkingCopy('1', 'household', {}),
        );
        expect(result).toStrictEqual({ ...stubRootState, connectedCase: expected });
        expect(mockSetWorkingCopy).toHaveBeenCalledWith('household');
        expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(initialState.cases[1].caseWorkingCopy, {});
      });
      test('Specifies populated form - updates case working copy using APIs updateWorkingCopy function specifying provided CaseItemEntry with a random ID', () => {
        const initialState: CaseState = {
          cases: {
            1: {
              ...state.cases[1],
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        const expected: CaseState = {
          cases: {
            1: {
              ...initialState.cases[1],
              caseWorkingCopy: stubUpdateWorkingCopy,
            },
          },
        };

        const result = reduce(
          { ...stubRootState, connectedCase: initialState },
          initialiseNewCaseSectionWorkingCopy('1', 'household', { a: 'b', b: true, c: 'wakka wakka' }),
        );
        expect(result).toStrictEqual({ ...stubRootState, connectedCase: expected });
        expect(mockSetWorkingCopy).toHaveBeenCalledWith('household');
        expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(initialState.cases[1].caseWorkingCopy, {
          a: 'b',
          b: true,
          c: 'wakka wakka',
        });
      });
    });
  });

  describe('REMOVE_CASE_SECTION_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        cases: {},
      };

      const resultWithNoId = reduce(
        { ...stubRootState, connectedCase: initialState },
        removeCaseSectionWorkingCopy('non existent task', 'household'),
      );
      expect(resultWithNoId).toStrictEqual({ ...stubRootState, connectedCase: initialState });

      const resultWithId = reduce(
        { ...stubRootState, connectedCase: initialState },
        removeCaseSectionWorkingCopy('non existent task', 'household', 'non existent id'),
      );
      expect(resultWithId).toStrictEqual({ ...stubRootState, connectedCase: initialState });
    });
    test("Task exists - calls api's updateWorkingCopy with id and an undefined item", () => {
      const initialState: CaseState = {
        cases: {
          1: {
            ...state.cases[1],
            caseWorkingCopy: {
              sections: {},
            },
          },
        },
      };

      const expected: CaseState = {
        cases: {
          1: {
            ...initialState.cases[1],
            caseWorkingCopy: stubUpdateWorkingCopy,
          },
        },
      };

      const resultWithoutId = reduce(
        { ...stubRootState, connectedCase: initialState },
        removeCaseSectionWorkingCopy('1', 'household'),
      );
      expect(resultWithoutId).toStrictEqual({ ...stubRootState, connectedCase: expected });
      expect(mockSetWorkingCopy).toHaveBeenCalledWith('household');
      expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(
        initialState.cases[1].caseWorkingCopy,
        undefined,
        undefined,
      );

      const resultWithId = reduce(
        { ...stubRootState, connectedCase: initialState },
        removeCaseSectionWorkingCopy('1', 'household', 'an id'),
      );
      expect(resultWithId).toStrictEqual({ ...stubRootState, connectedCase: expected });
      expect(mockSetWorkingCopy).toHaveBeenCalledWith('household');
      expect(mockConfiguredSetWorkingCopy).toHaveBeenCalledWith(
        initialState.cases[1].caseWorkingCopy,
        undefined,
        'an id',
      );
    });
  });
  describe('INIT_CASE_SUMMARY_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        cases: {},
      };
      const resultWithNoId = reduce(
        { ...stubRootState, connectedCase: initialState },
        initialiseCaseSummaryWorkingCopy('non existent task', <CaseSummaryWorkingCopy>{}),
      );
      expect(resultWithNoId).toStrictEqual({ ...stubRootState, connectedCase: initialState });
    });
    test('Task exists with connectedCase- creates a caseSummary in the working copy populated from connectedCase', () => {
      const initialStateInfo = {
        ...state.cases[1].connectedCase.info,
        followUpDate: 'In a bit',
        summary: 'A summary',
        childIsAtRisk: true,
      };
      const initialState: CaseState = {
        cases: {
          1: {
            connectedCase: {
              ...state.cases[1].connectedCase,
              status: 'test',
              info: initialStateInfo,
            },
            caseWorkingCopy: {
              sections: {},
            },
            availableStatusTransitions: [],
            references: new Set(['x']),
            timelines: {},
            outstandingUpdateCount: 0,
            sections: {},
          },
        },
      };
      const result = reduce(
        { ...stubRootState, connectedCase: initialState },
        initialiseCaseSummaryWorkingCopy('1', {
          status: 'peachy',
          followUpDate: 'In a while',
          summary: 'Default summary',
          childIsAtRisk: false,
        }),
      );
      expect(result).toStrictEqual({
        ...stubRootState,
        connectedCase: {
          ...initialState,
          cases: {
            1: {
              ...initialState.cases[1],
              caseWorkingCopy: {
                ...initialState.cases[1].caseWorkingCopy,
                caseSummary: {
                  childIsAtRisk: initialStateInfo.childIsAtRisk,
                  followUpDate: initialStateInfo.followUpDate,
                  summary: initialStateInfo.summary,
                  status: initialState.cases[1].connectedCase.status,
                },
              },
            },
          },
        },
      });
    });
    test('Task exists with connectedCase but uundefined case summary properties- uses provided defaults where case properties are undefined', () => {
      const initialStateInfo = {
        ...state.cases[1].connectedCase.info,
        followUpDate: undefined,
        summary: 'A summary',
        childIsAtRisk: undefined,
      };
      const initialState: CaseState = {
        cases: {
          1: {
            connectedCase: {
              ...state.cases[1].connectedCase,
              status: 'test',
              info: initialStateInfo,
            },
            caseWorkingCopy: {
              sections: {},
            },
            availableStatusTransitions: [],
            references: new Set(['x']),
            timelines: {},
            outstandingUpdateCount: 0,
            sections: {},
          },
        },
      };
      const result = reduce(
        { ...stubRootState, connectedCase: initialState },
        initialiseCaseSummaryWorkingCopy('1', {
          status: 'peachy',
          followUpDate: 'In a while',
          summary: 'Default summary',
          childIsAtRisk: false,
        }),
      );
      expect(result).toStrictEqual({
        ...stubRootState,
        connectedCase: {
          ...initialState,
          cases: {
            1: {
              ...initialState.cases[1],
              caseWorkingCopy: {
                ...initialState.cases[1].caseWorkingCopy,
                caseSummary: {
                  childIsAtRisk: false,
                  followUpDate: 'In a while',
                  summary: initialStateInfo.summary,
                  status: initialState.cases[1].connectedCase.status,
                },
              },
            },
          },
        },
      });
    });
  });
  describe('UPDATE_CASE_SUMMARY_WORKING_COPY', () => {
    const workingCopy: CaseSummaryWorkingCopy = {
      summary: 'a new summary',
      followUpDate: 'Ragnarok',
      childIsAtRisk: false,
      status: 'mulching',
    };

    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        cases: {},
      };
      const resultWithNoId = reduce(
        { ...stubRootState, connectedCase: initialState },
        updateCaseSummaryWorkingCopy('non existent task', workingCopy),
      );
      expect(resultWithNoId).toStrictEqual({ ...stubRootState, connectedCase: initialState });
    });
    test("Task exists with a working copy- overwrites working copy's caseSummary", () => {
      const initialState: CaseState = {
        cases: {
          1: {
            connectedCase: {
              ...state.cases[1].connectedCase,
            },
            caseWorkingCopy: {
              caseSummary: {
                status: 'soaking',
                followUpDate: 'Armageddon',
                summary: 'A summary',
                childIsAtRisk: true,
              },
              sections: {},
            },
            availableStatusTransitions: [],
            references: new Set(['x']),
            timelines: {},
            outstandingUpdateCount: 0,
            sections: {},
          },
        },
      };
      const expectedResult = {
        ...initialState,
        cases: {
          1: {
            ...initialState.cases[1],
            caseWorkingCopy: {
              ...initialState.cases[1].caseWorkingCopy,
              caseSummary: workingCopy,
            },
          },
        },
      };

      const replaceResult = reduce(
        { ...stubRootState, connectedCase: initialState },
        updateCaseSummaryWorkingCopy('1', workingCopy),
      );
      expect(replaceResult).toStrictEqual({ ...stubRootState, connectedCase: expectedResult });
      delete initialState.cases[1].caseWorkingCopy.caseSummary;

      const addResult = reduce(
        { ...stubRootState, connectedCase: initialState },
        updateCaseSummaryWorkingCopy('1', workingCopy),
      );
      expect(addResult).toStrictEqual({ ...stubRootState, connectedCase: expectedResult });
    });
  });

  describe('REMOVE_CASE_SUMMARY_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        cases: {},
      };
      const result = reduce(
        { ...stubRootState, connectedCase: initialState },
        removeCaseSummaryWorkingCopy('non existent task'),
      );
      expect(result).toStrictEqual({ ...stubRootState, connectedCase: initialState });
    });
    test("Task exists with a working copy- removes working copy's caseSummary", () => {
      const initialState: CaseState = {
        cases: {
          1: {
            connectedCase: {
              ...state.cases[1].connectedCase,
            },
            caseWorkingCopy: {
              caseSummary: {
                status: 'soaking',
                followUpDate: 'Armageddon',
                summary: 'A summary',
                childIsAtRisk: true,
              },
              sections: {},
            },
            availableStatusTransitions: [],
            references: new Set(['x']),
            timelines: {},
            outstandingUpdateCount: 0,
            sections: {},
          },
        },
      };
      const { caseSummary, ...workingCopyWithoutSummary } = initialState.cases[1].caseWorkingCopy;
      const expectedResult = {
        ...initialState,
        cases: {
          1: {
            ...initialState.cases[1],
            caseWorkingCopy: workingCopyWithoutSummary,
          },
        },
      };

      const removeResult = reduce({ ...stubRootState, connectedCase: initialState }, removeCaseSummaryWorkingCopy('1'));
      expect(removeResult).toStrictEqual({ ...stubRootState, connectedCase: expectedResult });
      delete initialState.cases[1].caseWorkingCopy.caseSummary;

      const noopResult = reduce({ ...stubRootState, connectedCase: initialState }, removeCaseSummaryWorkingCopy('1'));
      expect(noopResult).toStrictEqual({ ...stubRootState, connectedCase: expectedResult });
    });
  });
});
