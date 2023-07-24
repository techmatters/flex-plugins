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

import { styled } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';

import { Box, Column, Flex, Absolute, Row, FontOpenSans } from './HrmStyles';
import HrmTheme from './HrmTheme';

export const ResourcePreviewWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 10px;
  padding: 5px 20px 10px 20px;
  width: 730px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);
  border-radius: 4px;
`;
ResourcePreviewWrapper.displayName = 'ResourcePreviewWrapper';

export const ResourcePreviewHeaderText = styled(FontOpenSans)`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #192b33;
  text-decoration: underline;
`;

export const ReferrableResourcesContainer = styled(Flex)`
  margin: 20px;
  max-width: 800px;
  width: 100%;
`;
ReferrableResourcesContainer.displayName = 'ReferrableResourcesContainer';

export const ResourceTitle = styled('p')`
  color: #192b33;
  font-family: Inter, sans-serif;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
`;
ResourceTitle.displayName = 'ResourceTitle';

export const ViewResourceArea = styled('div')`
  width: 100%;
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  overflow-y: auto;
`;
ViewResourceArea.displayName = 'ViewResourceArea';

export const ResourceAttributesContainer = styled(Row)`
  align-items: start;
`;
ResourceAttributesContainer.displayName = 'ResourceAttributesContainer';

type ResourceAttributesColumnProps = {
  addDivider?: boolean;
};
export const ResourceAttributesColumn = styled(Column)<ResourceAttributesColumnProps>`
  flex: 1;
  margin: 5px;
  border-right: ${props => (props.addDivider ? '2px solid rgba(53, 61, 63, 0.3)' : 'none')};
  padding-right: ${props => (props.addDivider ? '5px' : 'none')};
`;

export const ResourceAttributeDescription = styled(FontOpenSans)`
  color: #192b33;
  font-size: 12px;
  line-height: 20px;
  font-weight: bold;
`;
ResourceAttributeDescription.displayName = 'ResourceAttributeDescription';

export const ResourceAttributeContent = styled(FontOpenSans)`
  color: #192b33;
  font-size: 12px;
  white-space: break-spaces;
  padding-bottom: 5px;
  line-height: initial;
`;
ResourceAttributeContent.displayName = 'ResourceAttributeContent';

export const ResourceCategoriesContainer = styled(Row)`
  flex-wrap: wrap;
`;
ResourceCategoriesContainer.displayName = 'ResourceCategoriesContainer';

export const ResourcesSearchArea = styled('div')`
  margin: 10px;
  max-width: 800px;
  width: 100%;
  padding: 10px;
  overflow-y: auto;
`;
ViewResourceArea.displayName = 'ViewResourceArea';

export const ResourcesSearchFormArea = styled('div')`
  width: 100%;
  padding: 20px;
  flex-grow: 1;
`;

export const ResourcesSearchFormSettingBox = styled('div')`
  width: 100%;
  background-color: white;
  padding: 17px;
  margin: 4px 4px 4px 0;
`;

export const ResourcesSearchFormContainer = styled(Column)`
  width: 100%;
  justify-content: space-between;
  max-width: 800px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: black;
`;

export const ResourcesSearchFormTopRule = styled('hr')`
  color: #d8d8d8;
  background-color: #d8d8d8;
  height: 1px;
  width: 100%;
  margin-left: 5px;
  border: 0;
  border-top: 1px solid #d8d8d8;
`;

export const ResourcesSearchTitle = styled(FontOpenSans)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  display: inline-block;
  color: #192b33;
`;
ResourcesSearchTitle.displayName = 'ResourcesSearchTitle';

export const ResourcesSearchFormSectionHeader = styled(FontOpenSans)`
  font-size: 14px;
  line-height: 24px;
  font-weight: 700;
  display: inline-block;
  color: #192b33;
  margin-bottom: 5px;
  margin-top: 10px;
`;
ResourcesSearchFormSectionHeader.displayName = 'ResourcesSearchFormSectionHeader';

export const ResourcesSearchFormFilterHeader = styled(FontOpenSans)`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  display: inline-block;
  color: black;
`;
ResourcesSearchFormFilterHeader.displayName = 'ResourcesSearchFormFilterHeader';

export const ResourcesSearchResultsHeader = styled(Box)`
  box-shadow: 0 -2px 2px 0 rgba(0, 0, 0, 0.1);
  padding-top: 15px;
  padding-bottom: 15px;
`;
ResourcesSearchResultsHeader.displayName = 'ResourcesSearchResultsHeader';

export const ResourcesSearchResultsList = styled(`ul`)`
  margin: 0;
  padding: 0;
  list-style: none;
`;
ResourcesSearchResultsHeader.displayName = 'ResourcesSearchResultsList';

export const ResourcesSearchResultsDescription = styled(FontOpenSans)`
  font-size: 13px;
  line-height: 21px;
  color: #192b33;
`;
ResourcesSearchResultsDescription.displayName = 'ResourcesSearchResultsDescription';

export const ResourcesSearchResultsDescriptionItem = styled('span')`
  padding-left: 5px;
`;
ResourcesSearchResultsDescriptionItem.displayName = 'ResourcesSearchResultsDescriptionItem';

export const PrivateResourceAttribute = styled('div')`
  background-color: #fefad3;
  border: 2px solid #ecb622;
  color: #a8813c;
  padding: 10px;
  margin: 2px 5px 2px 1px;
`;
PrivateResourceAttribute.displayName = 'PrivateResourceAttribute';

// ViewResource Page
export const ResourceViewContainer = styled(Absolute)`
  height: 100%;
  width: 1280px;
  background-color: #f6f6f6;
`;
ResourceViewContainer.displayName = 'ResourceViewContainer';

type ColorProps = {
  color?: string;
};
export const SectionTitleContainer = styled(Row)<ColorProps>`
  background-color: #ecedf1;
  padding: 8px 5px 8px;
  margin: 2px 0;
  border-left: ${({ color }) => (color ? `6px solid ${color}` : 'none')};
`;
SectionTitleContainer.displayName = 'SectionTitleContainer';

export const SectionTitleButton = styled(ButtonBase)`
  width: 100%;
  padding: 0;
  &:focus {
    outline: auto;
  }
`;
SectionTitleButton.displayName = 'SectionTitleButton';

export const SectionTitleText = styled(FontOpenSans)`
  margin-right: auto;
  color: #192b33;
  font-size: 12px;
  font-weight: 600;
  line-height: 13px;
`;
SectionTitleText.displayName = 'SectionTitleText';

export const ResourceSubtitle = styled(FontOpenSans)`
  color: #9b9b9b;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  width: max-content;
`;
ResourceSubtitle.displayName = 'ResourceSubtitle';

type AutoCompleteProps = {
  border?: string;
};

export const AutoCompleteDropdown = styled('div')<AutoCompleteProps>`
  background-color: #fff;
  margin-bottom: 140px;
  width: 95.3%;
  display: flex;
  flex-direction: column;
  border: 1px solid #979797;
  border-radius: 4px;
  padding: 0 15px;
  margin-top: -36px;
  margin-left: 18px;
  z-index: 1;

  &:empty {
    border: none;
  }
`;

export const AutoCompleteDropdownRow = styled('div')`
  position: relative;
  cursor: pointer;
  font-family: Open Sans;
  text-align: start;
  font-size: 13px;
  margin: 4px 0;
  background-color: white;
  padding: 10px 0 10px 15px;
  width: 100%;
  color: #192b33;
  font-style: normal;
  font-weight: 400;
  line-height: 30px;

  &:last-child {
    padding-bottom: 17px;
  }

  &:hover {
    background-blend-mode: darken;
    background: ${HrmTheme.colors.inputBackgroundColor};
  }
`;
