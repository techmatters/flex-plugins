/* eslint-disable import/no-unused-modules */
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
import { Table, TableCell, TableRow, TableHead, withStyles } from '@material-ui/core';

import { Absolute, FontOpenSans, Flex } from './HrmStyles';
import HrmTheme from './HrmTheme';

export const ListContainer = styled(Absolute)`
  height: 100%;
  width: 1280px;
  background-color: #f6f6f6;
`;
ListContainer.displayName = 'ListContainer';

export const CenteredContainer = styled(ListContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;
CenteredContainer.displayName = 'CenteredContainer';

export const TableContainer = styled(Flex)`
  border-left: 15px solid ${HrmTheme.colors.base2};
  border-right: 10px solid ${HrmTheme.colors.base2};
`;
TableContainer.displayName = 'TableContainer';

export const StandardTable = withStyles({
  root: {
    borderCollapse: 'separate',
    borderSpacing: '0 5px',
    '&:focus': {
      outline: 'none',
    },
  },
})(Table);
StandardTable.displayName = 'StandardTable';

export const DataTableRow = withStyles({
  root: {
    height: 85,
    background: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(127, 134, 155, 0.07)',
    borderRadius: 4,
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.06)',
    '&:hover': {
      outline: 'auto',
      outlineColor: '#000',
    },
  },
})(TableRow);
DataTableRow.displayName = 'DataTableRow';

export const TableHeader = withStyles(theme => ({
  root: {
    'box-shadow': '0 2px 0 0 #E5E6E7',
  },
}))(TableHead);

export const HeaderCell = withStyles(theme => ({
  root: {
    borderBottom: 0,
    textTransform: 'none',
    overflow: 'hidden',
    padding: '0 0 0 10px',
  },
  body: {
    verticalAlign: 'top',
    paddingTop: 8,
  },
}))(TableCell);
HeaderCell.displayName = 'HeaderCell';

export const DataCell = withStyles({
  root: {
    borderBottom: 0,
    textTransform: 'none',
    overflow: 'hidden',
    paddingLeft: '10px',
  },
  body: {
    verticalAlign: 'top',
    paddingTop: 8,
  },
})(TableCell);
DataCell.displayName = 'DataCell';

export const NumericCell = withStyles({
  body: {
    paddingLeft: '10px !important',
  },
})(DataCell);
NumericCell.displayName = 'NumericCell';

export const TextCell = withStyles({
  body: {
    paddingRight: 10,
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
})(DataCell);
TextCell.displayName = 'TextCell';

export const LoadingCell = styled(TextCell)`
  position: 'absolute';
  text-align: 'center';
  width: '100%';
  top: '40%';
`;

export const SummaryCell = withStyles({
  body: {
    paddingRight: 20,
  },
})(DataCell);
SummaryCell.displayName = 'SummaryCell';

export const TableHeaderFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 30px;
  letter-spacing: 0;
  padding: 0 2px;
  align-items: right;
`;
TableHeaderFont.displayName = 'TableHeaderFont';

export const TableBodyFont = styled(FontOpenSans)`
  color: #192b33;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  max-height: ${() => 85 - 12 /* 85px of cell height - 12px of padding*/}px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
TableBodyFont.displayName = 'TableBodyFont';

export const TableSummaryFont = styled(TableBodyFont)`
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
`;
TableSummaryFont.displayName = 'TableSummaryFont';

export const IdentifierContainer = styled('div')`
  display: inline-block;
  padding: 0 6px;
`;
IdentifierContainer.displayName = 'IdentifierContainer';

export const IdentifierActionButton = styled('button')`
  color: #1876d1;
  text-decoration: underline;
  cursor: pointer;
  border: none;
  background-color: transparent;
  padding: 2px 0px;
  font-family: 'Open Sans';
  &:focus {
    outline: auto;
    outline-color: black;
  }
`;
IdentifierActionButton.displayName = 'IdentifierActionButton';

export const SomethingWentWrongText = styled(FontOpenSans)`
  color: ${HrmTheme.colors.errorColor};
  font-size: 20px;
`;
SomethingWentWrongText.displayName = 'SomethingWentWrongText';
