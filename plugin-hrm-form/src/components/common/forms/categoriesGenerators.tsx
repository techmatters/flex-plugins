/* eslint-disable react/display-name */
/* eslint-disable import/no-unused-modules */
import React from 'react';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';
import { ITask, Template, withTaskContext } from '@twilio/flex-ui';
import { Controller } from 'react-hook-form';
import { get } from 'lodash';

import Section from '../../Section';
import {
  Container,
  CategoryTitle,
  CategorySubtitleSection,
  CategoryRequiredText,
  ToggleViewButton,
  CategoriesWrapper,
  CategoryCheckboxField,
  StyledCategoryCheckbox,
  StyledCategoryCheckboxLabel,
  Box,
  SubcategoriesWrapper,
} from '../../../styles/HrmStyles';
import type { CategoriesDefinition } from './types';
import type { TaskEntry } from '../../../states/contacts/reducer';
import { ConnectForm } from './formGenerators';

export const getCategoriesCount = (categories: TaskEntry['categories']) =>
  Object.values(categories).reduce(
    (acc, subcategories) => acc + Object.values(subcategories).reduce((c, selected) => (selected ? c + 1 : c), 0),
    0,
  );

export const createSubcategoryCheckbox = (subcategory: string) => (parents: string[]) => (onToggle: () => void) => {
  const path = [...parents, subcategory].join('.');

  return (
    <ConnectForm key={path}>
      {({ errors, register }) => {
        const validate = data => {
          console.log(data);
          // const selectedCount = getCategoriesCount(categories);

          // if (selectedCount >= 1 && selectedCount <= 3) return null;

          return 'Invalid count of selected categories';
        };

        // const error = get(errors, path);
        return (
          <div>
            <label htmlFor={path}>{subcategory}</label>
            <input type="checkbox" name={path} onChange={onToggle} ref={register} />
            {/* {error && renderError(error)} */}
          </div>
        );
      }}
    </ConnectForm>
  );
};

export const createCategoriesFromDefinition = (definition: CategoriesDefinition) => (parents: string[]) => (
  onToggle: () => void,
) => {
  return (
    <Container>
      <CategoryTitle>
        <Template code="Categories-Title" />
      </CategoryTitle>
      <CategorySubtitleSection>
        <CategoryRequiredText>
          <Template code="Error-CategoryRequired" />
        </CategoryRequiredText>
        {/* <ToggleViewButton onClick={() => setCategoriesGridView(true, task.taskSid)} active={gridView}>
          <GridIcon />
        </ToggleViewButton>
        <ToggleViewButton onClick={() => setCategoriesGridView(false, task.taskSid)} active={!gridView}>
          <ListIcon />
        </ToggleViewButton> */}
      </CategorySubtitleSection>
      <CategoriesWrapper>
        {Object.entries(definition).map(([category, { subcategories, color }]) => (
          <Box marginBottom="6px" key={`IssueCategorization_${category}`}>
            <Section
              sectionTitle={category}
              color={color}
              expanded={true}
              // handleExpandClick={() => props.handleExpandCategory(props.category, props.taskId)}
            >
              <SubcategoriesWrapper>
                {subcategories.map(subcategory => {
                  // const id = `IssueCategorization_${category}_${subcategory}`;
                  return createSubcategoryCheckbox(subcategory)([...parents, category])(onToggle);
                })}
              </SubcategoriesWrapper>
            </Section>
          </Box>
        ))}
      </CategoriesWrapper>
    </Container>
  );
};
