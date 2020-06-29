import React from 'react';
import PropTypes from 'prop-types';

import { CategoryCheckboxField, StyledCategoryCheckbox, StyledCategoryCheckboxLabel } from '../../styles/HrmStyles';
import { formType } from '../../types';
import Section from '../Section';
import { countSelectedCategories } from '../../states/ValidationRules';

const IssueCategory = props => {
  const lighterColor = `${props.color}99`; // Hex with alpha 0.6
  return (
    <div style={{ marginBottom: 6 }}>
      <Section sectionTitle={props.category} color={props.color}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 0 10px 6px' }}>
          {props.subcategories.map(subcategoryName => {
            const id = `IssueCategorization_${props.category}_${subcategoryName}`;
            const { value } = props.form.caseInformation.categories[props.category][subcategoryName];
            const selectedCategories = countSelectedCategories(props.form.caseInformation.categories);
            const disabled = selectedCategories === 3 && !value;
            return (
              <CategoryCheckboxField key={id} color={lighterColor} selected={value} disabled={disabled}>
                <StyledCategoryCheckbox
                  disabled={disabled}
                  color={lighterColor}
                  checked={value}
                  id={id}
                  onClick={() => props.handleCategoryToggle(props.taskId, props.category, subcategoryName, !value)}
                />
                <StyledCategoryCheckboxLabel htmlFor={id} disabled={disabled}>
                  {subcategoryName}
                </StyledCategoryCheckboxLabel>
              </CategoryCheckboxField>
            );
          })}
        </div>
      </Section>
    </div>
  );
};

IssueCategory.displayName = 'IssueCategory';
IssueCategory.propTypes = {
  color: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  subcategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
  taskId: PropTypes.string.isRequired,
  form: formType.isRequired,
};

export default IssueCategory;
