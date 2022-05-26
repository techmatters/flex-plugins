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
import { definitionObject, keys, initialValues } from './CSAMReportFormDefinition';
import type { CustomITask } from '../../types/types';
import { getConfig } from '../../HrmFormPlugin';
import * as actions from '../../states/csam-report/actions';
import * as routingActions from '../../states/routing/actions';
import * as contactsActions from '../../states/contacts/actions';
import { RootState, csamReportBase, namespace, routingBase, configurationBase } from '../../states';
import { reportToIWF } from '../../services/ServerlessService';
import { createCSAMReport } from '../../services/CSAMReportService';
import useFocus from '../../hooks/useFocus';

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
      const values = methods.getValues(Object.values(keys));
      updateFormAction(values, taskSid);
    };

    const generateInput = (e: FormItemDefinition, index: number) => {
      const generatedInput = getInputType([], onUpdateInput)(e);
      const initialValue = initialForm[e.name] === undefined ? initialValues[e.name] : initialForm[e.name];

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

    return Object.entries(definitionObject).reduce(reducerFunc, null);
  }, [firstElementRef, initialForm, methods, taskSid, updateFormAction]);

  if (routing.route !== 'csam-report') return null;

  const { previousRoute } = routing;

  const onClickClose = () => {
    clearCSAMReportAction(taskSid);
    changeRoute({ ...previousRoute }, taskSid);
  };

  switch (routing.subroute) {
    case 'form': {
      const onValid = async form => {
        try {
          changeRoute({ route: 'csam-report', subroute: 'loading', previousRoute }, taskSid);
          const report = await reportToIWF(form);
          const storedReport = await createCSAMReport({
            csamReportId: report['IWFReportService1.0'].responseData,
            twilioWorkerId: getConfig().workerSid,
          });

          updateStatusAction(report['IWFReportService1.0'], taskSid);
          addCSAMReportEntry(storedReport, taskSid);
          changeRoute({ route: 'csam-report', subroute: 'status', previousRoute }, taskSid);
        } catch (err) {
          console.error(err);
          window.alert(getConfig().strings['Error-Backend']);
          changeRoute({ route: 'csam-report', subroute: 'form', previousRoute }, taskSid);
        }
      };

      const onInvalid = () => {
        window.alert(getConfig().strings['Error-Form']);
      };

      const onSendReport = methods.handleSubmit(onValid, onInvalid);

      const anonymousWatch = methods.watch('anonymous');
      const renderContactDetails =
        anonymousWatch === 'non-anonymous' ||
        (anonymousWatch === undefined && initialForm.anonymous === 'non-anonymous');

      return (
        <FormProvider {...methods}>
          <CSAMReportFormScreen
            formElements={formElements}
            renderContactDetails={renderContactDetails}
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
        clearCSAMReportAction(taskSid);
        changeRoute({ route: 'csam-report', subroute: 'form', previousRoute }, taskSid);
      };

      return (
        <CSAMReportStatusScreen
          reportStatus={csamReportState.reportStatus}
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

CSAMReportScreen.displayName = 'CSAMReportScreen';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CSAMReportScreen);

export default connected;
