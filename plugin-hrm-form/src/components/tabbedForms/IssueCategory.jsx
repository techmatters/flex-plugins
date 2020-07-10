import React from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  SubcategoriesWrapper,
  CategoryCheckboxField,
  StyledCategoryCheckbox,
  StyledCategoryCheckboxLabel,
} from '../../styles/HrmStyles';
import { formType } from '../../types';
import Section from '../Section';
import { countSelectedCategories } from '../../states/ValidationRules';

const IssueCategory = props => {
  const lighterColor = `${props.color}99`; // Hex with alpha 0.6
  return (
    <Box marginBottom="6px">
      <Section
        sectionTitle={props.category}
        color={props.color}
        expanded={props.expanded}
        handleExpandClick={() => props.handleExpandCategory(props.category, props.taskId)}
      >
        <SubcategoriesWrapper gridView={props.gridView}>
          {props.subcategories.map(subcategoryName => {
            const id = `IssueCategorization_${props.category}_${subcategoryName}`;
            const { value } = props.form.caseInformation.categories[props.category][subcategoryName];
            const selectedCategories = countSelectedCategories(props.form.caseInformation.categories);
            const disabled = selectedCategories >= 3 && !value;
            const handleClickCheckboxField = e => {
              e.preventDefault();
              props.handleCategoryToggle(props.taskId, props.category, subcategoryName, !value);
            };
            return (
              <CategoryCheckboxField
                key={id}
                onClick={handleClickCheckboxField}
                color={lighterColor}
                selected={value}
                disabled={disabled}
              >
                <StyledCategoryCheckbox disabled={disabled} color={lighterColor} checked={value} id={id} />
                <StyledCategoryCheckboxLabel htmlFor={id} disabled={disabled}>
                  {subcategoryName}
                </StyledCategoryCheckboxLabel>
              </CategoryCheckboxField>
            );
          })}
        </SubcategoriesWrapper>
      </Section>
    </Box>
  );
};

IssueCategory.displayName = 'IssueCategory';
IssueCategory.propTypes = {
  color: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  subcategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  gridView: PropTypes.bool.isRequired,
  expanded: PropTypes.bool.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
  taskId: PropTypes.string.isRequired,
  form: formType.isRequired,
  handleExpandCategory: PropTypes.func.isRequired,
};

export default IssueCategory;
