import React, { Dispatch } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CircularProgress } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';

import CSAMReportStatusScreen from './CSAMReportStatusScreen';
import CSAMReportCounsellorForm from './CSAMReportCounsellorForm';
import { CenterContent, CSAMReportContainer, CSAMReportLayout } from '../../styles/CSAMReport';
import { getConfig } from '../../HrmFormPlugin';
import { configurationBase, namespace, RootState } from '../../states';
import { CSAMPage, CSAMReportApi } from './csamReportApi';
import * as t from '../../states/contacts/actions';
import { isChildTaskEntry, isCounsellorTaskEntry } from '../../states/csam-report/types';
import CSAMReportTypePickerForm from './CSAMReportTypePicker';
import CSAMReportChildForm from './CSAMReportChildForm';

type OwnProps = {
  api: CSAMReportApi;
};

const mapStateToProps = (state: RootState, { api }: OwnProps) => ({
  csamReportState: api.reportState(state),
  currentPage: api.currentPage(state),
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

const mapDispatchToProps = (dispatch: Dispatch<any>, { api }: OwnProps) => {
  return {
    updateCounsellorForm: api.updateCounsellorReportDispatcher(dispatch),
    updateChildForm: api.updateChildReportDispatcher(dispatch),
    updateStatus: api.updateStatusDispatcher(dispatch),
    navigate: api.navigationActionDispatcher(dispatch),
    exit: api.exitActionDispatcher(dispatch),
    addCSAMReportEntry: api.addReportDispatcher(dispatch),
    pickReportType: api.pickReportTypeDispatcher(dispatch),
    setEditPageOpen: () => dispatch(t.setEditContactPageOpen()),
    setEditPageClosed: () => dispatch(t.setEditContactPageClosed()),
  };
};

// eslint-disable-next-line no-use-before-define
export type Props = OwnProps & ConnectedProps<typeof connector>;

// exported for test purposes
export const CSAMReportScreen: React.FC<Props> = ({
  updateChildForm,
  updateCounsellorForm,
  updateStatus,
  navigate,
  exit,
  addCSAMReportEntry,
  csamReportState,
  currentPage,
  counselorsHash,
  api,
  setEditPageClosed,
  setEditPageOpen,
  pickReportType,
}) => {
  const methods = useForm({ reValidateMode: 'onChange' });

  const currentCounselor = React.useMemo(() => {
    const { workerSid } = getConfig();
    return counselorsHash[workerSid];
  }, [counselorsHash]);

  React.useEffect(() => {
    setEditPageOpen();
    return () => {
      setEditPageClosed();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentPage) return null;

  const onValid = async () => {
    try {
      navigate(CSAMPage.Loading, csamReportState.reportType);
      const { hrmReport, iwfReport } = await api.saveReport(csamReportState);

      updateStatus(iwfReport);
      addCSAMReportEntry(hrmReport);

      navigate(CSAMPage.Status, csamReportState.reportType);
    } catch (err) {
      console.error(err);
      window.alert(getConfig().strings['Error-Backend']);
      navigate(CSAMPage.Form, csamReportState.reportType);
    }
  };

  const onInvalid = () => {
    window.alert(getConfig().strings['Error-Form']);
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

      const { strings } = getConfig();
      window.alert(strings['Error-Unexpected']);
      exit();
      return null;
    }
  }
};

CSAMReportScreen.displayName = 'CSAMReportScreen';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CSAMReportScreen);

export default connected;
