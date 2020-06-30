import React from 'react';
import PropTypes from 'prop-types';
import ListIcon from '@material-ui/icons/List';
import GridIcon from '@material-ui/icons/GridOn';
import { Template } from '@twilio/flex-ui';

import { formType } from '../../types';
import IssueCategory from './IssueCategory';
import {
  Container,
  CategoryTitle,
  CategorySubtitleSection,
  CategoryRequiredText,
  ToggleViewButton,
  CategoriesWrapper,
} from '../../styles/HrmStyles';
import { isNotCategory, isNotSubcategory } from '../../states/ValidationRules';

const getCategories = form => {
  if (!form || !form.caseInformation || !form.caseInformation.categories) return [];

  return Object.entries(form.caseInformation.categories).filter(([name]) => !isNotCategory(name));
};

const filterSubcategories = subcategories => Object.keys(subcategories).filter(name => !isNotSubcategory(name));

const IssueCategorizationTab = ({ form, taskId, handleCategoryToggle }) => (
  <Container>
    <CategoryTitle>
      <Template code="Categories-Title" />
    </CategoryTitle>
    <CategorySubtitleSection>
      <CategoryRequiredText>
        <Template code="Error-CategoryRequired" />
      </CategoryRequiredText>
      <ToggleViewButton>
        <GridIcon />
      </ToggleViewButton>
      <ToggleViewButton active>
        <ListIcon />
      </ToggleViewButton>
    </CategorySubtitleSection>
    <CategoriesWrapper>
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
    </CategoriesWrapper>
  </Container>
);

IssueCategorizationTab.displayName = 'IssueCategorizationTab';
IssueCategorizationTab.propTypes = {
  form: formType.isRequired,
  taskId: PropTypes.string.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
};

export default IssueCategorizationTab;
