/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState, namespace, contactFormsBase, configurationBase } from '../../states';
import * as actions from '../../states/contacts/actions';
import type { TaskEntry } from '../../states/contacts/reducer';
import { CategoriesFromDefinition, createSubCategoriesInputs } from '../common/forms/categoriesTabGenerator';
import { TabbedFormTabContainer } from '../../styles/HrmStyles';

type OwnProps = { task: ITask; display: boolean; initialValue: TaskEntry['categories'] };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const IssueCategorizationTab: React.FC<Props> = ({
  task,
  display,
  categoriesMeta,
  initialValue,
  currentDefinitionVersion,
  updateForm,
  setCategoriesGridView,
  handleExpandCategory,
}) => {
  const { getValues, setValue } = useFormContext();
  const IssueCategorizationTabDefinition = currentDefinitionVersion.tabbedForms.IssueCategorizationTab;

  // Couldn't find a way to provide initial values to an field array, as a workaround, intentionally run this only on first render
  React.useEffect(() => {
    setValue('categories', initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subcategoriesInputs = React.useMemo(() => {
    const updateCallback = () => {
      const { categories } = getValues();
      updateForm(task.taskSid, 'categories', categories);
    };

    return createSubCategoriesInputs(IssueCategorizationTabDefinition, ['categories'], updateCallback);
  }, [IssueCategorizationTabDefinition, getValues, task.taskSid, updateForm]);

  const toggleCategoriesGridView = (gridView: boolean) => {
    setCategoriesGridView(gridView, task.taskSid);
  };

  const toggleExpandCategory = (category: string) => {
    handleExpandCategory(category, task.taskSid);
  };

  return (
    <TabbedFormTabContainer display={display}>
      <CategoriesFromDefinition
        definition={IssueCategorizationTabDefinition}
        subcategoriesInputs={subcategoriesInputs}
        categoriesMeta={categoriesMeta}
        toggleCategoriesGridView={toggleCategoriesGridView}
        toggleExpandCategory={toggleExpandCategory}
      />
    </TabbedFormTabContainer>
  );
};

IssueCategorizationTab.displayName = 'IssueCategorizationTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  categoriesMeta: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid].metadata.categories,
  currentDefinitionVersion: state[namespace][configurationBase].currentDefinitionVersion,
});

const mapDispatchToProps = {
  updateForm: actions.updateForm,
  handleExpandCategory: actions.handleExpandCategory,
  setCategoriesGridView: actions.setCategoriesGridView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(IssueCategorizationTab);

export default withTaskContext<Props, typeof connected>(connected);
