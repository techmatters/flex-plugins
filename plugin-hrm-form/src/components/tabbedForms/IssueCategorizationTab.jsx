import React from 'react';
import PropTypes from 'prop-types';

import { formType } from '../../types';
import BranchingFormIssueCategory from './BranchingFormIssueCategory';
import { Container, ErrorText } from '../../styles/HrmStyles';

const IssueCategorizationTab = ({ form, taskId, handleCategoryToggle }) => {
  console.log({ catgories: form.caseInformation.categories, entries: Object.entries(form.caseInformation.categories) });

  return (
    <Container style={{ display: 'flex', flexDirection: 'column' }}>
      {form.caseInformation.categories.error ? (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px' }}>
          <ErrorText>{form.caseInformation.categories.error}</ErrorText>
        </div>
      ) : (
        ''
      )}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '20px' }}>
        {form.caseInformation.categories &&
          Object.entries(form.caseInformation.categories).map(([name, subcategories]) => (
            <BranchingFormIssueCategory
              key={name}
              category={name}
              subcategories={Object.entries(subcategories)}
              handleCategoryToggle={handleCategoryToggle}
              taskId={taskId}
              form={form}
            />
          ))}
      </div>
  </Container>
  );
};

IssueCategorizationTab.displayName = 'IssueCategorizationTab';
IssueCategorizationTab.propTypes = {
  form: formType.isRequired,
  taskId: PropTypes.string.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
};

export default IssueCategorizationTab;
