import React from 'react';
import PropTypes from 'prop-types';
import { TableBody } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { TableContainer, CLTable } from '../../styles/caseList';
import { Box, HeaderContainer } from '../../styles/HrmStyles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';
import CaseListTableHead from './CaseListTableHead';
import CaseListTableRow from './CaseListTableRow';
import CaseListTableFooter from './CaseListTableFooter';

const CASES_PER_PAGE = 5;

/**
 * This component is splitted to make it easier to read, but is basically a 8 columns Table (7 for data, 1 for the "expand" button)
 */
const CaseListTable = ({ caseList, page, handleChangePage, handleMockedMessage }) => {
  const pagesCount = Math.floor(caseList.length / CASES_PER_PAGE);
  const from = page * 5;
  const to = from + 5;

  return (
    <>
      <HeaderContainer>
        <Box marginTop="15px" marginBottom="14px" marginLeft={TLHPaddingLeft} id="CaseList-AllCases-label">
          <Template code="CaseList-AllCases" />
        </Box>
      </HeaderContainer>
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
    </>
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
