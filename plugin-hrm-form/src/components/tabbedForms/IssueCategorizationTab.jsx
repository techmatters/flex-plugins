import React from 'react';
import PropTypes from 'prop-types';
import ListIcon from '@material-ui/icons/List';
import GridIcon from '@material-ui/icons/GridOn';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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
import { isNotCategory, isNotSubcategory } from '../../states/ContactFormStateFactory';
import { Actions } from '../../states/ContactState';
import { namespace, contactFormsBase } from '../../states';

const getCategories = form => {
  if (!form || !form.caseInformation || !form.caseInformation.categories) return [];

  return Object.entries(form.caseInformation.categories).filter(([name]) => !isNotCategory(name));
};

const filterSubcategories = subcategories => Object.keys(subcategories).filter(name => !isNotSubcategory(name));

export const IssueCategorizationTab = ({
  form,
  taskId,
  handleCategoryToggle,
  gridView,
  expanded,
  setCategoriesGridView,
  handleExpandCategory,
}) => (
  <Container>
    <CategoryTitle>
      <Template code="Categories-Title" />
    </CategoryTitle>
    <CategorySubtitleSection>
      <CategoryRequiredText>
        <Template code="Error-CategoryRequired" />
      </CategoryRequiredText>
      <ToggleViewButton onClick={() => setCategoriesGridView(true, taskId)} active={gridView}>
        <GridIcon />
      </ToggleViewButton>
      <ToggleViewButton onClick={() => setCategoriesGridView(false, taskId)} active={!gridView}>
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
          gridView={gridView}
          expanded={expanded[name]}
          handleExpandCategory={handleExpandCategory}
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
  gridView: PropTypes.bool.isRequired,
  expanded: PropTypes.objectOf(PropTypes.bool).isRequired,
  setCategoriesGridView: PropTypes.func.isRequired,
  handleExpandCategory: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const { categories } = state[namespace][contactFormsBase].tasks[ownProps.taskId].metadata;
  const { gridView, expanded } = categories;

  return {
    gridView,
    expanded,
  };
};

const mapDispatchToProps = dispatch => ({
  setCategoriesGridView: bindActionCreators(Actions.setCategoriesGridView, dispatch),
  handleExpandCategory: bindActionCreators(Actions.handleExpandCategory, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(IssueCategorizationTab);
