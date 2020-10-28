/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../states';
import { updateForm } from '../../../states/contacts/actions';
import { createCategoriesFromDefinition } from './categoriesGenerators';
import CategoriesDefinition from '../../../formDefinitions/categories.json';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CustomCategoriesForm: React.FC<Props> = ({ dispatch, display, task }) => {
  const { getValues } = useFormContext();

  const categoriesDefinition = React.useMemo(() => {
    console.log('>>> categoriesDefinition useMemo called');

    const onToggle = () => {
      const { categories } = getValues();
      dispatch(updateForm(task.taskSid, 'categories', categories));
    };

    return createCategoriesFromDefinition(CategoriesDefinition)(['categories'])(onToggle);
  }, [dispatch, getValues, task.taskSid]);

  return <div style={{ display: display ? 'block' : 'none' }}>{categoriesDefinition}</div>;
};

CustomCategoriesForm.displayName = 'CustomCategoriesForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
// @ts-ignore
export default withTaskContext(connector(CustomCategoriesForm));
