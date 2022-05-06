import styled from 'react-emotion';
import { Table, TableCell, TableRow, withStyles } from '@material-ui/core';

import { Absolute, FontOpenSans, Flex } from '../HrmStyles';

export const CaseListContainer = styled(Absolute)`
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.base2};
`;
CaseListContainer.displayName = 'CaseListContainer';

export const CenteredContainer = styled(CaseListContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;
CenteredContainer.displayName = 'CenteredContainer';

export const TableContainer = styled('div')`
  border-left: 15px solid ${props => props.theme.colors.base2};
  border-right: 10px solid ${props => props.theme.colors.base2};
`;
TableContainer.displayName = 'TableContainer';

export const CLTable = withStyles({
  root: {
    borderCollapse: 'separate',
    borderSpacing: '0 5px',
    '&:focus': {
      outline: 'none',
    },
  },
})(Table);
CLTable.displayName = 'CLTable';

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
CLTableRow.displayName = 'CLTableRow';

export const CLTableCell = withStyles(theme => ({
  root: {
    borderBottom: 0,
    textTransform: 'none',
    overflow: 'hidden',
    paddingLeft: '10px',
  },
  body: {
    verticalAlign: 'top',
    paddingTop: 12,
  },
}))(TableCell);
CLTableCell.displayName = 'CLTableCell';

export const CLNumberCell = withStyles({
  body: {
    paddingLeft: '10px !important',
  },
})(CLTableCell);
CLNumberCell.displayName = 'CLNumberCell';

export const CLNamesCell = withStyles({
  body: {
    paddingRight: 10,
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
})(CLTableCell);
CLNamesCell.displayName = 'CLNamesCell';

export const CLSummaryCell = withStyles({
  body: {
    paddingRight: 20,
  },
})(CLTableCell);
CLSummaryCell.displayName = 'CLSummaryCell';

export const CLActionCell = withStyles({
  body: {
    paddingRight: '10px !important',
    textAlign: 'right',
  },
})(CLTableCell);
CLActionCell.displayName = 'CLActionCell';

export const CLTableHeaderFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 30px;
  letter-spacing: 0;
  display: flex;
  align-items: center;
  width: fit-content;
`;
CLTableHeaderFont.displayName = 'CLTableHeaderFont';

type CLTableBodyFontProps = {
  isOpenCase: boolean;
};

export const CLTableBodyFont = styled(FontOpenSans)<CLTableBodyFontProps>`
  color: ${props => (props.isOpenCase ? '#192b33' : '#666c7c')};
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  max-height: ${() => 85 - 12 /* 85px of cell height - 12px of padding*/}px;
`;
CLTableBodyFont.displayName = 'CLTableBodyFont';

type CLCaseNumberContainerProps = {
  isOpenCase: boolean;
};

export const CLCaseNumberContainer = styled('div')<CLCaseNumberContainerProps>`
  display: inline-block;
  padding: 0 6px;
  border: ${props => (props.isOpenCase ? '1px solid #192b33' : '0')};
  border-radius: 2px;
`;
CLCaseNumberContainer.displayName = 'CLCaseNumberContainer';

type PaginationButtonProps = {
  highlight?: Boolean;
};

export const PaginationButton = styled('button')<PaginationButtonProps>`
  background-color: ${props => (props.highlight ? '#1976D2' : 'transparent')};
  box-shadow: ${props => (props.highlight ? '0 1px 1px 0 rgba(0, 0, 0, 0.06)' : '0')};
  border-radius: 4px;
  padding: 6px 10px;
  margin: 0 2px;
  border: none;
  &:focus {
    outline: auto;
  }
`;
PaginationButton.displayName = 'PaginationButton';

export const PaginationChevron = styled(PaginationButton)`
  margin: 0;
  padding: 7px 3px;
`;
PaginationChevron.displayName = 'PaginationChevron';

type ButtonTextProps = {
  highlight?: Boolean;
};

export const ButtonText = styled(FontOpenSans)<ButtonTextProps>`
  font-size: 13px;
  color: ${props => (props.highlight ? '#ffffff' : '#666c7c')};
  font-weight: ${props => (props.highlight ? 700 : 600)};
`;
ButtonText.displayName = 'ButtonText';

export const SomethingWentWrongText = styled(FontOpenSans)`
  color: ${props => props.theme.colors.errorColor};
  font-size: 20px;
`;
SomethingWentWrongText.displayName = 'SomethingWentWrongText';

const FiltersContainer = styled(Flex)`
  margin-left: 15px;
  margin-right: 10px;
  padding: 10px;
  font-size: 13px;
  box-shadow: 0 1px 2px 0 rgba(25, 43, 51, 0.1);
`;
FiltersContainer.displayName = 'FiltersContainer';
