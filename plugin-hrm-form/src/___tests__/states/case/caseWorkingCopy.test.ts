import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { CaseItemEntry } from '../../../types/types';
import { CaseSectionApi } from '../../../states/case/sections/api';
import { CaseState, CaseWorkingCopy } from '../../../states/case/types';
import { householdSectionApi } from '../../../states/case/sections/household';
import { reduce } from '../../../states/case/reducer';
import {
  initialiseCaseSectionWorkingCopy,
  removeCaseSectionWorkingCopy,
  updateCaseSectionWorkingCopy,
} from '../../../states/case/caseWorkingCopy';

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

      const result = reduce(initialState, updateCaseSectionWorkingCopy(task.taskSid, stubApi, updatedSection));
      expect(result).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        updatedSection,
        undefined,
      );
    });
  });

  describe('INIT_CASE_WORKING_COPY', () => {
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
        childName: '',
      },
      prevStatus: '',
      caseWorkingCopy: {
        sections: {},
      },
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

      const result = reduce(initialState, initialiseCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold'));
      expect(result).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        updatedSection,
        'existingHousehold',
      );
    });

    test('Specifies no id - updates case working copy using APIs updateWorkingCopy function specifying a blank CaseItemEntry with a random ID', () => {
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

      const result = reduce(initialState, initialiseCaseSectionWorkingCopy(task.taskSid, stubApi));
      expect(result).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        { id: expect.any(String), form: {}, createdAt: null, twilioWorkerId: null },
        undefined,
      );
    });

    test('Specifies id when section not present in the connected case - throws', () => {
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
        reduce(initialState, initialiseCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold')),
      ).toThrow();
    });

    test('Specifies id that is not present in the connected case - throws', () => {
      const initialState: CaseState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: {
              ...state.tasks.task1.connectedCase,
              info: {
                ...state.tasks.task1.connectedCase.info,
                households: [],
              },
            },
            caseWorkingCopy: {
              sections: {},
            },
          },
        },
      };

      expect(() =>
        reduce(initialState, initialiseCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold')),
      ).toThrow();
    });
  });

  describe('REMOVE_CASE_SECTION_WORKING_COPY', () => {
    test("Task doesn't exist - noop", () => {
      const initialState: CaseState = {
        tasks: {},
      };

      const resultWithNoId = reduce(initialState, removeCaseSectionWorkingCopy('non existent task', stubApi));
      expect(resultWithNoId).toStrictEqual(initialState);

      const resultWithId = reduce(
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

      const resultWithoutId = reduce(initialState, removeCaseSectionWorkingCopy(task.taskSid, stubApi));
      expect(resultWithoutId).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        undefined,
        undefined,
      );

      const resultWithId = reduce(initialState, removeCaseSectionWorkingCopy(task.taskSid, stubApi, 'an id'));
      expect(resultWithId).toStrictEqual(expected);
      expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
        initialState.tasks.task1.caseWorkingCopy,
        undefined,
        'an id',
      );
    });
  });
});
