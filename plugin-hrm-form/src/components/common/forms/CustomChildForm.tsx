/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../states';
import { updateForm } from '../../../states/contacts/actions';
import { createFormFromDefinition, makeFormRows } from './formGenerators';
import ChildFormDefinition from '../../../formDefinitions/childForm.json';
import { Container } from '../../../styles/HrmStyles';
import type { FormDefinition } from './types';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CustomChildForm: React.FC<Props> = ({ dispatch, task, display }) => {
  const { getValues } = useFormContext();

  const formRows = React.useMemo(() => {
    console.log('>>> childFormDefinition useMemo called');
    const updateCallback = () => {
      const { childInformation } = getValues();
      dispatch(updateForm(task.taskSid, 'childInformation', childInformation));
    };

    // TODO: fix this typecasting
    const childFormDefinition = createFormFromDefinition(ChildFormDefinition as FormDefinition)(['childInformation'])(
      updateCallback,
    );

    return makeFormRows(childFormDefinition);
  }, [dispatch, getValues, task.taskSid]);

  return (
    <div style={{ display: display ? 'block' : 'none' }}>
      <Container>{formRows}</Container>
    </div>
  );
};

CustomChildForm.displayName = 'CustomChildForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
const connected = connector(CustomChildForm);

export default withTaskContext<Props, typeof connected>(connected);
