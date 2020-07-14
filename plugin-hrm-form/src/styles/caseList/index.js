import styled from 'react-emotion';
import { Table, TableCell, TableRow, withStyles } from '@material-ui/core';

import { Absolute, FontOpenSans } from '../HrmStyles';

export const CaseListContainer = styled(Absolute)`
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.base2};
`;

export const CenteredContainer = styled(CaseListContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TableContainer = styled('div')`
  border-left: 15px solid ${props => props.theme.colors.base2};
  border-right: 10px solid ${props => props.theme.colors.base2};
`;

export const CLTable = withStyles({
  root: {
    borderCollapse: 'separate',
    borderSpacing: '0 5px',
  },
})(Table);

export const CLTableRow = withStyles({
  root: {
    height: 85,
    background: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(127, 134, 155, 0.07)',
    borderRadius: 4,
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.06)',
  },
})(TableRow);

export const CLFooterRow = withStyles(theme => ({
  root: {
    height: 'auto',
    verticalAlign: 'top',
    backgroundColor: theme.colors.base2,
    marginTop: -5,
  },
}))(TableRow);

export const CLTableCell = withStyles(theme => ({
  root: {
    borderBottom: 0,
    textTransform: 'none',
  },
  body: {
    verticalAlign: 'top',
    paddingTop: 12,
  },
}))(TableCell);

export const CLNumberCell = withStyles({
  body: {
    paddingLeft: '10px !important',
  },
})(CLTableCell);

export const CLNamesCell = withStyles({
  body: {
    paddingRight: 10,
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
})(CLTableCell);

export const CLSummaryCell = withStyles({
  body: {
    paddingRight: 30,
  },
})(CLTableCell);

export const CLActionCell = withStyles({
  body: {
    paddingRight: '10px !important',
    textAlign: 'right',
  },
})(CLTableCell);

export const CLTableHeaderFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 30px;
  letter-spacing: 0;
`;

export const CLTableBodyFont = styled(FontOpenSans)`
  color: ${props => (props.isOpenCase ? '#192b33' : '#666c7c')};
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  max-height: ${() => 85 - 12 /* 85px of cell height - 12px of padding*/}px;
`;

export const CLCaseNumberContainer = styled('div')`
  display: inline-block;
  padding: 0 6px;
  border: ${props => (props.isOpenCase ? '1px solid #192b33' : '0')};
  border-radius: 2px;
`;

export const CategoryTag = styled('div')`
  display: inline-block;
  white-space: nowrap;
  border-radius: 6px;
  padding: 0px 13px;
  margin: 3px 0;
  background-color: #a0a8bd66;
  text-transform: uppercase;
`;

export const CategoryFont = styled(FontOpenSans)`
  font-size: 11px;
  letter-spacing: 0.1px;
  line-height: 14px;
`;

export const PaginationButton = styled('div')`
  background-color: ${props => (props.highlight ? '#1976D2' : 'transparent')};
  box-shadow: ${props => (props.highlight ? '0 1px 1px 0 rgba(0, 0, 0, 0.06)' : '0')};
  border-radius: 4px;
  padding: 5px 10px;
  margin: 10px 5px 0 5px;
`;

export const ButtonText = styled(FontOpenSans)`
  font-size: 13px;
  color: ${props => (props.highlight ? '#ffffff' : '#666c7c')};
  font-weight: ${props => (props.highlight ? 700 : 600)};
`;

export const SomethingWentWrongText = styled(FontOpenSans)`
  color: ${props => props.theme.colors.errorColor};
  font-size: 20px;
`;
