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
