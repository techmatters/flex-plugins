import React from 'react';
import PropTypes from 'prop-types';
import { TableBody, TableFooter, TablePagination } from '@material-ui/core';

import { TableContainer, CLTable } from '../../styles/caseList';
import CaseListTableHead from './CaseListTableHead';
import CaseListTableRow from './CaseListTableRow';

/**
 * This component is splitted to make it easier to read, but is basically a 8 columns Table (7 for data, 1 for the "expand" button)
 */
const CaseListTable = ({ caseList }) => {
  return (
    <TableContainer>
      <CLTable tabIndex={0} aria-labelledby="CaseList-AllCases-label">
        <CaseListTableHead />
        <TableBody>
          {caseList.slice(0, 5).map(caseItem => (
            <CaseListTableRow caseItem={caseItem} key={`CaseListItem-${caseItem.id}`} />
          ))}
        </TableBody>
      </CLTable>
    </TableContainer>
  );
};

CaseListTable.displayName = 'CaseListTable';
CaseListTable.propTypes = {
  caseList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CaseListTable;
