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
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import type { CategoriesDefinition } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';

import { RootState } from '../../states';
import useFocus from '../../utils/useFocus';
import { IssueCategorizationStateApi } from '../../states/contacts/issueCategorizationStateApi';
import { getAseloFeatureFlags } from '../../hrmConfig';
import {
  Box,
  CategoriesWrapper,
  CategoryRequiredText,
  CategorySubtitleSection,
  CategoryTitle,
  Container,
  ToggleViewButton,
} from '../../styles';
import Section from '../common/forms/Section';
import CategoryCheckboxes from '../common/forms/CategoryCheckboxes';

type OwnProps = {
  display: boolean;
  definition: CategoriesDefinition;
  autoFocus: boolean;
  stateApi: IssueCategorizationStateApi;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const IssueCategorizationSectionForm: React.FC<Props> = ({
  display,
  gridView,
  selectedCategories,
  expanded,
  definition,
  autoFocus,
  toggleCategoryExpanded,
  toggleSubcategory,
  setCategoriesGridView,
}) => {
  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);
  const selectedCount = Object.values(selectedCategories).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <Container formContainer={true}>
      <CategoryTitle searchTerm="">
        <Template code="Categories-Title" />
      </CategoryTitle>
      <CategorySubtitleSection>
        <CategoryRequiredText>
          <Template code="Error-CategoryRequired" />
        </CategoryRequiredText>
        <ToggleViewButton onClick={() => setCategoriesGridView(true)} active={gridView}>
          <GridIcon />
        </ToggleViewButton>
        <ToggleViewButton onClick={() => setCategoriesGridView(false)} active={!gridView}>
          <ListIcon />
        </ToggleViewButton>
      </CategorySubtitleSection>
      <CategoriesWrapper>
        {Object.entries(definition).map(([category, categoryDefinition], index) => (
          <Box marginBottom="6px" key={`IssueCategorization_${category}_${index}`}>
            <Section
              sectionTitle={category}
              color={categoryDefinition.color}
              expanded={expanded[category]}
              handleExpandClick={() => toggleCategoryExpanded(category)}
              htmlElRef={index === 0 ? firstElementRef : null}
              buttonDataTestid={`IssueCategorization-Section-${category}`}
            >
              <CategoryCheckboxes
                gridView={gridView}
                category={category}
                categoryDefinition={categoryDefinition}
                toggleSubcategory={toggleSubcategory}
                selectedSubcategories={selectedCategories[category] ?? []}
                counselorToolkitsEnabled={getAseloFeatureFlags().enable_counselor_toolkits}
                selectedCount={selectedCount}
              />
            </Section>
          </Box>
        ))}
      </CategoriesWrapper>
    </Container>
  );
};

IssueCategorizationSectionForm.displayName = 'IssueCategorizationTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  return ownProps.stateApi.retrieveState(state);
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  toggleSubcategory: ownProps.stateApi.toggleSubcategoryActionDispatcher(dispatch),
  toggleCategoryExpanded: ownProps.stateApi.toggleCategoryExpandedActionDispatcher(dispatch),
  setCategoriesGridView: ownProps.stateApi.setGridViewActionDispatcher(dispatch),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(IssueCategorizationSectionForm);

export default connected;
