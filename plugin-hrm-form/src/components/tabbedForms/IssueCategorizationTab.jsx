import React from 'react';
import PropTypes from 'prop-types';

import { formType } from '../../types';
import BranchingFormIssueCategory from './BranchingFormIssueCategory';
import { Container, ErrorText } from '../../Styles/HrmStyles';

const IssueCategorizationTab = ({ form, taskId, handleCategoryToggle }) => (
  <Container style={{ display: 'flex', flexDirection: 'column' }}>
    {form.caseInformation.categories.error ? (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px' }}>
        <ErrorText>{form.caseInformation.categories.error}</ErrorText>
      </div>
    ) : (
      ''
    )}
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px' }}>
      <BranchingFormIssueCategory
        category="1"
        handleCategoryToggle={handleCategoryToggle}
        taskId={taskId}
        form={form}
      />
      <BranchingFormIssueCategory
        category="2"
        handleCategoryToggle={handleCategoryToggle}
        taskId={taskId}
        form={form}
      />
      <BranchingFormIssueCategory
        category="3"
        handleCategoryToggle={handleCategoryToggle}
        taskId={taskId}
        form={form}
      />
    </div>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
      <BranchingFormIssueCategory
        category="4"
        handleCategoryToggle={handleCategoryToggle}
        taskId={taskId}
        form={form}
      />
      <BranchingFormIssueCategory
        category="5"
        handleCategoryToggle={handleCategoryToggle}
        taskId={taskId}
        form={form}
      />
      <BranchingFormIssueCategory
        category="6"
        handleCategoryToggle={handleCategoryToggle}
        taskId={taskId}
        form={form}
      />
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
