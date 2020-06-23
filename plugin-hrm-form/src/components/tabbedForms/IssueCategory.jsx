import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@material-ui/core';

import { CategoryCheckboxField, StyledCheckboxLabel, StyledLabel } from '../../styles/HrmStyles';
import { formType } from '../../types';

const IssueCategory = props => {
  console.log({ color: props.color });
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <StyledLabel>{props.category}</StyledLabel>
      {props.subcategories.map(subcategoryName => {
        const id = `IssueCategorization_${props.category}_${subcategoryName}`;
        return (
          <CategoryCheckboxField key={id}>
            <Checkbox
              style={{ width: 30, height: 30, boxSizing: 'border-box' }}
              checked={props.form.caseInformation.categories[props.category][subcategoryName].value}
              id={id}
              onClick={() =>
                props.handleCategoryToggle(
                  props.taskId,
                  props.category,
                  subcategoryName,
                  !props.form.caseInformation.categories[props.category][subcategoryName].value,
                )
              }
            />
            <StyledCheckboxLabel htmlFor={id}>{subcategoryName}</StyledCheckboxLabel>
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
