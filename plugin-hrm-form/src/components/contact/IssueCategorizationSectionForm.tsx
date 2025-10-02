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
import { useDispatch, useSelector } from 'react-redux';
import type { CategoriesDefinition } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';
import { useFormContext } from 'react-hook-form';

import { RootState } from '../../states';
import useFocus from '../../utils/useFocus';
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
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { Contact } from '../../types/types';
import { setCategoriesGridView, toggleCategoryExpanded } from '../../states/contacts/existingContacts';
import { toggleSubcategory } from '../../states/contacts/categories';

type Props = {
  display: boolean;
  definition: CategoriesDefinition;
  autoFocus: boolean;
  contactId: Contact['id'];
};

const DEFAULT_MAXIMUM_SELECTIONS = 3;

const IssueCategorizationSectionForm: React.FC<Props> = ({ display, definition, autoFocus, contactId }) => {
  const {
    savedContact,
    draftContact,
    metadata: {
      categories: { expanded, gridView },
    },
  } = useSelector((state: RootState) => selectContactStateByContactId(state, contactId));
  const selectedCategories = getUnsavedContact(savedContact, draftContact).rawJson.categories;
  const dispatch = useDispatch();

  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);
  const selectedCount = Object.values(selectedCategories).reduce((acc, curr) => acc + curr.length, 0);

  const { clearErrors, register } = useFormContext();
  const maxSelections = definition.maxSelections ?? DEFAULT_MAXIMUM_SELECTIONS;

  // Add invisible field that errors if no category is selected (triggered by validation)
  React.useEffect(() => {
    register('categories.categorySelected', {
      validate: () => {
        if (selectedCount < 1) {
          return 'Error';
        }

        return null;
      },
    });
    register('categories.maxCategorySelected', {
      validate: () => {
        if (selectedCount > maxSelections) {
          return 'Error';
        }

        return null;
      },
    });
  }, [maxSelections, register, selectedCount]);

  // Clear the error state once the count is non-zero
  React.useEffect(() => {
    if (selectedCount) {
      clearErrors('categories.categorySelected');
    }
  }, [clearErrors, selectedCount]);

  return (
    <Container formContainer={true}>
      <CategoryTitle searchTerm="">
        <Template code="Categories-Title" />
      </CategoryTitle>
      <CategorySubtitleSection>
        <CategoryRequiredText>
          <Template code="Error-CategoryRequired" minSelections={1} maxSelections={maxSelections} />
        </CategoryRequiredText>
        <ToggleViewButton onClick={() => dispatch(setCategoriesGridView(contactId, true))} active={gridView}>
          <GridIcon />
        </ToggleViewButton>
        <ToggleViewButton onClick={() => dispatch(setCategoriesGridView(contactId, false))} active={!gridView}>
          <ListIcon />
        </ToggleViewButton>
      </CategorySubtitleSection>
      <CategoriesWrapper>
        {Object.entries(definition.categories).map(([category, categoryDefinition], index) => (
          <Box marginBottom="6px" key={`IssueCategorization_${category}_${index}`}>
            <Section
              sectionTitle={category}
              color={categoryDefinition.color}
              expanded={expanded[category]}
              handleExpandClick={() => dispatch(toggleCategoryExpanded(contactId, category))}
              htmlElRef={index === 0 ? firstElementRef : null}
              buttonDataTestid={`IssueCategorization-Section-${category}`}
            >
              <CategoryCheckboxes
                gridView={gridView}
                category={category}
                categoryDefinition={categoryDefinition}
                toggleSubcategory={(category, subcategory) =>
                  dispatch(toggleSubcategory(contactId, category, subcategory))
                }
                selectedSubcategories={selectedCategories[category] ?? []}
                counselorToolkitsEnabled={getAseloFeatureFlags().enable_counselor_toolkits}
                selectedCount={selectedCount}
                maxSelections={maxSelections}
              />
            </Section>
          </Box>
        ))}
      </CategoriesWrapper>
    </Container>
  );
};

IssueCategorizationSectionForm.displayName = 'IssueCategorizationTab';

export default IssueCategorizationSectionForm;
