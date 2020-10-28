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
} from '../../../styles/HrmStyles';
import type { CategoriesDefinition } from './types';
import type { TaskEntry } from '../../../states/contacts/reducer';
import { ConnectForm } from './formGenerators';

/*
 * export const getCategoriesCount = (categories: TaskEntry['categories']) =>
 *   Object.values(categories).reduce(
 *     (acc, subcategories) => acc + Object.values(subcategories).reduce((c, selected) => (selected ? c + 1 : c), 0),
 *     0,
 *   );
 */

// eslint-disable-next-line import/no-unused-modules
export const createSubcategoryCheckbox = (subcategory: string) => (parents: string[]) => (onToggle: () => void) => {
  const path = [...parents, subcategory].join('.');
  console.log('RECREATEDDDDDDDD')

  return (
    <ConnectForm key={path}>
      {({ register, getValues }) => {
        const { categories } = getValues();
        const disabled = categories && categories.length >= 3 && !categories.includes(path);

        return (
          <div>
            <label htmlFor={`${path}-checkbox`}>{subcategory}</label>
            <input
              key={`${path}-checkbox`}
              type="checkbox"
              name="categories"
              value={path}
              onChange={onToggle}
              ref={register({ required: true, minLength: 1, maxLength: 3 })}
              disabled={disabled}
            />
          </div>
        );
      }}
    </ConnectForm>
  );
};

type Props = {
  definition: CategoriesDefinition;
  parents: string[];
  onToggle: () => void;
  toggleCategoriesGridView: (gridView: boolean) => void;
  categoriesMeta: TaskEntry['metadata']['categories'];
  toggleExpandCategory: (category: string) => void;
};

const categoriesFromDefinition = ({
  definition,
  parents,
  onToggle,
  toggleCategoriesGridView,
  categoriesMeta,
  toggleExpandCategory,
}): Props => {
  const subcategoriesInputs = React.useMemo(
    () =>
      Object.entries(definition).reduce(
        (acc, [category, { subcategories }]) => ({
          ...acc,
          [category]: subcategories.map(subcategory => {
            return createSubcategoryCheckbox(subcategory)([...parents, category])(onToggle);
          }),
        }),
        {},
      ),
    [definition, onToggle, parents],
  );

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
        {Object.entries(definition).map(([category, { color }]) => (
          <Box marginBottom="6px" key={`IssueCategorization_${category}`}>
            <Section
              sectionTitle={category}
              color={color}
              expanded={expanded[category]}
              handleExpandClick={() => toggleExpandCategory(category)}
            >
              <SubcategoriesWrapper>{subcategoriesInputs[category]}</SubcategoriesWrapper>
            </Section>
          </Box>
        ))}
      </CategoriesWrapper>
    </Container>
  );
};

export default CategoriesFromDefinition;
