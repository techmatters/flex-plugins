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
  toolkiturl?: string;
};

export const createSubcategoryCheckbox = (
  subcategory: Subcategory,
  parents: string[],
  color: string,
  updateCallback: () => void,
  handleOpenConnectDialog: (event: any) => void,
  anchorEl: Element,
  handleCloseDialog: () => void,
  getHelplineName: () => void,
) => {
  const { label, toolkiturl } = subcategory;
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
      {toolkiturl && (
        <TooltipKit
          label={label}
          toolkiturl={toolkiturl}
          handleOpenConnectDialog={handleOpenConnectDialog}
          anchorEl={anchorEl}
          handleCloseDialog={handleCloseDialog}
          getHelplineName={getHelplineName}
        />
      )}
    </CategoryCheckboxWrapper>
  );
};

type TooltipKitProps = {
  label: string;
  toolkiturl: string;
  handleOpenConnectDialog: (event: any) => void;
  anchorEl: Element;
  handleCloseDialog: () => void;
  getHelplineName: () => void;
};

const TooltipKit: React.FC<TooltipKitProps> = ({
  label,
  toolkiturl,
  handleOpenConnectDialog,
  anchorEl,
  handleCloseDialog,
  getHelplineName,
}) => {
  const [toolkitUrl, setToolkitUrl] = useState(null);

  const getToolkitUrlAndDialog = e => {
    handleOpenConnectDialog(e);
    setToolkitUrl(toolkiturl);
  };

  const clearToolkitUrlAndDialog = () => {
    handleCloseDialog();
    setToolkitUrl(null);
  };

  return (
    <>
      <HtmlTooltip title={label} placement="bottom">
        <InformationIconButton onClick={getToolkitUrlAndDialog} />
      </HtmlTooltip>

      {toolkitUrl && (
        <ToolTipDialog
          anchorEl={anchorEl}
          handleCloseDialog={clearToolkitUrlAndDialog}
          toolkiturl={toolkitUrl}
          getHelplineName={getHelplineName}
        />
      )}
    </>
  );
};

type ToolTipDialogProps = {
  toolkiturl: string;
  anchorEl: Element;
  handleCloseDialog: () => void;
  getHelplineName: () => void;
};

const ToolTipDialog: React.FC<ToolTipDialogProps> = ({ anchorEl, handleCloseDialog, toolkiturl, getHelplineName }) => {
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
            <Template code="Toolkit-ConfirmTextOne" helpline={getHelplineName()} />
          </ConfirmText>
          <ConfirmText>
            <Template code="Toolkit-ConfirmTextTwo" />
          </ConfirmText>
          <Row>
            <CancelButton tabIndex={2} variant="text" size="medium" onClick={handleCloseDialog}>
              <Template code="SectionEntry-No" />
            </CancelButton>
            <Button
              href={toolkiturl}
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
  getHelplineName: () => void,
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
          getHelplineName,
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
