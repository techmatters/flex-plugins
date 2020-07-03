import React from 'react';
import styled from 'react-emotion';
import { Table, TableCell, TableRow, withStyles } from '@material-ui/core';

import { Absolute, FontOpenSans } from '../HrmStyles';

export const TableContainer = styled('div')`
  border-left: 15px solid ${props => props.theme.colors.base2};
  border-right: 10px solid ${props => props.theme.colors.base2};
`;

export const CaseListContainer = styled(Absolute)`
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.base2};
`;

export const CLTable = withStyles({
  root: {
    borderCollapse: 'separate',
    borderSpacing: '0 5px',
  },
})(Table);

export const CLTableRow = withStyles(theme => ({
  root: {
    height: 85,
    background: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(127, 134, 155, 0.07)',
    borderRadius: 4,
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.06)',
  },
}))(TableRow);

export const CLTableCell = withStyles(theme => ({
  root: {
    borderBottom: 0,
    textTransform: 'none',
  },
  // head: {},
  body: {
    verticalAlign: 'top',
    paddingTop: 12,
  },
}))(TableCell);

export const CLTableHeaderFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 30px;
  letter-spacing: 1px;
`;

export const CLTableBodyActiveFont = styled(FontOpenSans)`
  color: #192b33;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
`;

export const CLTableBodyInactiveFont = styled(CLTableBodyActiveFont)`
  color: #666c7c;
`;

export const CLCaseNumberContainer = styled('div')`
  display: inline-block;
  margin-left: 12;
  padding: 0 6px;
  border: 1px solid #192b33;
  border-radius: 2px;
`;

export const CategoryTag = styled('div')`
  display: inline-block;
  border-radius: 6px;
  padding: 0px 13px;
  margin: 3px 0;
  background-color: #a0a8bd66;
  text-transform: uppercase;
`;

export const CatergoryFont = styled(FontOpenSans)`
  font-size: 11px;
  letter-spacing: 0.1px;
  line-height: 14px;
`;
