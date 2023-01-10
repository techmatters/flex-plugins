import * as t from '../../../states/csam-report/types';
import * as actions from '../../../states/csam-report/actions';
import { CSAMReportTypes } from '../../../states/csam-report/types';

const task = { taskSid: 'task-sid' };

describe('test action creators', () => {
  test('updateCounsellorFormAction', async () => {
    const form: t.CSAMReportForm = {
      webAddress: 'some-url',
      anonymous: 'anonymous',
      description: '',
      firstName: '',
      lastName: '',
      email: '',
    };

    expect(actions.updateCounsellorFormAction(form, task.taskSid)).toEqual({
      type: t.UPDATE_FORM,
      form,
      taskId: task.taskSid,
      reportType: CSAMReportTypes.COUNSELLOR,
    });
  });

  test('updateStatusAction', async () => {
    const reportStatus: t.CSAMReportStatus = {
      responseCode: '200',
      responseData: 'some-code',
      responseDescription: '',
    };

    expect(actions.updateStatusAction(reportStatus, task.taskSid)).toEqual({
      type: t.UPDATE_STATUS,
      reportStatus,
      taskId: task.taskSid,
    });
  });

  test('removeCSAMReportAction', async () => {
    expect(actions.removeCSAMReportAction(task.taskSid)).toEqual({
      type: t.REMOVE_DRAFT_CSAM_REPORT,
      taskId: task.taskSid,
    });
  });
});
