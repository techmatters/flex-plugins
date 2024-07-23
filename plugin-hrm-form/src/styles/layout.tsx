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
import React from 'react';
import { styled } from '@twilio/flex-ui';
import { Tab, TabProps, Tabs, withStyles } from '@material-ui/core';

import { BottomButtonBarHeight } from '.';
import HrmTheme from './HrmTheme';

type BoxProps = {
  width?: string;
  height?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  alignSelf?: string;
  textAlign?: string;
  borderBottom?: string;
  display?: string;
  justifyContent?: string;
};

export const Box = styled('div')<BoxProps>`
  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ margin }) => margin && `margin: ${margin}`}
  ${({ marginTop }) => marginTop && `margin-top: ${marginTop};`}
  ${({ marginBottom }) => marginBottom && `margin-bottom: ${marginBottom};`}
  ${({ marginLeft }) => marginLeft && `margin-left: ${marginLeft};`}
  ${({ marginRight }) => marginRight && `margin-right: ${marginRight};`}
  ${({ padding }) => padding && `padding: ${padding}`}
  ${({ paddingTop }) => paddingTop && `padding-top: ${paddingTop};`}
  ${({ paddingBottom }) => paddingBottom && `padding-bottom: ${paddingBottom};`}
  ${({ paddingLeft }) => paddingLeft && `padding-left: ${paddingLeft};`}
  ${({ paddingRight }) => paddingRight && `padding-right: ${paddingRight};`}
  ${({ alignSelf }) => alignSelf && `align-self: ${alignSelf};`}
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
  ${({ display }) => display && `display: ${display};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
`;
Box.displayName = 'Box';

type FlexProps = {
  inline?: boolean;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
};

export const Flex = styled(Box)<FlexProps>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  ${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
`;
Flex.displayName = 'Flex';

type AbsoluteProps = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export const Absolute = styled('div')<AbsoluteProps>`
  position: absolute;
  top: ${({ top }) => top || 'auto'};
  bottom: ${({ bottom }) => bottom || 'auto'};
  left: ${({ left }) => left || 'auto'};
  right: ${({ right }) => right || 'auto'};
`;
Absolute.displayName = 'Absolute';

const containerLeftRightMargin = '5px';

type ContainerProps = {
  formContainer?: boolean;
};
export const Container = styled('div')<ContainerProps>`
  display: flex;
  padding: ${({ formContainer }) => (formContainer ? '0' : '32px 20px 12px 20px')};
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #ffffff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: 0 ${containerLeftRightMargin};
  height: 100%;
  overflow-y: auto;
  ${({ formContainer }) => (formContainer ? 'border-bottom: 1px solid #e1e3ea' : '')};
`;
Container.displayName = 'Container';

export const Row = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
Row.displayName = 'Row';

export const Column = styled('div')`
  display: flex;
  flex-direction: column;
`;
Column.displayName = 'Column';

export const BottomButtonBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: ${BottomButtonBarHeight}px;
  flex-shrink: 0;
  background-color: #ffffff;
  padding: 0 20px;
  z-index: 1;
`;
BottomButtonBar.displayName = 'BottomButtonBar';

export const ColumnarBlock = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0;
`;
ColumnarBlock.displayName = 'ColumnarBlock';

export const TwoColumnLayout = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: inherit;
  box-sizing: border-box;
`;
TwoColumnLayout.displayName = 'TwoColumnLayout';

export const TwoColumnLayoutResponsive = styled(TwoColumnLayout)`
  @media screen and (max-width: 1100px) {
    flex-direction: column;
  }
`;
TwoColumnLayoutResponsive.displayName = 'TwoColumnLayoutResponsive';

export const ColumnarContent = styled('div')`
  width: 217px;
`;
ColumnarContent.displayName = 'ColumnarContent';

export const HeaderContainer = styled(Row)`
  width: 100%;
  justify-items: flex-start;
  background-color: ${HrmTheme.colors.base2};
  border-width: 0px;
  text-transform: capitalize;
  color: #192b33;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  padding: 0px;
`;
HeaderContainer.displayName = 'HeaderContainer';

export const CategoriesWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding-bottom: ${BottomButtonBarHeight}px;
`;
CategoriesWrapper.displayName = 'CategoriesWrapper';

type SubcategoriesWrapperProps = { gridView?: boolean };

export const SubcategoriesWrapper = styled('div')<SubcategoriesWrapperProps>`
  display: flex;
  padding: 10px 0 10px 6px;
  flex-wrap: wrap;
  flex-direction: ${({ gridView }) => (gridView ? 'row' : 'column')};
`;
SubcategoriesWrapper.displayName = 'SubcategoriesWrapper';

export const StyledTabs = withStyles({
  root: {
    minHeight: 35,
    height: 35,
    flexShrink: 0,
    padding: '0 7%',
  },
  indicator: {
    backgroundColor: 'transparent',
  },
})(Tabs);
StyledTabs.displayName = 'StyledTabs';

export type StyledTabProps = { searchTab?: boolean; label: React.ReactNode } & Partial<TabProps>;

export const StyledTab = withStyles({
  root: {
    height: 35,
    minHeight: 35,
    minWidth: 120,
    width: 120,
    backgroundColor: '#ecedf1',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    margin: '0 5px 0 0',
    padding: 0,
    fontSize: 12,
    lineHeight: 14,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#c9c9c9',
    },
    '&:focus': {
      outline: 'auto',
    },
  },
  selected: {
    backgroundColor: '#ffffff',
    fontWeight: 600,
  },
})(Tab);
StyledTab.displayName = 'StyledTab';

export const StyledSearchTab = withStyles({
  root: {
    minWidth: 40,
    width: 40,
    backgroundColor: 'transparent',
    '&:focus': {
      outline: 'auto',
    },
  },
  selected: {
    backgroundColor: '#ffffff',
  },
})(StyledTab);
StyledSearchTab.displayName = 'StyledSearchTab';

export const PreviewWrapper = styled(Flex)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 10px;
  padding-bottom: 10px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border-color: #e1e3ea;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
`;

PreviewWrapper.displayName = 'PreviewWrapper';

export const HorizontalLine = styled('hr')`
  border: 0;
  height: 1px;
  background-color: #c6cad7;
  margin: 0;
`;
HorizontalLine.displayName = 'HorizontalLine';

export const TaskCanvasOverride = styled('div')`
  width: 100%;
  height: 100%;
  background-color: ${HrmTheme.colors.base2};
`;

export const StandaloneContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  width: 100%;
  background-color: ${HrmTheme.colors.base2};
`;
StandaloneContainer.displayName = 'StandaloneContainer';

export const SearchFormTopRule = styled('hr')`
  color: #d8d8d8;
  background-color: #d8d8d8;
  height: 1px;
  width: 100%;
  margin: 0 5px 0 5px;
  border: 0;
  border-top: 1px solid #d8d8d8;
`;
SearchFormTopRule.displayName = 'SearchFormTopRule';
