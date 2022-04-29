import { configurationBase, contactFormsBase, namespace, RootState, routingBase } from '../../states';
import { connect, ConnectedProps } from 'react-redux';
import React from 'react';
import { CustomITask } from '../../types/types';
import { useForm, FormProvider } from 'react-hook-form';


type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;


const EditContactSection: React.FC<Props> = ({
  contactForm,
  children
                                             }) => {

  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  return (

    <FormProvider {...methods}>
      <div role="form" style={{ height: '100%', overflow: 'scroll' }}>
        {{children}}
      </div>
    </FormProvider>
  )
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const routing = state[namespace][routingBase].tasks[ownProps.task.taskSid];
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  return { routing, contactForm, currentDefinitionVersion };
};

const connector = connect(mapStateToProps);
const connected = connector(EditContactSection);

export default connected;
