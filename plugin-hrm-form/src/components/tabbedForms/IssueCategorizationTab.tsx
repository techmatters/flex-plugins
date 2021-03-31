/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { RootState, namespace, contactFormsBase } from '../../states';
import * as actions from '../../states/contacts/actions';
import type { TaskEntry } from '../../states/contacts/reducer';
import { CategoriesFromDefinition, createSubCategoriesInputs } from '../common/forms/categoriesTabGenerator';
import { TabbedFormTabContainer } from '../../styles/HrmStyles';
import type { CategoriesDefinition } from '../common/forms/types';
import type { CustomITask } from '../../types/types';

type OwnProps = {
  task: CustomITask;
  display: boolean;
  initialValue: TaskEntry['categories'];
  definition: CategoriesDefinition;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const IssueCategorizationTab: React.FC<Props> = ({
  task,
  display,
  categoriesMeta,
  initialValue,
  definition,
  updateForm,
  setCategoriesGridView,
  handleExpandCategory,
}) => {
  const { getValues, setValue } = useFormContext();
  const IssueCategorizationTabDefinition = definition;

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
});

const mapDispatchToProps = {
  updateForm: actions.updateForm,
  handleExpandCategory: actions.handleExpandCategory,
  setCategoriesGridView: actions.setCategoriesGridView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(IssueCategorizationTab);

export default connected;
