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

import { Box, Column, Flex, Row, FontOpenSans, PreviewWrapper } from '../../styles/HrmStyles';
import { StyledNextStepButton } from '../../styles/buttons';
import HrmTheme from '../../styles/HrmTheme';

export const ResourcePreviewWrapper = styled(PreviewWrapper)`
  width: 730px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);
`;
ResourcePreviewWrapper.displayName = 'ResourcePreviewWrapper';

export const ResourcePreviewHeaderText = styled(FontOpenSans)`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: #192b33;
  text-decoration: underline;
`;

export const ResourcePreviewAttributeDescription = styled(FontOpenSans)`
  color: #192b33;
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;
ResourcePreviewAttributeDescription.displayName = 'ResourcePreviewAttributeDescription';

export const ResourcePreviewAttributeContent = styled(FontOpenSans)`
  color: #192b33;
  font-size: 14px;
  white-space: break-spaces;
  padding-bottom: 5px;
  line-height: initial;
`;
ResourcePreviewAttributeContent.displayName = 'ResourcePreviewAttributeContent';

export const ReferrableResourcesContainer = styled(Flex)`
  padding: 10px 20px 20px 25px;
  max-width: 1230px;
  width: 100%;
  background-color: #f6f6f6;
  overflow-y: auto;
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
  padding: 25px;
  border-radius: 4px;
  overflow-y: auto;
`;
ViewResourceArea.displayName = 'ViewResourceArea';

export const ResourceAttributesContainer = styled(Row)`
  align-items: stretch;
`;
ResourceAttributesContainer.displayName = 'ResourceAttributesContainer';

type ResourceAttributesColumnProps = {
  addDivider?: boolean;
};
export const ResourceAttributesColumn = styled(Column)<ResourceAttributesColumnProps>`
  flex: 1;
  margin: 5px;
  border-right: ${props => (props.addDivider ? '1px solid #d8d8d8' : 'none')};
  padding: ${props => (props.addDivider ? '0 15px 0 10px' : '0 10px 0 10px')};
`;

export const ResourceAttributeDescription = styled(FontOpenSans)`
  color: #192b33;
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;
ResourceAttributeDescription.displayName = 'ResourceAttributeDescription';

export const ResourceAttributeContent = styled(FontOpenSans)`
  color: #121c2e;
  font-size: 13px;
  white-space: break-spaces;
  padding-bottom: 5px;
  line-height: initial;
`;
ResourceAttributeContent.displayName = 'ResourceAttributeContent';

export const ResourcesSearchArea = styled('div')`
  max-width: 800px;
  width: 100%;
  overflow-y: auto;
  background-color: #f6f6f6;
  padding: 0 10px 0 5px;
`;
ViewResourceArea.displayName = 'ViewResourceArea';

export const ResourcesSearchFormArea = styled('div')`
  width: 100%;
  padding: 10px 20px 10px 20px;
  flex-grow: 1;
`;

export const ResourcesSearchFormSettingBox = styled('div')`
  width: 100%;
  background-color: white;
  padding: 17px;
  margin: 4px 0 4px 0;
  border-radius: 4px;
  border: #e6e6e6 1px solid;
`;

export const ResourcesSearchFormContainer = styled(Column)`
  width: 100%;
  background-color: #f6f6f6;
  justify-content: space-between;
  max-width: 800px;
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
  color: black;
`;

export const ResourcesSearchFormTopRule = styled('hr')`
  color: #d8d8d8;
  background-color: #d8d8d8;
  height: 1px;
  width: 100%;
  margin: 0 5px 0 5px;
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
  margin-bottom: 10px;
  margin-top: 10px;
`;
ResourcesSearchFormSectionHeader.displayName = 'ResourcesSearchFormSectionHeader';

export const ResourcesSearchFormFilterHeader = styled(FontOpenSans)`
  font-size: 13px;
  line-height: 18px;
  margin-bottom: 8px;
  font-weight: 600;
  display: inline-block;
  color: black;
`;
ResourcesSearchFormFilterHeader.displayName = 'ResourcesSearchFormFilterHeader';

export const ResourceSearchFormClearButton = styled(StyledNextStepButton)`
  margin-right: 15px;
  background: transparent !important; // Not sure why the important flag is needed here to override a style with less specificity
`;

export const ResourcesSearchResultsHeader = styled(Box)`
  margin-left: 25px;
  padding-top: 15px;
  padding-bottom: 15px;
`;
ResourcesSearchResultsHeader.displayName = 'ResourcesSearchResultsHeader';

export const ResourcesSearchResultsList = styled(`ul`)`
  margin: 0 0 0 25px;
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
export const ResourceViewContainer = styled('div')`
  height: 100%;
  width: 100%;
  background-color: #f6f6f6;
  margin: 5px;
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
  color: #606b85;
  font-size: 13px;
  line-height: 16px;
  width: max-content;
`;
ResourceSubtitle.displayName = 'ResourceSubtitle';

type AutoCompleteProps = {
  border?: string;
};

export const AutoCompleteDropdown = styled('div')<AutoCompleteProps>`
  position: absolute;
  background-color: #fff;
  margin: -36px 0 140px 18px;
  width: 95.4%;
  display: flex;
  flex-direction: column;
  border: 1px solid #979797;
  border-radius: 4px;
  padding: 0 15px;
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
  background-color: white;
  padding: 7px 0 7px 15px;
  width: 100%;
  color: #192b33;
  font-style: normal;
  font-weight: 400;
  line-height: 30px;

  &:last-child {
    padding-bottom: 13px;
  }

  &:hover {
    background-blend-mode: darken;
    background: ${HrmTheme.colors.inputBackgroundColor};
  }
`;
