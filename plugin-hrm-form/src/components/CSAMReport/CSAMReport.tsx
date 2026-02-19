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

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CircularProgress } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import CSAMReportStatusScreen from './CSAMReportStatusScreen';
import CSAMReportCounsellorForm from './CSAMReportCounsellorForm';
import { CenterContent, CSAMReportContainer, CSAMReportLayout } from './styles';
import { RootState } from '../../states';
import { CSAMPage, CSAMReportApi } from './csamReportApi';
import { isChildTaskEntry, isCounsellorTaskEntry } from '../../states/csam-report/types';
import CSAMReportTypePickerForm from './CSAMReportTypePicker';
import CSAMReportChildForm from './CSAMReportChildForm';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { configurationBase, namespace } from '../../states/storeNamespaces';

type Props = {
  api: CSAMReportApi;
};

// exported for test purposes
export const CSAMReportScreen: React.FC<Props> = ({ api }) => {
  const dispatch = useDispatch();
  const csamReportState = useSelector((state: RootState) => api.reportState(state));
  const currentPage = useSelector((state: RootState) => api.currentPage(state));
  const counselorsHash = useSelector((state: RootState) => state[namespace][configurationBase].counselors.hash);

  const updateCounsellorForm = api.updateCounsellorReportDispatcher(dispatch);
  const updateChildForm = api.updateChildReportDispatcher(dispatch);
  const updateStatus = api.updateStatusDispatcher(dispatch);
  const navigate = api.navigationActionDispatcher(dispatch);
  const exit = api.exitActionDispatcher(dispatch);
  const addCSAMReportEntry = api.addReportDispatcher(dispatch);
  const pickReportType = api.pickReportTypeDispatcher(dispatch);
  const methods = useForm({ reValidateMode: 'onChange' });

  const { workerSid } = getHrmConfig();
  const strings = getTemplateStrings();
  const currentCounselor = counselorsHash[workerSid];

  if (!currentPage) return null;

  const onValid = async () => {
    try {
      navigate(CSAMPage.Loading, csamReportState.reportType);
      const { hrmReport, iwfReport } = await api.saveReport(csamReportState, workerSid);

      updateStatus(iwfReport);
      addCSAMReportEntry(hrmReport);

      navigate(CSAMPage.Status, csamReportState.reportType);
    } catch (err) {
      console.error(err);
      window.alert(strings['Error-Backend']);
      navigate(CSAMPage.Form, csamReportState.reportType);
    }
  };

  const onInvalid = () => {
    window.alert(strings['Error-Form']);
  };

  const onSendAnotherReport = () => {
    navigate(CSAMPage.Form, csamReportState.reportType);
  };

  const onConfirmReportTypeSelection = methods.handleSubmit(
    () => navigate(CSAMPage.Form, csamReportState.reportType),
    onInvalid,
  );

  const onSendReport = methods.handleSubmit(onValid, onInvalid);

  if (
    currentPage === CSAMPage.ReportTypePicker ||
    (!isChildTaskEntry(csamReportState) && !isCounsellorTaskEntry(csamReportState))
  ) {
    return (
      <FormProvider {...methods}>
        <CSAMReportTypePickerForm
          methods={methods}
          renderContactDetails={false}
          counselor={currentCounselor}
          onClickClose={exit}
          onSubmit={onConfirmReportTypeSelection}
          pickReportType={pickReportType}
          reportType={csamReportState.reportType}
        />
      </FormProvider>
    );
  }

  switch (currentPage) {
    case CSAMPage.Form: {
      return (
        <FormProvider {...methods}>
          {isChildTaskEntry(csamReportState) ? (
            <CSAMReportChildForm
              formValues={csamReportState.form}
              counselor={currentCounselor}
              onClickClose={exit}
              onSendReport={onSendReport}
              update={updateChildForm}
              methods={methods}
            />
          ) : (
            <CSAMReportCounsellorForm
              formValues={csamReportState.form}
              counselor={currentCounselor}
              onClickClose={exit}
              onSendReport={onSendReport}
              update={updateCounsellorForm}
              methods={methods}
            />
          )}
        </FormProvider>
      );
    }

    case CSAMPage.Loading: {
      return (
        <CSAMReportContainer data-testid="CSAMReport-Loading">
          <CSAMReportLayout>
            <CenterContent>
              <CircularProgress />
            </CenterContent>
          </CSAMReportLayout>
        </CSAMReportContainer>
      );
    }
    case CSAMPage.Status: {
      return (
        <CSAMReportStatusScreen
          reportStatus={csamReportState.reportStatus}
          onClickClose={exit}
          onSendAnotherReport={onSendAnotherReport}
          csamType={csamReportState.reportType}
        />
      );
    }
    default: {
      console.error('Error: unexpected page reached on CSAM Report: ', currentPage);
      window.alert(strings['Error-Unexpected']);
      exit();
      return null;
    }
  }
};

CSAMReportScreen.displayName = 'CSAMReportScreen';

export default CSAMReportScreen;
