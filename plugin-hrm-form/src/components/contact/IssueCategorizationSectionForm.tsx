/* eslint-disable react/prop-types */
import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import type { CategoriesDefinition, HelplineDefinitions, HelplineEntry } from 'hrm-form-definitions';

import { RootState } from '../../states';
import { CategoriesFromDefinition, createSubCategoriesInputs } from '../common/forms/categoriesTabGenerator';
import useFocus from '../../utils/useFocus';
import { IssueCategorizationStateApi } from '../../states/contacts/issueCategorizationStateApi';
import { getConfig } from '../../HrmFormPlugin';

type OwnProps = {
  display: boolean;
  initialValue: string[];
  definition: CategoriesDefinition;
  autoFocus: boolean;
  stateApi: IssueCategorizationStateApi;
  helplineInformation: HelplineDefinitions;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const IssueCategorizationSectionForm: React.FC<Props> = ({
  display,
  categoriesMeta,
  initialValue,
  definition,
  autoFocus,
  updateForm,
  toggleCategoryExpanded,
  setCategoriesGridView,
  helplineInformation,
}) => {
  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);
  const { featureFlags } = getConfig();

  const { getValues, setValue } = useFormContext();
  const IssueCategorizationTabDefinition = definition;

  const [, setCategories] = useState(initialValue);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleCloseDialog = () => {
    setAnchorEl(null);
  };

  const handleOpenConnectDialog = e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  // Couldn't find a way to provide initial values to an field array, as a workaround, intentionally run this only on first render
  React.useEffect(() => {
    setValue('categories', initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subcategoriesInputs = React.useMemo(() => {
    const updateCallback = () => {
      const { categories } = getValues();
      updateForm(categories);
      setCategories(categories);
    };

    const getHelplineName = helplineInformation.helplines.find((data: HelplineEntry) => data.default);

    if (IssueCategorizationTabDefinition === null || IssueCategorizationTabDefinition === undefined) return {};
    const helplineName = getHelplineName.label;
    const counselorToolkitsEnabled = featureFlags.enable_counselor_toolkits;
    return createSubCategoriesInputs(
      IssueCategorizationTabDefinition,
      ['categories'],
      updateCallback,
      handleOpenConnectDialog,
      anchorEl,
      handleCloseDialog,
      helplineName,
      counselorToolkitsEnabled,
    );
  }, [
    IssueCategorizationTabDefinition,
    anchorEl,
    featureFlags.enable_counselor_toolkits,
    getValues,
    helplineInformation.helplines,
    updateForm,
  ]);

  return (
    <CategoriesFromDefinition
      definition={IssueCategorizationTabDefinition}
      subcategoriesInputs={subcategoriesInputs}
      categoriesMeta={categoriesMeta}
      toggleCategoriesGridView={setCategoriesGridView}
      toggleExpandCategory={toggleCategoryExpanded}
      firstElementRef={firstElementRef}
    />
  );
};

IssueCategorizationSectionForm.displayName = 'IssueCategorizationTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  return { categoriesMeta: ownProps.stateApi.retrieveState(state) };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  updateForm: ownProps.stateApi.updateFormActionDispatcher(dispatch),
  toggleCategoryExpanded: ownProps.stateApi.toggleCategoryExpandedActionDispatcher(dispatch),
  setCategoriesGridView: ownProps.stateApi.setGridViewActionDispatcher(dispatch),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(IssueCategorizationSectionForm);

export default connected;
