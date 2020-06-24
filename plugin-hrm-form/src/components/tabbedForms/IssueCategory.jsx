import React from 'react';
import PropTypes from 'prop-types';

import {
  CategoryCheckboxField,
  StyledCategoryCheckbox,
  StyledCategoryCheckboxLabel,
  StyledLabel,
} from '../../styles/HrmStyles';
import { formType } from '../../types';

const IssueCategory = props => {
  const color = `${props.color}99`; // Hex with alpha 0.6
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <StyledLabel>{props.category}</StyledLabel>
      {props.subcategories.map(subcategoryName => {
        const id = `IssueCategorization_${props.category}_${subcategoryName}`;
        const { value } = props.form.caseInformation.categories[props.category][subcategoryName];
        const disabled = false;
        return (
          <CategoryCheckboxField key={id} color={color} selected={value} disabled={disabled}>
            <StyledCategoryCheckbox
              disabled={disabled}
              color={color}
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
