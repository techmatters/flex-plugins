/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import type { CategoriesDefinition } from 'hrm-form-definitions';

import { RootState, namespace, contactFormsBase } from '../../states';
import * as actions from '../../states/contacts/actions';
import { CategoriesFromDefinition, createSubCategoriesInputs } from '../common/forms/categoriesTabGenerator';
import useFocus from '../../utils/useFocus';
import { CustomITask } from '../../types/types';
import { setCategoriesGridView, toggleCategoryExpanded } from '../../states/contacts/existingContacts';

type CommonOwnProps = {
  display: boolean;
  initialValue: string[];
  definition: CategoriesDefinition;
  autoFocus: boolean;
};

type FromTaskProps = CommonOwnProps & { task: CustomITask };
type FromExistingContactsProps = CommonOwnProps & { contactId: string };

type OwnProps = FromTaskProps | FromExistingContactsProps;

const isFromTaskProps = (props: OwnProps): props is FromTaskProps => Boolean((props as FromTaskProps).task);

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const IssueCategorizationTab: React.FC<Props> = props => {
  const isFromTask = isFromTaskProps(props);
  const entityIdentifier = (props as FromExistingContactsProps).contactId ?? (props as FromTaskProps).task.taskSid;
  const { display, categoriesMeta, initialValue, definition, autoFocus, updateForm } = props;

  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);

  const { getValues, setValue } = useFormContext();
  const IssueCategorizationTabDefinition = definition;

  const [, setCategories] = useState(initialValue);

  // Couldn't find a way to provide initial values to an field array, as a workaround, intentionally run this only on first render
  React.useEffect(() => {
    setValue('categories', initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subcategoriesInputs = React.useMemo(() => {
    const updateCallback = () => {
      const { categories } = getValues();
      if (isFromTask) {
        updateForm(entityIdentifier, 'categories', categories);
      } else {
        setCategories(categories);
      }
    };

    if (IssueCategorizationTabDefinition === null || IssueCategorizationTabDefinition === undefined) return {};
    return createSubCategoriesInputs(IssueCategorizationTabDefinition, ['categories'], updateCallback);
  }, [IssueCategorizationTabDefinition, getValues, entityIdentifier, updateForm, isFromTask]);

  const toggleExpandCategory = (category: string) =>
    isFromTaskProps(props)
      ? props.taskHandleExpandCategory(category, props.task.taskSid)
      : props.existingContactHandleExpandCategory(props.contactId, category);
  const toggleCategoriesGridView = (useGridView: boolean) =>
    isFromTaskProps(props)
      ? props.taskSetCategoriesGridView(useGridView, props.task.taskSid)
      : props.existingContactSetCategoriesGridView(props.contactId, useGridView);

  return (
    <CategoriesFromDefinition
      definition={IssueCategorizationTabDefinition}
      subcategoriesInputs={subcategoriesInputs}
      categoriesMeta={categoriesMeta}
      toggleCategoriesGridView={toggleCategoriesGridView}
      toggleExpandCategory={toggleExpandCategory}
      firstElementRef={firstElementRef}
    />
  );
};

IssueCategorizationTab.displayName = 'IssueCategorizationTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  if (isFromTaskProps(ownProps)) {
    return { categoriesMeta: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid].metadata.categories };
  }

  return { categoriesMeta: state[namespace][contactFormsBase].existingContacts[ownProps.contactId].categories };
};

const mapDispatchToProps = {
  updateForm: actions.updateForm,
  taskHandleExpandCategory: actions.handleExpandCategory,
  taskSetCategoriesGridView: actions.setCategoriesGridView,
  existingContactHandleExpandCategory: toggleCategoryExpanded,
  existingContactSetCategoriesGridView: setCategoriesGridView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(IssueCategorizationTab);

export default connected;
