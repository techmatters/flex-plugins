/* eslint-disable import/no-unused-modules */
/* eslint-disable react/prop-types */
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CircularProgress } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';
import { FormItemDefinition } from 'hrm-form-definitions';

import CSAMReportStatusScreen from '../CSAMReport/CSAMReportStatusScreen';
import CSAMReportFormScreen from '../CSAMReport/CSAMReportFormScreen';
import { CSAMReportContainer, CSAMReportLayout, CenterContent } from '../../styles/CSAMReport';
import { addMargin, getInputType } from '../common/forms/formGenerators';
import {
  definitionObject,
  counselorKeys,
  initialValues,
  childInitialValues,
  childKeys,
  childDefinitionObject,
} from '../CSAMReport/CSAMReportFormDefinition';
import type { CSAMReportEntry, CustomITask } from '../../types/types';
import { getConfig } from '../../HrmFormPlugin';
import * as actions from '../../states/csam-report/actions';
import * as contactsActions from '../../states/contacts/actions';
import { isCounselorCSAMReportForm } from '../../states/csam-report/types';
import { RootState, csamReportBase, contactFormsBase, namespace, configurationBase } from '../../states';
import { reportToIWF, selfReportToIWF } from '../../services/ServerlessService';
import { acknowledgeCSAMReport, createCSAMReport } from '../../services/CSAMReportService';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  taskSid: CustomITask['taskSid'];
  externalReport?: string;
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  csamReportState: state[namespace][csamReportBase].tasks[ownProps.taskSid],
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  //   csamReports: state[namespace][contactFormsBase].tasks[ownProps.taskSid].csamReports,
});

const mapDispatchToProps = {
  updateFormAction: actions.updateFormAction,
  updateStatusAction: actions.updateStatusAction,
  clearCSAMReportAction: actions.clearCSAMReportAction,
  addCSAMReportEntry: contactsActions.addCSAMReportEntry,
  setExternalReport: contactsActions.setExternalReport,
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// exported for test purposes
export const ExternalReportScreen: React.FC<Props> = ({
  updateFormAction,
  updateStatusAction,
  clearCSAMReportAction,
  addCSAMReportEntry,
  taskSid,
  csamReportState,
  counselorsHash,
  externalReport,
  setExternalReport,
  //   csamReports,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const formKeys = {
    webAddress: '',
    description: '',
    anonymous: '',
    firstName: '',
    lastName: '',
    email: '',
  };
  const [initialForm] = React.useState(formKeys);

  //   const [initialForm] = React.useState(csamReportState.form);  // grab initial values in first render only. This value should never change or will ruin the memoization below

  const methods = useForm({ reValidateMode: 'onChange' });
  const firstElementRef = useFocus();

  const currentCounselor = React.useMemo(() => {
    const { workerSid } = getConfig();
    return counselorsHash[workerSid];
  }, [counselorsHash]);

  const formElements = React.useMemo(() => {
    const csamKeys = () => {
      return { counselorKeys, childKeys };
    };
    const onUpdateInput = () => {
      const { counselorKeys, childKeys } = methods.getValues(Object.values(csamKeys));
      updateFormAction(counselorKeys, taskSid);
      updateFormAction(childKeys, taskSid);
    };

    const generateInput = (e: FormItemDefinition, index: number) => {
      const generatedInput = getInputType([], onUpdateInput)(e);
      const csamInitialValues = { initialValues, childInitialValues };
      const initialValue = initialForm[e.name] === undefined ? csamInitialValues[e.name] : initialForm[e.name];

      return index === 0 ? generatedInput(initialValue, firstElementRef) : generatedInput(initialValue);
    };

    // Function used to generate the inputs with a reduce
    const reducerFunc = (
      accum: { [k in keyof typeof definitionObject]: JSX.Element },
      [k, e]: [string, FormItemDefinition],
      index: number,
    ) => ({
      ...accum,
      [k]: addMargin(5)(generateInput(e, index)),
    });

    const childReducerFunc = (
      accum: { [k in keyof typeof childDefinitionObject]: JSX.Element },
      [k, e]: [string, FormItemDefinition],
      index: number,
    ) => ({
      ...accum,
      [k]: addMargin(5)(generateInput(e, index)),
    });

    const childReportDefinition = Object.entries(childDefinitionObject).reduce(childReducerFunc, null);
    const counsellorReportDefinition = Object.entries(definitionObject).reduce(reducerFunc, null);

    return { childReportDefinition, counsellorReportDefinition };
  }, [firstElementRef, initialForm, methods, taskSid, updateFormAction]);

  const onClickClose = () => {
    clearCSAMReportAction(taskSid);
    setExternalReport(null, taskSid);
  };

  console.log('externalReport 1', externalReport, csamReportState);

  const onValid = async form => {
    try {
      if (externalReport === 'child-form') {
        setExternalReport('loading', taskSid);

        /* ServerLess API will be called here */
        const storedReport = await createCSAMReport({
          reportType: 'self-generated',
          twilioWorkerId: getConfig().workerSid,
        });

        const caseNumber = storedReport.csamReportId;
        const report = await selfReportToIWF(form, caseNumber);

        console.log('externalReport 2', externalReport, csamReportState);

        const reportStatus = {
          responseCode: report.status,
          responseData: report.reportUrl,
          responseDescription: '',
        };

        updateStatusAction(reportStatus, taskSid);
        const reportToAcknowledge: CSAMReportEntry = storedReport;

        // If everything went fine, before moving to the next screen acknowledge the record in DB */
        const acknowledged = await acknowledgeCSAMReport(reportToAcknowledge.id);
        // addCSAMReportEntry(acknowledged, taskSid);

        console.log('acknowledged is here', acknowledged);

        setExternalReport('child-status', taskSid);
      }

      console.log('externalReport 3', externalReport, csamReportState);

      if (externalReport === 'counsellor-form') {
        setExternalReport('loading', taskSid);
        console.log('form', form);
        const report = await reportToIWF(form);
        const storedReport = await createCSAMReport({
          reportType: 'counsellor-generated',
          csamReportId: report['IWFReportService1.0'].responseData,
          twilioWorkerId: getConfig().workerSid,
        });

        updateStatusAction(report['IWFReportService1.0'], taskSid);
        // addCSAMReportEntry(storedReport, taskSid);
        setExternalReport('counsellor-status', taskSid);
      }
    } catch (err) {
      console.error(err);
      window.alert(getConfig().strings['Error-Backend']);
      const state = externalReport === 'counsellor-form' ? 'counsellor-form' : 'child-form';
      setExternalReport(state, taskSid);
    }
  };

  const onInvalid = () => {
    window.alert(getConfig().strings['Error-Form']);
  };

  const onSendAnotherReport = () => {
    const state = externalReport === 'counsellor-status' ? 'counsellor-form' : 'child-form';
    setExternalReport(state, taskSid);
    clearCSAMReportAction(taskSid);
  };

  const onSendReport = methods.handleSubmit(onValid, onInvalid);

  switch (externalReport) {
    case 'child-form': {
      return (
        <FormProvider {...methods}>
          <CSAMReportFormScreen
            childFormElements={formElements.childReportDefinition}
            counselor={currentCounselor}
            onClickClose={onClickClose}
            onSendReport={onSendReport}
            csamType="child-form"
          />
        </FormProvider>
      );
    }

    // eslint-disable-next-line sonarjs/no-duplicated-branches
    case 'counsellor-form': {
      let renderContactDetails: boolean;

      if (isCounselorCSAMReportForm(initialForm)) {
        const anonymousWatch = methods.watch('anonymous');
        renderContactDetails =
          anonymousWatch === 'non-anonymous' ||
          (anonymousWatch === undefined && initialForm.anonymous === 'non-anonymous');
      }

      return (
        <FormProvider {...methods}>
          <CSAMReportFormScreen
            counsellorFormElements={formElements.counsellorReportDefinition}
            renderContactDetails={renderContactDetails}
            counselor={currentCounselor}
            onClickClose={onClickClose}
            onSendReport={onSendReport}
            csamType="counsellor-form"
          />
        </FormProvider>
      );
    }

    case 'loading': {
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
    case 'child-status': {
      return (
        <CSAMReportStatusScreen
          clcReportStatus={csamReportState.reportStatus}
          onClickClose={onClickClose}
          onSendAnotherReport={() => onSendAnotherReport()}
          csamType="child-status"
        />
      );
    }
    case 'counsellor-status': {
      return (
        <CSAMReportStatusScreen
          reportStatus={csamReportState.reportStatus}
          onClickClose={onClickClose}
          onSendAnotherReport={() => onSendAnotherReport()}
          csamType="counsellor-status"
        />
      );
    }
    default: {
      console.error('Error: unexpected external report reached on External Report: ', externalReport);

      const { strings } = getConfig();
      window.alert(strings['Error-Unexpected']);
      onClickClose();
      return null;
    }
  }
};

ExternalReportScreen.displayName = 'ExternalReportScreen';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ExternalReportScreen);

export default connected;
