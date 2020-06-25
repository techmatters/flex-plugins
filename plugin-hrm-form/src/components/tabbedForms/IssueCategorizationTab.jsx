import React from 'react';
import PropTypes from 'prop-types';

import { formType } from '../../types';
import IssueCategory from './IssueCategory';
import { Container, ErrorText } from '../../styles/HrmStyles';
import { isNotCategory, isNotSubcategory } from '../../states/ValidationRules';

const getCategories = form => {
  if (!form || !form.caseInformation || !form.caseInformation.categories) return [];

  return Object.entries(form.caseInformation.categories).filter(([name]) => !isNotCategory(name));
};

const filterSubcategories = subcategories => Object.keys(subcategories).filter(name => !isNotSubcategory(name));

const IssueCategorizationTab = ({ form, taskId, handleCategoryToggle }) => (
  <Container style={{ display: 'flex', flexDirection: 'column' }}>
    {form.caseInformation.categories.error ? (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px' }}>
        <ErrorText>{form.caseInformation.categories.error}</ErrorText>
      </div>
    ) : (
      ''
    )}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '20px',
      }}
    >
      {getCategories(form).map(([name, subcategories]) => (
        <IssueCategory
          key={name}
          color={subcategories.color}
          category={name}
          subcategories={filterSubcategories(subcategories)}
          handleCategoryToggle={handleCategoryToggle}
          taskId={taskId}
          form={form}
        />
      ))}
    </div>
  </Container>
);

IssueCategorizationTab.displayName = 'IssueCategorizationTab';
IssueCategorizationTab.propTypes = {
  form: formType.isRequired,
  taskId: PropTypes.string.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
};

export default IssueCategorizationTab;
