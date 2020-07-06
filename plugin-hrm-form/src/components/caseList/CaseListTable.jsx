import React from 'react';
import PropTypes from 'prop-types';
import { TableBody } from '@material-ui/core';

import { TableContainer, CLTable } from '../../styles/caseList';
import CaseListTableHead from './CaseListTableHead';
import CaseListTableRow from './CaseListTableRow';
import CaseListTableFooter from './CaseListTableFooter';

const CASES_PER_PAGE = 5;

/**
 * This component is splitted to make it easier to read, but is basically a 8 columns Table (7 for data, 1 for the "expand" button)
 */
const CaseListTable = ({ caseList, page, handleChangePage, handleMockedMessage }) => {
  const pagesCount = caseList.length / CASES_PER_PAGE;
  const from = page * 5;
  const to = from + 5;

  return (
    <TableContainer>
      <CLTable tabIndex={0} aria-labelledby="CaseList-AllCases-label">
        <CaseListTableHead />
        <TableBody>
          {caseList.slice(from, to).map(caseItem => (
            <CaseListTableRow
              caseItem={caseItem}
              key={`CaseListItem-${caseItem.id}`}
              handleMockedMessage={handleMockedMessage}
            />
          ))}
        </TableBody>
        <CaseListTableFooter page={page} pagesCount={pagesCount} handleChangePage={handleChangePage} />
      </CLTable>
    </TableContainer>
  );
};

CaseListTable.displayName = 'CaseListTable';
CaseListTable.propTypes = {
  caseList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  page: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleMockedMessage: PropTypes.func.isRequired,
};

export default CaseListTable;
