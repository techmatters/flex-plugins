/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../states';
import { updateForm } from '../../../states/contacts/actions';
import { createFormFromDefinition, makeFormRows } from './formGenerators';
import CaseInfoFormDefinition from '../../../formDefinitions/caseInfoForm.json';
import { Container } from '../../../styles/HrmStyles';
import type { FormDefinition } from './types';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CustomCaseInfoForm: React.FC<Props> = ({ dispatch, task, display }) => {
  const { getValues } = useFormContext();

  const formRows = React.useMemo(() => {
    console.log('>>> caseInfoFormDefinition useMemo called');

    const updateCallback = () => {
      const { caseInformation } = getValues();
      dispatch(updateForm(task.taskSid, 'caseInformation', caseInformation));
    };

    // TODO: fix this typecasting
    const caseInfoFormDefinition = createFormFromDefinition(CaseInfoFormDefinition as FormDefinition)([
      'caseInformation',
    ])(updateCallback);

    return makeFormRows(caseInfoFormDefinition);
  }, [dispatch, getValues, task.taskSid]);

  return (
    <div style={{ display: display ? 'block' : 'none' }}>
      <Container>{formRows}</Container>
    </div>
  );
};

CustomCaseInfoForm.displayName = 'CustomCaseInfoForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
const connected = connector(CustomCaseInfoForm);

export default withTaskContext<Props, typeof connected>(connected);