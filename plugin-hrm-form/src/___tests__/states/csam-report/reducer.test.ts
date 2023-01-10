/* eslint-disable sonarjs/no-identical-functions */
import { DefinitionVersion } from 'hrm-form-definitions';

import { reduce, initialState } from '../../../states/csam-report/reducer';
import * as actions from '../../../states/csam-report/actions';
import * as GeneralActions from '../../../states/actions';
import { GeneralActionType } from '../../../states/types';
import { CSAMReportTypes } from '../../../states/csam-report/types';
import { initialValues } from '../../../components/CSAMReport/CSAMReportFormDefinition';
import { newCSAMReportAction } from '../../../states/csam-report/actions';

const newCounsellorTaskEntry = {
  form: { ...initialValues },
  reportType: CSAMReportTypes.COUNSELLOR,
  reportStatus: {
    responseCode: '',
    responseData: '',
    responseDescription: '',
  },
} as const;
const task = { taskSid: 'task-sid' };
const voidDefinitions: DefinitionVersion = {
  tabbedForms: {
    CallerInformationTab: [],
    ChildInformationTab: [],
    CaseInformationTab: [],
    ContactlessTaskTab: {},
    IssueCategorizationTab: () => ({}),
  },
  caseForms: {
    HouseholdForm: [],
    PerpetratorForm: [],
    ReferralForm: [],
    NoteForm: [],
    DocumentForm: [],
    IncidentForm: [],
  },
  callTypeButtons: [],
  caseStatus: {},
  layoutVersion: {
    contact: { callerInformation: {}, caseInformation: {}, childInformation: {} },
    case: { households: {}, referrals: {}, documents: {}, perpetrators: {}, incidents: {} },
  },
  helplineInformation: { label: '', helplines: [] },
  prepopulateKeys: {
    survey: {
      ChildInformationTab: [],
      CallerInformationTab: [],
    },
    preEngagement: {
      ChildInformationTab: [],
      CallerInformationTab: [],
      CaseInformationTab: [],
    },
  },
  insights: { oneToOneConfigSpec: {}, oneToManyConfigSpecs: [] },
};

describe('test reducer', () => {
  test('should return initial state', async () => {
    const state = undefined;

    const expected = initialState;

    const result = reduce(state, <GeneralActionType>{});
    expect(result).toStrictEqual(expected);
  });

  test('should handle UPDATE_FORM', async () => {
    const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

    const expected = {
      ...state,
      tasks: {
        ...state.tasks,
        [task.taskSid]: {
          reportType: CSAMReportTypes.COUNSELLOR,
          form: { ...newCounsellorTaskEntry.form, webAddress: 'some-url' },
        },
      },
    };

    const result = reduce(
      state,
      actions.updateCounsellorFormAction({ ...newCounsellorTaskEntry.form, webAddress: 'some-url' }, task.taskSid),
    );

    expect(result).toStrictEqual(expected);
  });

  test('should handle UPDATE_STATUS', async () => {
    const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

    const reportStatus = { responseData: 'some-code', responseCode: '200', responseDescription: '' };
    const expected = {
      ...state,
      tasks: {
        ...state.tasks,
        [task.taskSid]: { reportType: CSAMReportTypes.COUNSELLOR, reportStatus, form: undefined },
      },
    };

    const result = reduce(state, actions.updateStatusAction(reportStatus, task.taskSid));

    expect(result).toStrictEqual(expected);
  });

  test('should handle CLEAR_CSAM_REPORT', async () => {
    const state = reduce(initialState, newCSAMReportAction(task.taskSid, CSAMReportTypes.COUNSELLOR));

    expect(state).toStrictEqual({
      ...state,
      tasks: {
        [task.taskSid]: { reportType: CSAMReportTypes.COUNSELLOR, form: undefined },
      },
    });

    const result = reduce(state, actions.removeCSAMReportAction(task.taskSid));

    expect(result).toStrictEqual(initialState);
  });
});
