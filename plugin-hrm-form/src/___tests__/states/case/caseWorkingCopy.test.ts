import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { CaseItemEntry } from '../../../types/types';
import { CaseSectionApi } from '../../../states/case/sections/api';
import { CaseState, CaseSummaryWorkingCopy, CaseWorkingCopy } from '../../../states/case/types';
import { householdSectionApi } from '../../../states/case/sections/household';
import { reduce } from '../../../states/case/reducer';
import {
  initialiseExistingCaseSectionWorkingCopy,
  initialiseCaseSummaryWorkingCopy,
  removeCaseSectionWorkingCopy,
  removeCaseSummaryWorkingCopy,
  updateCaseSectionWorkingCopy,
  updateCaseSummaryWorkingCopy,
  initialiseNewCaseSectionWorkingCopy,
} from '../../../states/case/caseWorkingCopy';
import { RootState } from '../../../states';

const stubRootState = {} as RootState['plugin-hrm-form'];

describe('Working copy reducers', () => {
  const task = { taskSid: 'task1' };
  const state: CaseState = { tasks: {} };
  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
  });

  const baselineDate = new Date(2022, 1, 28);
  const updatedSection: CaseItemEntry = {
    id: 'existingHousehold',
    twilioWorkerId: 'other-worker-sid',
    form: { otherProp: 'other-value' },
    createdAt: baselineDate.toISOString(),
  };

  let stubApi: CaseSectionApi<any>;
  const stubUpdateWorkingCopy: CaseWorkingCopy = { sections: { mock: { existing: { mockId: updatedSection } } } };

  beforeEach(() => {
    stubApi = {
      ...householdSectionApi,
      updateWorkingCopy: jest.fn().mockReturnValue(stubUpdateWorkingCopy),
    };
  });

  describe('UPDATE_CASE_WORKING_COPY', () => {
    test('Specifies id - updates case working copy using APIs updateWorkingCopy function', () => {
      const initialState: CaseState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            caseWorkingCopy: {
              sections: {
                households: {
                  existing: {
                    existingHousehold: {
                      id: 'existingHousehold',
                      twilioWorkerId: 'worker-sid',
                      form: { prop: 'value' },
                      createdAt: baselineDate.toISOString(),
                    },
                  },
                },
              },
            },
          },
        },
      };

      const expected: CaseState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            caseWorkingCopy: stubUpdateWorkingCopy,
          },
        },
      };

      const result = reduce(
        stubRootState,
        initialState,
        updateCaseSectionWorkingCopy(task.taskSid, stubApi, updatedSection, 'existingHousehold'),
      );
      expect(result).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        updatedSection,
        'existingHousehold',
      );
    });
    test('Specifies no id - updates case working copy using APIs updateWorkingCopy function without setting an id', () => {
      const initialState: CaseState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            caseWorkingCopy: {
              sections: {},
            },
          },
        },
      };

      const expected: CaseState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            caseWorkingCopy: stubUpdateWorkingCopy,
          },
        },
      };

      const result = reduce(
        stubRootState,
        initialState,
        updateCaseSectionWorkingCopy(task.taskSid, stubApi, updatedSection),
      );
      expect(result).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        updatedSection,
        undefined,
      );
    });
  });

  describe('Initialise case section', () => {
    describe('INIT_EXISTING_CASE_SECTION_WORKING_COPY', () => {
      state.tasks.task1 = {
        connectedCase: {
          accountSid: 'ACxxx',
          id: 1,
          helpline: '',
          status: 'open',
          twilioWorkerId: 'WK123',
          info: null,
          createdAt: '2020-07-31T20:39:37.408Z',
          updatedAt: '2020-07-31T20:39:37.408Z',
          connectedContacts: null,
          categories: {},
        },
        caseWorkingCopy: {
          sections: {},
        },
        availableStatusTransitions: [],
      };

      test('Specifies id that exists in case - updates case working copy using APIs updateWorkingCopy function, copying the section from the connected case', () => {
        const initialState: CaseState = {
          tasks: {
            task1: {
              ...state.tasks.task1,
              connectedCase: {
                ...state.tasks.task1.connectedCase,
                info: {
                  ...state.tasks.task1.connectedCase.info,
                  households: [
                    {
                      id: 'existingHousehold',
                      twilioWorkerId: 'other-worker-sid',
                      household: { otherProp: 'other-value' },
                      createdAt: baselineDate.toISOString(),
                    },
                  ],
                },
              },
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        const expected: CaseState = {
          tasks: {
            task1: {
              ...initialState.tasks.task1,
              caseWorkingCopy: stubUpdateWorkingCopy,
            },
          },
        };

        const result = reduce(
          stubRootState,
          initialState,
          initialiseExistingCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold'),
        );
        expect(result).toStrictEqual(expected);
        expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
          initialState.tasks.task1.caseWorkingCopy,
          updatedSection,
          'existingHousehold',
        );
      });

      test('Section not present in the connected case - throws', () => {
        const initialState: CaseState = {
          tasks: {
            task1: {
              ...state.tasks.task1,
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        expect(() =>
          reduce(
            stubRootState,
            initialState,
            initialiseExistingCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold'),
          ),
        ).toThrow();
      });
    });
    describe('INIT_NEW_CASE_SECTION_WORKING_COPY', () => {
      test('Specifies empty form - updates case working copy using APIs updateWorkingCopy function specifying a blank CaseItemEntry with a random ID', () => {
        const initialState: CaseState = {
          tasks: {
            task1: {
              ...state.tasks.task1,
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        const expected: CaseState = {
          tasks: {
            task1: {
              ...initialState.tasks.task1,
              caseWorkingCopy: stubUpdateWorkingCopy,
            },
          },
        };

        const result = reduce(
          stubRootState,
          initialState,
          initialiseNewCaseSectionWorkingCopy(task.taskSid, stubApi, {}),
        );
        expect(result).toStrictEqual(expected);
        expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(initialState.tasks.task1.caseWorkingCopy, {
          id: expect.any(String),
          form: {},
          createdAt: null,
          twilioWorkerId: null,
        });
      });
      test('Specifies populated form - updates case working copy using APIs updateWorkingCopy function specifying provided CaseItemEntry with a random ID', () => {
        const initialState: CaseState = {
          tasks: {
            task1: {
              ...state.tasks.task1,
              caseWorkingCopy: {
                sections: {},
              },
            },
          },
        };

        const expected: CaseState = {
          tasks: {
            task1: {
              ...initialState.tasks.task1,
              caseWorkingCopy: stubUpdateWorkingCopy,
            },
          },
        };

        const result = reduce(
          stubRootState,
          initialState,
          initialiseNewCaseSectionWorkingCopy(task.taskSid, stubApi, { a: 'b', b: true, c: 'wakka wakka' }),
        );
        expect(result).toStrictEqual(expected);
        expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(initialState.tasks.task1.caseWorkingCopy, {
          id: expect.any(String),
          form: { a: 'b', b: true, c: 'wakka wakka' },
          createdAt: null,
          twilioWorkerId: null,
        });
      });
    });
  });

  describe('REMOVE_CASE_SECTION_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        tasks: {},
      };

      const resultWithNoId = reduce(
        stubRootState,
        initialState,
        removeCaseSectionWorkingCopy('non existent task', stubApi),
      );
      expect(resultWithNoId).toStrictEqual(initialState);

      const resultWithId = reduce(
        stubRootState,
        initialState,
        removeCaseSectionWorkingCopy('non existent task', stubApi, 'non existent id'),
      );
      expect(resultWithId).toStrictEqual(initialState);
    });
    test("Task exists - calls api's updateWorkingCopy with id and an undefined item", () => {
      const initialState: CaseState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            caseWorkingCopy: {
              sections: {},
            },
          },
        },
      };

      const expected: CaseState = {
        tasks: {
          task1: {
            ...initialState.tasks.task1,
            caseWorkingCopy: stubUpdateWorkingCopy,
          },
        },
      };

      const resultWithoutId = reduce(stubRootState, initialState, removeCaseSectionWorkingCopy(task.taskSid, stubApi));
      expect(resultWithoutId).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        undefined,
        undefined,
      );

      const resultWithId = reduce(
        stubRootState,
        initialState,
        removeCaseSectionWorkingCopy(task.taskSid, stubApi, 'an id'),
      );
      expect(resultWithId).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        undefined,
        'an id',
      );
    });
  });
  describe('INIT_CASE_SUMMARY_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        tasks: {},
      };
      const resultWithNoId = reduce(
        stubRootState,
        initialState,
        initialiseCaseSummaryWorkingCopy('non existent task', <CaseSummaryWorkingCopy>{}),
      );
      expect(resultWithNoId).toStrictEqual(initialState);
    });
    test('Task exists with connectedCase- creates a caseSummary in the working copy populated from connectedCase', () => {
      const initialStateInfo = {
        ...state.tasks.task1.connectedCase.info,
        followUpDate: 'In a bit',
        summary: 'A summary',
        childIsAtRisk: true,
      };
      const initialState: CaseState = {
        tasks: {
          task1: {
            connectedCase: {
              ...state.tasks.task1.connectedCase,
              status: 'test',
              info: initialStateInfo,
            },
            caseWorkingCopy: {
              sections: {},
            },
            availableStatusTransitions: [],
          },
        },
      };
      const result = reduce(
        stubRootState,
        initialState,
        initialiseCaseSummaryWorkingCopy('task1', {
          status: 'peachy',
          followUpDate: 'In a while',
          summary: 'Default summary',
          childIsAtRisk: false,
        }),
      );
      expect(result).toStrictEqual({
        ...initialState,
        tasks: {
          task1: {
            ...initialState.tasks.task1,
            caseWorkingCopy: {
              ...initialState.tasks.task1.caseWorkingCopy,
              caseSummary: {
                childIsAtRisk: initialStateInfo.childIsAtRisk,
                followUpDate: initialStateInfo.followUpDate,
                summary: initialStateInfo.summary,
                status: initialState.tasks.task1.connectedCase.status,
              },
            },
          },
        },
      });
    });
    test('Task exists with connectedCase but uundefined case summary properties- uses provided defaults where case properties are undefined', () => {
      const initialStateInfo = {
        ...state.tasks.task1.connectedCase.info,
        followUpDate: undefined,
        summary: 'A summary',
        childIsAtRisk: undefined,
      };
      const initialState: CaseState = {
        tasks: {
          task1: {
            connectedCase: {
              ...state.tasks.task1.connectedCase,
              status: 'test',
              info: initialStateInfo,
            },
            caseWorkingCopy: {
              sections: {},
            },
            availableStatusTransitions: [],
          },
        },
      };
      const result = reduce(
        stubRootState,
        initialState,
        initialiseCaseSummaryWorkingCopy('task1', {
          status: 'peachy',
          followUpDate: 'In a while',
          summary: 'Default summary',
          childIsAtRisk: false,
        }),
      );
      expect(result).toStrictEqual({
        ...initialState,
        tasks: {
          task1: {
            ...initialState.tasks.task1,
            caseWorkingCopy: {
              ...initialState.tasks.task1.caseWorkingCopy,
              caseSummary: {
                childIsAtRisk: false,
                followUpDate: 'In a while',
                summary: initialStateInfo.summary,
                status: initialState.tasks.task1.connectedCase.status,
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
        tasks: {},
      };
      const resultWithNoId = reduce(
        stubRootState,
        initialState,
        updateCaseSummaryWorkingCopy('non existent task', workingCopy),
      );
      expect(resultWithNoId).toStrictEqual(initialState);
    });
    test("Task exists with a working copy- overwrites working copy's caseSummary", () => {
      const initialState: CaseState = {
        tasks: {
          task1: {
            connectedCase: {
              ...state.tasks.task1.connectedCase,
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
          },
        },
      };
      const expectedResult = {
        ...initialState,
        tasks: {
          task1: {
            ...initialState.tasks.task1,
            caseWorkingCopy: {
              ...initialState.tasks.task1.caseWorkingCopy,
              caseSummary: workingCopy,
            },
          },
        },
      };

      const replaceResult = reduce(stubRootState, initialState, updateCaseSummaryWorkingCopy('task1', workingCopy));
      expect(replaceResult).toStrictEqual(expectedResult);
      delete initialState.tasks.task1.caseWorkingCopy.caseSummary;

      const addResult = reduce(stubRootState, initialState, updateCaseSummaryWorkingCopy('task1', workingCopy));
      expect(addResult).toStrictEqual(expectedResult);
    });
  });

  describe('REMOVE_CASE_SUMMARY_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        tasks: {},
      };
      const result = reduce(stubRootState, initialState, removeCaseSummaryWorkingCopy('non existent task'));
      expect(result).toStrictEqual(initialState);
    });
    test("Task exists with a working copy- removes working copy's caseSummary", () => {
      const initialState: CaseState = {
        tasks: {
          task1: {
            connectedCase: {
              ...state.tasks.task1.connectedCase,
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
          },
        },
      };
      const { caseSummary, ...workingCopyWithoutSummary } = initialState.tasks.task1.caseWorkingCopy;
      const expectedResult = {
        ...initialState,
        tasks: {
          task1: {
            ...initialState.tasks.task1,
            caseWorkingCopy: workingCopyWithoutSummary,
          },
        },
      };

      const removeResult = reduce(stubRootState, initialState, removeCaseSummaryWorkingCopy('task1'));
      expect(removeResult).toStrictEqual(expectedResult);
      delete initialState.tasks.task1.caseWorkingCopy.caseSummary;

      const noopResult = reduce(stubRootState, initialState, removeCaseSummaryWorkingCopy('task1'));
      expect(noopResult).toStrictEqual(expectedResult);
    });
  });
});
