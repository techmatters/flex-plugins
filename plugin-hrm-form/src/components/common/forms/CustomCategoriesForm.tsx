/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState, namespace, contactsBase } from '../../../states';
import * as actions from '../../../states/contacts/actions';
import { CategoriesFromDefinition, createSubCategoriesInputs } from './CategoriesFromDefinition';
import CategoriesDefinition from '../../../formDefinitions/categories.json';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CustomCategoriesForm: React.FC<Props> = ({
  display,
  task,
  categoriesMeta,
  updateForm,
  handleExpandCategory,
  setCategoriesGridView,
}) => {
  const { getValues } = useFormContext();

  const subcategoriesInputs = React.useMemo(() => {
    console.log('>>> categoriesDefinition useMemo called');

    const onToggle = () => {
      const { categories } = getValues();
      updateForm(task.taskSid, 'categories', categories);
    };

    return createSubCategoriesInputs(CategoriesDefinition, ['categories'], onToggle);
  }, [getValues, task.taskSid, updateForm]);

  const toggleCategoriesGridView = (gridView: boolean) => {
    setCategoriesGridView(gridView, task.taskSid);
  };

  const toggleExpandCategory = (category: string) => {
    handleExpandCategory(category, task.taskSid);
  };

  return (
    <div style={{ display: display ? 'block' : 'none' }}>
      <CategoriesFromDefinition
        definition={CategoriesDefinition}
        subcategoriesInputs={subcategoriesInputs}
        categoriesMeta={categoriesMeta}
        toggleCategoriesGridView={toggleCategoriesGridView}
        toggleExpandCategory={toggleExpandCategory}
      />
    </div>
  );
};

CustomCategoriesForm.displayName = 'CustomCategoriesForm';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  categoriesMeta: state[namespace][contactsBase].tasks[ownProps.task.taskSid].metadata.categories,
});

const mapDispatchToProps = {
  updateForm: actions.updateForm,
  handleExpandCategory: actions.handleExpandCategory,
  setCategoriesGridView: actions.setCategoriesGridView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
// @ts-ignore
export default withTaskContext(connector(CustomCategoriesForm));
