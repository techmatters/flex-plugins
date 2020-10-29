/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../states';
import { updateForm } from '../../../states/contacts/actions';
import { createFormFromDefinition, makeFormRows } from './formGenerators';
import CallerFormDefinition from '../../../formDefinitions/callerForm.json';
import { Container } from '../../../styles/HrmStyles';
import type { FormDefinition } from './types';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CustomCallerForm: React.FC<Props> = ({ dispatch, task, display }) => {
  const { getValues } = useFormContext();

  const formRows = React.useMemo(() => {
    console.log('>>> callerFormDefinition useMemo called');

    const onBlur = () => {
      const { callerInformation } = getValues();
      dispatch(updateForm(task.taskSid, 'callerInformation', callerInformation));
    };

    // TODO: fix this typecasting
    const callerFormDefinition = createFormFromDefinition(CallerFormDefinition as FormDefinition)([
      'callerInformation',
    ])(onBlur);

    return makeFormRows(callerFormDefinition);
  }, [dispatch, getValues, task.taskSid]);

  return (
    <div style={{ display: display ? 'block' : 'none' }}>
      <Container>{formRows}</Container>
    </div>
  );
};

CustomCallerForm.displayName = 'CustomCallerForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
// @ts-ignore
export default withTaskContext(connector(CustomCallerForm));
