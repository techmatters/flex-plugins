/* eslint-disable react/prop-types */
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState, namespace, contactsBase } from '../../../states';
import { updateForm } from '../../../states/contacts/actions';
import { createFormFromDefinition } from './formGenerators';
import ChildFormDefinition from '../../../formDefinitions/childForm.json';
import type { FormDefinition } from './types';

type OwnProps = { task: ITask };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ChildForm: React.FC<Props> = ({ contactForm, dispatch, task }) => {
  const defaultValues = contactForm.childForm;
  const methods = useForm({ defaultValues, shouldFocusError: false });

  const { getValues } = methods;

  const childFormDefinition = React.useMemo(() => {
    console.log('>>> useMemo called');
    const onBlur = () => {
      const data = getValues();
      dispatch(updateForm(task.taskSid, 'childForm', data));
    };

    // TODO: fix this typecasting
    return createFormFromDefinition(ChildFormDefinition as FormDefinition)(onBlur);
  }, [dispatch, getValues, task.taskSid]);

  const onSubmit = data => console.log(data);

  console.log('>>> re-render');

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {childFormDefinition}

        <input type="submit" />
      </form>
    </FormProvider>
  );
};

ChildForm.displayName = 'ChildForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  contactForm: state[namespace][contactsBase].tasks[ownProps.task.taskSid],
});

const connector = connect(mapStateToProps);
// @ts-ignore
export default withTaskContext(connector(ChildForm));
