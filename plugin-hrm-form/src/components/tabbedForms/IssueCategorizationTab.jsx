import React from 'react';
import PropTypes from 'prop-types';
import ListIcon from '@material-ui/icons/List';
import GridIcon from '@material-ui/icons/GridOn';
import { Template } from '@twilio/flex-ui';

import { formType } from '../../types';
import IssueCategory from './IssueCategory';
import { Container, CategoryErrorText } from '../../styles/HrmStyles';
import { isNotCategory, isNotSubcategory } from '../../states/ValidationRules';

const getCategories = form => {
  if (!form || !form.caseInformation || !form.caseInformation.categories) return [];

  return Object.entries(form.caseInformation.categories).filter(([name]) => !isNotCategory(name));
};

const filterSubcategories = subcategories => Object.keys(subcategories).filter(name => !isNotSubcategory(name));

const IssueCategorizationTab = ({ form, taskId, handleCategoryToggle }) => (
  <Container style={{ display: 'flex', flexDirection: 'column' }}>
    <p style={{ textTransform: 'uppercase' }}>
      <Template code="Categories-Title" />
    </p>
    <div style={{ display: 'flex', alignItems: 'center', margin: '6px 0' }}>
      <span style={{ flexGrow: 1 }}>
        {form.caseInformation.categories.error && (
          <CategoryErrorText>{form.caseInformation.categories.error}</CategoryErrorText>
        )}
      </span>
      <div
        style={{
          display: 'inline-flex',
          width: '37px',
          height: '37px',
          minHeight: '37px',
          borderRadius: '1px',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          backgroundColor: '#a0a8bdcc',
          opacity: '20%',
          cursor: 'pointer',
        }}
      >
        <GridIcon style={{ fontSize: '18px' }} />
      </div>
      <div
        style={{
          display: 'inline-flex',
          width: '37px',
          height: '37px',
          minHeight: '37px',
          border: '1px solid #a0a8bd33',
          borderRadius: '1px',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          color: '#000000cc',
          cursor: 'pointer',
        }}
      >
        <ListIcon style={{ fontSize: '18px' }} />
      </div>
    </div>
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
