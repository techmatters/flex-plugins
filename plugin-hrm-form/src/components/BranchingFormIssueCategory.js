import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@material-ui/core';

import { CategoryCheckboxField, StyledCheckboxLabel, StyledLabel } from '../Styles/HrmStyles';
import { formType } from '../types';

const BranchingFormIssueCategory = props => {
  const cat = props.category;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <StyledLabel>Category {cat}</StyledLabel>
      {Array.from(Array(6), (e, i) => {
        const index = i + 1;
        const id = `IssueCategorization_Category${props.category}_Subcategory${index}`;
        return (
          <CategoryCheckboxField>
            {/* TODO(nick): the inline style below is ugly */}
            <Checkbox
              style={{ width: 30, height: 30, boxSizing: 'border-box' }}
              checked={props.form.caseInformation.categories[`category${cat}`][`sub${index}`].value}
              id={id}
              onClick={() =>
                props.handleCategoryToggle(
                  props.taskId,
                  `category${cat}`,
                  `sub${index}`,
                  !props.form.caseInformation.categories[`category${cat}`][`sub${index}`].value,
                )
              }
            />
            <StyledCheckboxLabel htmlFor={id}>Subcategory {index}</StyledCheckboxLabel>
          </CategoryCheckboxField>
        );
      })}
    </div>
  );
};

BranchingFormIssueCategory.displayName = 'BranchingFormIssueCategory';
BranchingFormIssueCategory.propTypes = {
  category: PropTypes.string.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
  taskId: PropTypes.string.isRequired,
  form: formType.isRequired,
};

export default BranchingFormIssueCategory;
