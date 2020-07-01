import React from 'react';
import styled from 'react-emotion';
import { TableCell } from '@material-ui/core';

import { Absolute, FontOpenSans } from '../HrmStyles';

export const CaseListContainer = styled(Absolute)`
  height: 100%;
  width: 100%;
  background-color: ${props => props.theme.colors.base2};
`;

export const CaseListTableCell = styled(TableCell)`
  border-bottom: 0px !important;
  text-transform: none !important;
`;

export const TableHeaderFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 30px;
  letter-spacing: 1px;
`;
