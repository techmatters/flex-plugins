/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import type { CategoriesDefinition, HelplineDefinitions, HelplineEntry } from 'hrm-form-definitions';

import { RootState } from '../../states';
import { CategoriesFromDefinition, createSubCategoriesInputs } from '../common/forms/categoriesTabGenerator';
import useFocus from '../../utils/useFocus';
import { IssueCategorizationStateApi } from '../../states/contacts/issueCategorizationStateApi';
import { getAseloFeatureFlags } from '../../hrmConfig';

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
  const featureFlags = getAseloFeatureFlags();

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
