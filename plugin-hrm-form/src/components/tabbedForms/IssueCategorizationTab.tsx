/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState, namespace, contactFormsBase } from '../../states';
import { updateForm, handleExpandCategory, setCategoriesGridView } from '../../states/contacts/actions';
import IssueCategorizationTabDefinition from '../../formDefinitions/tabbedForms/IssueCategorizationTab.json';
import { CategoriesFromDefinition, createSubCategoriesInputs } from '../common/forms/categoriesTabGenerator';
import { TabbedFormTabContainer } from '../../styles/HrmStyles';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const IssueCategorizationTab: React.FC<Props> = ({ dispatch, task, display, categoriesMeta }) => {
  const { getValues } = useFormContext();

  const subcategoriesInputs = React.useMemo(() => {
    const updateCallback = () => {
      const { categories } = getValues();
      dispatch(updateForm(task.taskSid, 'categories', categories));
    };

    return createSubCategoriesInputs(IssueCategorizationTabDefinition, ['categories'], updateCallback);
  }, [dispatch, getValues, task.taskSid]);

  const toggleCategoriesGridView = (gridView: boolean) => {
    dispatch(setCategoriesGridView(!gridView, task.taskSid));
  };

  const toggleExpandCategory = (category: string) => {
    dispatch(handleExpandCategory(category, task.taskSid));
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

const connector = connect(mapStateToProps);
const connected = connector(IssueCategorizationTab);

export default withTaskContext<Props, typeof connected>(connected);
