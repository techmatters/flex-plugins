import React from 'react';
import PropTypes from 'prop-types';

import { formType } from '../../types';
import BranchingFormIssueCategory from './BranchingFormIssueCategory';
import { Container, ErrorText } from '../../styles/HrmStyles';

const getCategories = form => {
  if (!form || !form.caseInformation || !form.caseInformation.categories) return [];

  const notCategory = ['error', 'touched', 'type', 'validation'];
  return Object.entries(form.caseInformation.categories).filter(([name]) => !notCategory.includes(name));
};

const filterSubcategories = subcategories => Object.entries(subcategories).filter(([name]) => name !== 'type');

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
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: '20px',
        width: 'fit-content',
      }}
    >
      {getCategories(form).map(([name, subcategories]) => (
        <BranchingFormIssueCategory
          key={name}
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
