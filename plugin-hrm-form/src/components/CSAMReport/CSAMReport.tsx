/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CircularProgress } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';
import { FormItemDefinition } from 'hrm-form-definitions';

import CSAMReportStatusScreen from './CSAMReportStatusScreen';
import CSAMReportFormScreen from './CSAMReportFormScreen';
import { CenterContent, CSAMReportContainer, CSAMReportLayout } from '../../styles/CSAMReport';
import { addMargin, getInputType } from '../common/forms/formGenerators';
import {
  childDefinitionObject,
  childInitialValues,
  childKeys,
  counselorKeys,
  definitionObject,
  initialValues,
} from './CSAMReportFormDefinition';
import { getConfig } from '../../HrmFormPlugin';
import { configurationBase, namespace, RootState } from '../../states';
import useFocus from '../../utils/useFocus';
import { CSAMPage, CSAMReportApi } from './csamReportApi';
import * as t from '../../states/contacts/actions';
import { isChildTaskEntry, isCounsellorTaskEntry } from '../../states/csam-report/types';

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
    updateCounsellorFormAction: api.updateCounsellorReportDispatcher(dispatch),
    updateChildFormAction: api.updateChildReportDispatcher(dispatch),
    updateStatusAction: api.updateStatusDispatcher(dispatch),
    navigate: api.navigationActionDispatcher(dispatch),
    exit: api.exitActionDispatcher(dispatch),
    addCSAMReportEntry: api.addReportDispatcher(dispatch),
    setEditPageOpen: () => dispatch(t.setEditContactPageOpen()),
    setEditPageClosed: () => dispatch(t.setEditContactPageClosed()),
  };
};

// eslint-disable-next-line no-use-before-define
export type Props = OwnProps & ConnectedProps<typeof connector>;

// exported for test purposes
export const CSAMReportScreen: React.FC<Props> = ({
  updateChildFormAction,
  updateCounsellorFormAction,
  updateStatusAction,
  navigate,
  exit,
  addCSAMReportEntry,
  csamReportState,
  currentPage,
  counselorsHash,
  api,
  setEditPageClosed,
  setEditPageOpen,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const methods = useForm({ reValidateMode: 'onChange' });
  const firstElementRef = useFocus();

  const currentCounselor = React.useMemo(() => {
    const { workerSid } = getConfig();
    return counselorsHash[workerSid];
  }, [counselorsHash]);

  const formElements = React.useMemo(() => {
    const formValues =
      (isCounsellorTaskEntry(csamReportState) || isChildTaskEntry(csamReportState) ? csamReportState.form : {}) ?? {};
    const onUpdateInput = () => {
      if (isChildTaskEntry(csamReportState)) {
        updateChildFormAction(methods.getValues(Object.values(childKeys)));
      } else if (isCounsellorTaskEntry(csamReportState)) {
        updateCounsellorFormAction(methods.getValues(Object.values(counselorKeys)));
      }
    };

    const generateInput = (e: FormItemDefinition, index: number) => {
      const generatedInput = getInputType([], onUpdateInput)(e);
      const csamInitialValues = { initialValues, childInitialValues };
      const initialValue = formValues[e.name] === undefined ? csamInitialValues[e.name] : formValues[e.name];

      return index === 0 ? generatedInput(initialValue, firstElementRef) : generatedInput(initialValue);
    };

    const reducerFunc = definition => (
      accum: { [k in keyof typeof definition]: JSX.Element },
      [k, e]: [string, FormItemDefinition],
      index: number,
    ) => ({
      ...accum,
      [k]: addMargin(5)(generateInput(e, index)),
    });

    const childReportDefinition = Object.entries(childDefinitionObject).reduce(
      reducerFunc(childDefinitionObject),
      null,
    ) as {
      [k in keyof typeof childDefinitionObject]: JSX.Element;
    };
    const counsellorReportDefinition = Object.entries(definitionObject).reduce(reducerFunc(definitionObject), null) as {
      [k in keyof typeof definitionObject]: JSX.Element;
    };

    return { childReportDefinition, counsellorReportDefinition };
  }, [csamReportState, firstElementRef, methods, updateChildFormAction, updateCounsellorFormAction]);

  React.useEffect(() => {
    setEditPageOpen();
    return () => {
      setEditPageClosed();
    };
  });

  if (!isChildTaskEntry(csamReportState) && !isCounsellorTaskEntry(csamReportState)) return null;
  if (!currentPage) return null;

  const onValid = async () => {
    try {
      navigate(CSAMPage.Loading);
      const { hrmReport, iwfReport } = await api.saveReport(csamReportState);

      updateStatusAction(iwfReport);

      addCSAMReportEntry(hrmReport);
      if (currentPage === CSAMPage.ChildForm) {
        navigate(CSAMPage.ChildStatus);
      } else if (currentPage === CSAMPage.CounsellorForm) {
        navigate(CSAMPage.CounsellorStatus);
      }
    } catch (err) {
      console.error(err);
      window.alert(getConfig().strings['Error-Backend']);
      navigate(currentPage === CSAMPage.ChildForm ? CSAMPage.ChildForm : CSAMPage.CounsellorForm);
    }
  };

  const onInvalid = () => {
    window.alert(getConfig().strings['Error-Form']);
  };

  const onSendAnotherReport = () => {
    navigate(currentPage === CSAMPage.ChildStatus ? CSAMPage.ChildForm : CSAMPage.CounsellorForm);
  };

  const onSendReport = methods.handleSubmit(onValid, onInvalid);

  switch (currentPage) {
    case CSAMPage.ChildForm:
    case CSAMPage.CounsellorForm: {
      const renderContactDetails =
        isCounsellorTaskEntry(csamReportState) && csamReportState.form?.anonymous === 'non-anonymous';
      return (
        <FormProvider {...methods}>
          <CSAMReportFormScreen
            counsellorFormElements={formElements.counsellorReportDefinition}
            childFormElements={formElements.childReportDefinition}
            renderContactDetails={renderContactDetails}
            counselor={currentCounselor}
            onClickClose={exit}
            onSendReport={onSendReport}
            csamType={csamReportState.reportType}
          />
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
    case CSAMPage.ChildStatus:
    case CSAMPage.CounsellorStatus: {
      return (
        <CSAMReportStatusScreen
          reportStatus={csamReportState.reportStatus}
          onClickClose={exit}
          onSendAnotherReport={() => onSendAnotherReport()}
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
