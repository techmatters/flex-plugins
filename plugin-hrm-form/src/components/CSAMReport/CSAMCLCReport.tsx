/* eslint-disable react/prop-types */
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CircularProgress } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';
import { FormItemDefinition } from 'hrm-form-definitions';

import CSAMCLCReportStatusScreen from './CSAMCLCReportStatusScreen';
import CSAMCLCReportFormScreen from './CSAMCLCReportFormScreen';
import { CSAMReportContainer, CSAMReportLayout, CenterContent } from '../../styles/CSAMReport';
import { addMargin, getInputType } from '../common/forms/formGenerators';
import { definitionObjectForCLC, clcKeys, initialValuesForCLC } from './CSAMReportFormDefinition';
import type { CustomITask } from '../../types/types';
import { getConfig } from '../../HrmFormPlugin';
import * as actions from '../../states/csam-clc-report/action';
import * as routingActions from '../../states/routing/actions';
import * as contactsActions from '../../states/contacts/actions';
import { RootState, csamReportBase, namespace, routingBase, configurationBase } from '../../states';
/*
 * import { reportToIWF } from '../../services/ServerlessService';
 * import { createCSAMReport } from '../../services/CSAMReportService';
 */
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
  clearCSAMCLCReportAction: actions.clearCSAMCLCReportAction,
  changeRoute: routingActions.changeRoute,
  addCSAMReportEntry: contactsActions.addCSAMReportEntry,
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// exported for test purposes
const CSAMCLCReportScreen: React.FC<Props> = ({
  updateFormAction,
  // updateStatusAction,
  clearCSAMCLCReportAction,
  changeRoute,
  // addCSAMReportEntry,
  taskSid,
  csamReportState,
  routing,
  counselorsHash,
}) => {
  const [initialForm] = React.useState(csamReportState.form); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm({ reValidateMode: 'onChange' });
  const firstElementRef = useFocus();

  const currentCounselor = React.useMemo(() => {
    const { workerSid } = getConfig();
    return counselorsHash[workerSid];
  }, [counselorsHash]);

  const formElements = React.useMemo(() => {
    const onUpdateInput = () => {
      const values = methods.getValues(Object.values(clcKeys));
      // updateFormAction(values, taskSid);
    };

    const generateInput = (e: FormItemDefinition, index: number) => {
      const generatedInput = getInputType([], onUpdateInput)(e);
      const initialValue = initialForm[e.name] === undefined ? initialValuesForCLC[e.name] : initialForm[e.name];

      return index === 0 ? generatedInput(initialValue, firstElementRef) : generatedInput(initialValue);
    };

    // Function used to generate the inputs with a reduce
    const reducerFunc = (
      accum: { [k in keyof typeof definitionObjectForCLC]: JSX.Element },
      [k, e]: [string, FormItemDefinition],
      index: number,
    ) => ({
      ...accum,
      [k]: addMargin(5)(generateInput(e, index)),
    });

    return Object.entries(definitionObjectForCLC).reduce(reducerFunc, null);
  }, [firstElementRef, initialForm, methods]);

  if (routing.route !== 'csam-clc-report') return null;

  const { previousRoute } = routing;

  const onClickClose = () => {
    clearCSAMCLCReportAction(taskSid);
    changeRoute({ ...previousRoute }, taskSid);
  };

  switch (routing.subroute) {
    case 'form': {
      const onValid = async form => {
        try {
          changeRoute({ route: 'csam-clc-report', subroute: 'loading', previousRoute }, taskSid);
          /*
           * const report = await reportToIWF(form);
           * const storedReport = await createCSAMReport({
           *   csamReportId: report['IWFReportService1.0'].responseData,
           *   twilioWorkerId: getConfig().workerSid,
           * });
           */

          /*
           * updateStatusAction(report['IWFReportService1.0'], taskSid);
           * addCSAMReportEntry(storedReport, taskSid);
           */
          changeRoute({ route: 'csam-clc-report', subroute: 'status', previousRoute }, taskSid);
        } catch (err) {
          console.error(err);
          window.alert(getConfig().strings['Error-Backend']);
          changeRoute({ route: 'csam-clc-report', subroute: 'form', previousRoute }, taskSid);
        }
      };

      const onInvalid = () => {
        window.alert(getConfig().strings['Error-Form']);
      };

      const onSendReport = methods.handleSubmit(onValid, onInvalid);

      return (
        <FormProvider {...methods}>
          <CSAMCLCReportFormScreen
            formElements={formElements}
            counselor={currentCounselor}
            onClickClose={onClickClose}
            onSendReport={onSendReport}
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
    case 'status': {
      const onSendAnotherReport = () => {
        clearCSAMCLCReportAction(taskSid);
        changeRoute({ route: 'csam-clc-report', subroute: 'form', previousRoute }, taskSid);
      };

      return (
        <CSAMCLCReportStatusScreen
          reportStatus="https://iwf.org/self-report/id/23ired45wr"
          onClickClose={onClickClose}
          onSendAnotherReport={onSendAnotherReport}
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

CSAMCLCReportScreen.displayName = 'CSAMCLCReportScreen';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CSAMCLCReportScreen);

export default connected;
