/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/no-multi-comp */
/* eslint-disable import/no-unused-modules */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import GridIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';
import { Template } from '@twilio/flex-ui';
import { CategoriesDefinition } from 'hrm-form-definitions';
import { Button, Popover } from '@material-ui/core';

import Section from './Section';
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
  InformationIconButton,
  HtmlTooltip,
  CategoryCheckboxWrapper,
  Row,
} from '../../../styles/HrmStyles';
import type { HTMLElementRef } from './types';
import { ConnectForm } from './formGenerators';
import { ConfirmContainer, ConfirmText, CancelButton } from '../../../styles/search';
import TabPressWrapper from '../../TabPressWrapper';

type Subcategory = {
  label: string;
  toolkitUrl?: string;
};

export const createSubcategoryCheckbox = (
  subcategory: Subcategory,
  parents: string[],
  color: string,
  updateCallback: () => void,
  handleOpenConnectDialog: (event: any) => void,
  anchorEl: Element,
  handleCloseDialog: () => void,
  helplineName: string,
  counselorToolkitsEnabled: boolean,
) => {
  const { label, toolkitUrl } = subcategory;
  const path = [...parents, label].join('.');

  return (
    <CategoryCheckboxWrapper>
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
                  ref={register({ required: true, minLength: 1, maxLength: 3 })}
                  disabled={disabled}
                  color={lighterColor}
                />
                {label}
              </CategoryCheckboxField>
            </CategoryCheckboxLabel>
          );
        }}
      </ConnectForm>
      {counselorToolkitsEnabled && toolkitUrl && (
        <ToolkitLink
          label={label}
          toolkitUrl={toolkitUrl}
          handleOpenConnectDialog={handleOpenConnectDialog}
          anchorEl={anchorEl}
          handleCloseDialog={handleCloseDialog}
          helplineName={helplineName}
        />
      )}
    </CategoryCheckboxWrapper>
  );
};

type ToolkitLinkProps = {
  label: string;
  toolkitUrl: string;
  handleOpenConnectDialog: (event: any) => void;
  anchorEl: Element;
  handleCloseDialog: () => void;
  helplineName: string;
};

const ToolkitLink: React.FC<ToolkitLinkProps> = ({
  label,
  toolkitUrl,
  handleOpenConnectDialog,
  anchorEl,
  handleCloseDialog,
  helplineName,
}) => {
  const [dialogToolkitUrl, setDialogToolkitUrl] = useState(null);

  const getToolkitUrlAndDialog = e => {
    handleOpenConnectDialog(e);
    setDialogToolkitUrl(toolkitUrl);
  };

  const clearToolkitUrlAndDialog = () => {
    handleCloseDialog();
    setDialogToolkitUrl(null);
  };

  return (
    <>
      <HtmlTooltip title={label} placement="bottom">
        <InformationIconButton onClick={getToolkitUrlAndDialog} />
      </HtmlTooltip>

      {dialogToolkitUrl && (
        <ToolTipDialog
          anchorEl={anchorEl}
          handleCloseDialog={clearToolkitUrlAndDialog}
          toolkitUrl={dialogToolkitUrl}
          helplineName={helplineName}
        />
      )}
    </>
  );
};

type ToolTipDialogProps = {
  toolkitUrl: string;
  anchorEl: Element;
  handleCloseDialog: () => void;
  helplineName: string;
};

const ToolTipDialog: React.FC<ToolTipDialogProps> = ({ anchorEl, handleCloseDialog, toolkitUrl, helplineName }) => {
  const isOpen = Boolean(anchorEl);
  const id = isOpen ? 'simple-popover' : undefined;

  return (
    <Popover
      id={id}
      open={isOpen}
      anchorReference="anchorPosition"
      anchorPosition={{ top: 200, left: 400 }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <TabPressWrapper>
        <ConfirmContainer>
          <ConfirmText>
            <Template code="Toolkit-ConfirmTextOne" helpline={helplineName} />
          </ConfirmText>
          <ConfirmText>
            <Template code="Toolkit-ConfirmTextTwo" />
          </ConfirmText>
          <Row>
            <CancelButton tabIndex={2} variant="text" size="medium" onClick={handleCloseDialog}>
              <Template code="SectionEntry-No" />
            </CancelButton>
            <Button
              href={toolkitUrl}
              onClick={handleCloseDialog}
              target="_blank"
              rel="noreferrer"
              tabIndex={1}
              variant="contained"
              size="medium"
              style={{ backgroundColor: '#000', color: '#fff', marginLeft: 20 }}
            >
              <Template code="SectionEntry-Yes" />
            </Button>
          </Row>
        </ConfirmContainer>
      </TabPressWrapper>
    </Popover>
  );
};

type SubcategoriesMap = { [category: string]: ReturnType<typeof createSubcategoryCheckbox>[] };

export const createSubCategoriesInputs = (
  definition: CategoriesDefinition,
  parents: string[],
  updateCallback: () => void,
  handleOpenConnectDialog: (event: any) => void,
  anchorEl: Element,
  handleCloseDialog: () => void,
  helplineName: string,
  counselorToolkitsEnabled: boolean,
) =>
  Object.entries(definition).reduce<SubcategoriesMap>(
    (acc, [category, { subcategories, color }]) => ({
      ...acc,
      [category]: subcategories.map(subcategory => {
        return createSubcategoryCheckbox(
          subcategory,
          [...parents, category],
          color,
          updateCallback,
          handleOpenConnectDialog,
          anchorEl,
          handleCloseDialog,
          helplineName,
          counselorToolkitsEnabled,
        );
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
              buttonDataTestid={`IssueCategorization-Section-${category}`}
            >
              <SubcategoriesWrapper gridView={gridView}>{subcategoriesInputs[category]}</SubcategoriesWrapper>
            </Section>
          </Box>
        ))}
      </CategoriesWrapper>
    </Container>
  );
};
