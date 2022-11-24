/* eslint-disable react/prop-types */
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CircularProgress } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';
import { FormItemDefinition } from 'hrm-form-definitions';

import CSAMReportStatusScreen from './CSAMReportStatusScreen';
import CSAMReportFormScreen from './CSAMReportFormScreen';
import { CSAMReportContainer, CSAMReportLayout, CenterContent } from '../../styles/CSAMReport';
import { addMargin, getInputType } from '../common/forms/formGenerators';
import {
  definitionObject,
  counselorKeys,
  initialValues,
  childInitialValues,
  childKeys,
  childDefinitionObject,
} from './CSAMReportFormDefinition';
import type { CSAMReportEntry, CustomITask } from '../../types/types';
import { getConfig } from '../../HrmFormPlugin';
import * as actions from '../../states/csam-report/actions';
import * as routingActions from '../../states/routing/actions';
import * as contactsActions from '../../states/contacts/actions';
import { isCounselorCSAMReportForm } from '../../states/csam-report/types';
import { RootState, csamReportBase, namespace, routingBase, configurationBase } from '../../states';
import { reportToIWF } from '../../services/ServerlessService';
import { aknowledgeCSAMReport, createCSAMReport, deleteCSAMReport } from '../../services/CSAMReportService';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  taskSid: CustomITask['taskSid'];
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  csamReportState: state[namespace][csamReportBase].tasks[ownProps.taskSid],
  routing: state[namespace][routingBase].tasks[ownProps.taskSid],
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

const mapDispatchToProps = {
  updateFormAction: actions.updateFormAction,
  updateStatusAction: actions.updateStatusAction,
  clearCSAMReportAction: actions.clearCSAMReportAction,
  changeRoute: routingActions.changeRoute,
  addCSAMReportEntry: contactsActions.addCSAMReportEntry,
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// exported for test purposes
export const CSAMReportScreen: React.FC<Props> = ({
  updateFormAction,
  updateStatusAction,
  clearCSAMReportAction,
  changeRoute,
  addCSAMReportEntry,
  taskSid,
  csamReportState,
  routing,
  counselorsHash,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const [initialForm] = React.useState(csamReportState.form); // grab initial values in first render only. This value should never change or will ruin the memoization below
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

  if (routing.route !== 'csam-report') return null;

  const { previousRoute } = routing;

  const onClickClose = () => {
    clearCSAMReportAction(taskSid);
    changeRoute({ ...previousRoute }, taskSid);
  };

  const onValid = async form => {
    let reportToAknowledge: CSAMReportEntry;

    try {
      if (routing.subroute === 'child-form') {
        changeRoute({ route: 'csam-report', subroute: 'loading', previousRoute }, taskSid);
        const storedReport = await createCSAMReport({
          reportType: 'self-generated',
          twilioWorkerId: getConfig().workerSid,
        });
        reportToAknowledge = storedReport;

        /* ServerLess API will be called here */

        /* If everything went fine, before moving to the next screen aknowledge the record in DB */
        const aknowledged = await aknowledgeCSAMReport(reportToAknowledge.id);

        addCSAMReportEntry(storedReport, taskSid);
        changeRoute({ route: 'csam-report', subroute: 'child-status', previousRoute }, taskSid);
      }

      if (routing.subroute === 'counsellor-form') {
        changeRoute({ route: 'csam-report', subroute: 'loading', previousRoute }, taskSid);
        const report = await reportToIWF(form);
        const storedReport = await createCSAMReport({
          reportType: 'counsellor-generated',
          csamReportId: report['IWFReportService1.0'].responseData,
          twilioWorkerId: getConfig().workerSid,
        });

        updateStatusAction(report['IWFReportService1.0'], taskSid);
        addCSAMReportEntry(storedReport, taskSid);
        changeRoute({ route: 'csam-report', subroute: 'counsellor-status', previousRoute }, taskSid);
      }
    } catch (err) {
      console.error(err);
      window.alert(getConfig().strings['Error-Backend']);

      try {
        if (reportToAknowledge) {
          // Clean up the DB (Do we even want this? Or just filtering the not-aknowledged is enough?)
          await deleteCSAMReport(reportToAknowledge.id);
        }
      } catch (err) {
        console.error('Error trying to delete CSAM report with id', reportToAknowledge.id, err);
      }

      changeRoute(
        {
          route: 'csam-report',
          subroute: routing.subroute === 'counsellor-form' ? 'counsellor-form' : 'child-form',
          previousRoute,
        },
        taskSid,
      );
    }
  };

  const onInvalid = () => {
    window.alert(getConfig().strings['Error-Form']);
  };

  const onSendAnotherReport = (route, subroute) => {
    clearCSAMReportAction(taskSid);
    changeRoute({ route, subroute, previousRoute }, taskSid);
  };

  const onSendReport = methods.handleSubmit(onValid, onInvalid);

  switch (routing.subroute) {
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
          clcReportStatus="https://iwf.org/self-report/id/23ired45wr"
          onClickClose={onClickClose}
          onSendAnotherReport={() => onSendAnotherReport('csam-report', 'child-form')}
          csamType="child-status"
        />
      );
    }
    case 'counsellor-status': {
      return (
        <CSAMReportStatusScreen
          reportStatus={csamReportState.reportStatus}
          onClickClose={onClickClose}
          onSendAnotherReport={() => onSendAnotherReport('csam-report', 'counsellor-form')}
          csamType="counsellor-status"
        />
      );
    }
    default: {
      console.error('Error: unexpected route reached on CSAM Report: ', routing);

      const { strings } = getConfig();
      window.alert(strings['Error-Unexpected']);
      onClickClose();
      return null;
    }
  }
};

CSAMReportScreen.displayName = 'CSAMReportScreen';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CSAMReportScreen);

export default connected;
