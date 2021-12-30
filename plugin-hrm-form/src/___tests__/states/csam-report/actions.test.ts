import * as t from '../../../states/csam-report/types';
import * as actions from '../../../states/csam-report/actions';

const task = { taskSid: 'task-sid' };

describe('test action creators', () => {
  test('updateFormAction', async () => {
    const form: t.CSAMReportForm = {
      webAddress: 'some-url',
      anonymous: true,
      description: '',
      firstName: '',
      lastName: '',
      email: '',
    };

    expect(actions.updateFormAction(form, task.taskSid)).toEqual({
      type: t.UPDATE_FORM,
      form,
      taskId: task.taskSid,
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

  test('clearCSAMReportAction', async () => {
    expect(actions.clearCSAMReportAction(task.taskSid)).toEqual({
      type: t.CLEAR_CSAM_REPORT,
      taskId: task.taskSid,
    });
  });
});
