import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { CaseState, CaseWorkingCopy, reduce } from '../../../states/case/reducer';
import * as actions from '../../../states/case/actions';
import * as GeneralActions from '../../../states/actions';
import { Case, CaseItemEntry } from '../../../types/types';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { TemporaryCaseInfo, UPDATE_CASE_CONTACT } from '../../../states/case/types';
import { CaseItemAction } from '../../../states/routing/types';
import { connectedCaseBase, namespace, RootState } from '../../../states';
import { householdSectionApi } from '../../../states/case/sections/household';
import { CaseSectionApi } from '../../../states/case/sections/api';

const task = { taskSid: 'task1' };

describe('test reducer', () => {
  let state: CaseState = undefined;
  let mockV1;

  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
  });

  test('should return initial state', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'TEST_TASK_ID',
    });
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should ignore INITIALIZE_CONTACT_STATE', async () => {
    const result = reduce(state, GeneralActions.initializeContactState(mockV1.tabbedForms)(task.taskSid));
    expect(result).toStrictEqual(state);
  });

  test('should handle SET_CONNECTED_CASE', async () => {
    const connectedCase: Case = {
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
    };

    const expected: RootState[typeof namespace][typeof connectedCaseBase] = {
      tasks: {
        task1: { connectedCase, temporaryCaseInfo: null, prevStatus: 'open', caseWorkingCopy: { sections: {} } },
      },
    };

    const result = reduce(state, actions.setConnectedCase(connectedCase, task.taskSid));
    state = result;
    expect(result).toStrictEqual(expected);
  });

  test('should handle REMOVE_CONNECTED_CASE', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, actions.removeConnectedCase(task.taskSid));
    expect(result).toStrictEqual(expected);

    // state = result; no assignment here as we don't want to lose the only task in the state, it will be reused in following tests
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const expected = { tasks: {} };

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid));
    expect(result).toStrictEqual(expected);

    // state = result; no assignment here as we don't want to lose the only task in the state, it will be reused in following tests
  });

  test('should handle UPDATE_CASE_INFO', async () => {
    const info = { summary: 'Some summary', notes: ['Some note'] };

    const { connectedCase, temporaryCaseInfo, prevStatus } = state.tasks.task1;
    const expected = {
      tasks: {
        task1: {
          connectedCase: { ...connectedCase, info },
          temporaryCaseInfo,
          caseWorkingCopy: { sections: {} },
          prevStatus,
        },
      },
    };

    const result = reduce(state, actions.updateCaseInfo(info, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle UPDATE_TEMP_INFO', async () => {
    const randomTemp: TemporaryCaseInfo = {
      screen: 'caseSummary',
      action: CaseItemAction.Edit,
      info: {
        form: {},
        id: '',
        createdAt: new Date().toISOString(),
        twilioWorkerId: 'TEST_WORKER_ID',
      },
    };

    const { connectedCase, prevStatus } = state.tasks.task1;
    const expected = {
      tasks: { task1: { connectedCase, temporaryCaseInfo: randomTemp, prevStatus, caseWorkingCopy: { sections: {} } } },
    };

    const result = reduce(state, actions.updateTempInfo(randomTemp, task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle MARK_CASE_AS_UPDATED', async () => {
    const expected = { tasks: { task1: { ...state.tasks.task1 } } };

    const result = reduce(state, actions.markCaseAsUpdated(task.taskSid));
    expect(result).toStrictEqual(expected);

    state = result;
  });
  describe('UPDATE_CASE_CONTACT', () => {
    const connectedCase: Case = {
      accountSid: 'ACxxx',
      id: 1,
      helpline: '',
      status: 'open',
      twilioWorkerId: 'WK123',
      info: null,
      createdAt: '2020-07-31T20:39:37.408Z',
      updatedAt: '2020-07-31T20:39:37.408Z',
      categories: {},
      childName: '',
      connectedContacts: [
        {
          id: 'AN ID',
          a: 1,
        },
        {
          id: 'ANOTHER ID',
          b: 2,
        },
      ],
    };
    test('should update a connectedContact for the connectedCase if one with an ID matching the ID for the action contact exists', async () => {
      const expectedConnectedCase: Case = {
        ...connectedCase,
        connectedContacts: [
          {
            id: 'AN ID',
            b: 100,
          },
          {
            id: 'ANOTHER ID',
            b: 2,
          },
        ],
      };
      const expected = {
        tasks: { task1: { ...state.tasks.task1, connectedCase: expectedConnectedCase } },
      };

      const result = reduce(
        { tasks: { task1: { ...state.tasks.task1, connectedCase } } },
        {
          type: UPDATE_CASE_CONTACT,
          taskId: task.taskSid,
          contact: {
            id: 'AN ID',
            b: 100,
          },
        },
      );
      expect(result).toStrictEqual(expected);

      state = result;
    });
    test('should do nothing if no connectedContact with an ID matching the one in the action', async () => {
      const startingState = { tasks: { task1: { ...state.tasks.task1, connectedCase } } };

      const result = reduce(startingState, {
        type: UPDATE_CASE_CONTACT,
        taskId: task.taskSid,
        contact: {
          id: 'NOT AN ID',
          b: 100,
        },
      });
      expect(result).toStrictEqual(startingState);
    });
    test('should do nothing if action contact has no id', async () => {
      const startingState = { tasks: { task1: { ...state.tasks.task1, connectedCase } } };

      const result = reduce(startingState, {
        type: UPDATE_CASE_CONTACT,
        taskId: task.taskSid,
        contact: {
          b: 100,
        },
      });
      expect(result).toStrictEqual(startingState);
    });

    test('should throw if action contact is missing', async () => {
      const startingState = { tasks: { task1: { ...state.tasks.task1, connectedCase } } };

      expect(() =>
        reduce(startingState, {
          type: UPDATE_CASE_CONTACT,
          taskId: task.taskSid,
          contact: undefined,
        }),
      ).toThrow();
    });
    test('should add empty connected contacts array if connected case has no connected contacts array', async () => {
      const startingState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: { ...connectedCase, connectedContacts: null },
          },
        },
      };

      const expected = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: { ...connectedCase, connectedContacts: [] },
          },
        },
      };

      const result = reduce(startingState, {
        type: UPDATE_CASE_CONTACT,
        taskId: task.taskSid,
        contact: {
          id: 'AN ID',
          b: 100,
        },
      });

      expect(result).toStrictEqual(expected);
    });
    test('should throw if target taskId has no connected case', async () => {
      const startingState = {
        tasks: {
          task1: {
            ...state.tasks.task1,
            connectedCase: undefined,
          },
        },
      };
      expect(() =>
        reduce(startingState, {
          type: UPDATE_CASE_CONTACT,
          taskId: task.taskSid,
          contact: {
            id: 'AN ID',
            b: 101,
          },
        }),
      ).toThrow();
    });
  });
  describe('Working copy reducers', () => {
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
          actions.updateCaseSectionWorkingCopy(task.taskSid, stubApi, updatedSection, 'existingHousehold'),
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
          initialState,
          actions.updateCaseSectionWorkingCopy(task.taskSid, stubApi, updatedSection),
        );
        expect(result).toStrictEqual(expected);
        expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
          initialState.tasks.task1.caseWorkingCopy,
          updatedSection,
          undefined,
        );
      });
    });

    describe('INIT_CASE_WORKING_COPY', () => {
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
          initialState,
          actions.initialiseCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold'),
        );
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

        const result = reduce(initialState, actions.initialiseCaseSectionWorkingCopy(task.taskSid, stubApi));
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
          reduce(initialState, actions.initialiseCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold')),
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
          reduce(initialState, actions.initialiseCaseSectionWorkingCopy(task.taskSid, stubApi, 'existingHousehold')),
        ).toThrow();
      });
    });

    describe('REMOVE_CASE_SECTION_WORKING_COPY', () => {
      test("Task doesn't exist - noop", () => {
        const initialState: CaseState = {
          tasks: {},
        };

        const resultWithNoId = reduce(initialState, actions.removeCaseSectionWorkingCopy('non existent task', stubApi));
        expect(resultWithNoId).toStrictEqual(initialState);

        const resultWithId = reduce(
          initialState,
          actions.removeCaseSectionWorkingCopy('non existent task', stubApi, 'non existent id'),
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

        const resultWithoutId = reduce(initialState, actions.removeCaseSectionWorkingCopy(task.taskSid, stubApi));
        expect(resultWithoutId).toStrictEqual(expected);
        expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
          initialState.tasks.task1.caseWorkingCopy,
          undefined,
          undefined,
        );

        const resultWithId = reduce(initialState, actions.removeCaseSectionWorkingCopy(task.taskSid, stubApi, 'an id'));
        expect(resultWithId).toStrictEqual(expected);
        expect(stubApi.updateWorkingCopy).toHaveBeenCalledWith(
          initialState.tasks.task1.caseWorkingCopy,
          undefined,
          'an id',
        );
      });
    });
  });
});
