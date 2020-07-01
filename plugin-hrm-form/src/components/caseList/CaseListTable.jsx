import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow } from '@material-ui/core';

import { Box } from '../../styles/HrmStyles';
import CaseListTableHead from './CaseListTableHead';

const CaseListTable = ({ caseList }) => {
  return (
    <Box>
      <Table>
        <CaseListTableHead />
        <TableBody />
      </Table>
    </Box>
  );
};

CaseListTable.displayName = 'CaseListTable';
CaseListTable.propTypes = {
  caseList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CaseListTable;
