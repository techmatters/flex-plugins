/* eslint-disable react/no-multi-comp */
/* eslint-disable import/no-unused-modules */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React from 'react';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';
import { Template } from '@twilio/flex-ui';

import Section from '../../Section';
import {
  Container,
  CategoryTitle,
  CategorySubtitleSection,
  CategoryRequiredText,
  ToggleViewButton,
  CategoriesWrapper,
  Box,
  SubcategoriesWrapper,
  CategoryCheckboxField,
  CategoryCheckbox,
  CategoryCheckboxLabel,
} from '../../../styles/HrmStyles';
import type { CategoriesDefinition, HTMLElementRef } from './types';
import { ConnectForm } from './formGenerators';

export const createSubcategoryCheckbox = (
  subcategory: string,
  parents: string[],
  color: string,
  updateCallback: () => void,
) => {
  const path = [...parents, subcategory].join('.');

  return (
    <ConnectForm key={path}>
      {({ register, getValues }) => {
        const { categories } = getValues();
        const checked = categories && categories.includes(path);
        const disabled = categories && categories.length >= 3 && !checked;
        const lighterColor = `${color}99`; // Hex with alpha 0.6

        return (
          <CategoryCheckboxLabel>
            <CategoryCheckboxField color={lighterColor} selected={checked} disabled={disabled}>
              <CategoryCheckbox
                key={`${path}-checkbox`}
                type="checkbox"
                name="categories"
                value={path}
                onChange={updateCallback}
                innerRef={register({ required: true, minLength: 1, maxLength: 3 })}
                disabled={disabled}
                color={lighterColor}
              />
              {subcategory}
            </CategoryCheckboxField>
          </CategoryCheckboxLabel>
        );
      }}
    </ConnectForm>
  );
};

type SubcategoriesMap = { [category: string]: ReturnType<typeof createSubcategoryCheckbox>[] };

export const createSubCategoriesInputs = (
  definition: CategoriesDefinition,
  parents: string[],
  updateCallback: () => void,
) =>
  Object.entries(definition).reduce<SubcategoriesMap>(
    (acc, [category, { subcategories, color }]) => ({
      ...acc,
      [category]: subcategories.map(subcategory => {
        return createSubcategoryCheckbox(subcategory, [...parents, category], color, updateCallback);
      }),
    }),
    {},
  );

type Props = {
  definition: CategoriesDefinition;
  subcategoriesInputs: ReturnType<typeof createSubCategoriesInputs>;
  toggleCategoriesGridView: (gridView: boolean) => void;
  categoriesMeta: any; // TaskEntry['metadata']['categories'];
  toggleExpandCategory: (category: string) => void;
  firstElementRef?: HTMLElementRef;
};

export const CategoriesFromDefinition: React.FC<Props> = ({
  subcategoriesInputs,
  definition,
  toggleCategoriesGridView,
  categoriesMeta,
  toggleExpandCategory,
  firstElementRef,
}) => {
  const { gridView, expanded } = categoriesMeta;

  return (
    <Container>
      <CategoryTitle>
        <Template code="Categories-Title" />
      </CategoryTitle>
      <CategorySubtitleSection>
        <CategoryRequiredText>
          <Template code="Error-CategoryRequired" />
        </CategoryRequiredText>
        <ToggleViewButton onClick={() => toggleCategoriesGridView(true)} active={gridView}>
          <GridIcon />
        </ToggleViewButton>
        <ToggleViewButton onClick={() => toggleCategoriesGridView(false)} active={!gridView}>
          <ListIcon />
        </ToggleViewButton>
      </CategorySubtitleSection>
      <CategoriesWrapper>
        {Object.entries(definition).map(([category, { color }], index) => (
          <Box marginBottom="6px" key={`IssueCategorization_${category}`}>
            <Section
              sectionTitle={category}
              color={color}
              expanded={expanded[category]}
              handleExpandClick={() => toggleExpandCategory(category)}
              htmlElRef={index === 0 ? firstElementRef : null}
            >
              <SubcategoriesWrapper gridView={gridView}>{subcategoriesInputs[category]}</SubcategoriesWrapper>
            </Section>
          </Box>
        ))}
      </CategoriesWrapper>
    </Container>
  );
};
