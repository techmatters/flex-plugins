import React from 'react';
import PropTypes from 'prop-types';
import { TableBody, CircularProgress } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { namespace, configurationBase } from '../../states';
import { TableContainer, CLTable, CLTableRow, CLNamesCell, CenteredContainer } from '../../styles/caseList';
import { Box, HeaderContainer } from '../../styles/HrmStyles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';
import CaseListTableHead from './CaseListTableHead';
import CaseListTableRow from './CaseListTableRow';
import Pagination from '../Pagination';
import { CASES_PER_PAGE } from './CaseList';

/**
 * This component is splitted to make it easier to read, but is basically a 9 columns Table (8 for data, 1 for the "expand" button)
 */
const CaseListTable = ({
  loading,
  caseList,
  caseCount,
  page,
  getCasesParams,
  handleChangePage,
  handleColumnClick,
  handleClickViewCase,
  counselorsHash,
}) => {
  const pagesCount = Math.ceil(caseCount / CASES_PER_PAGE);

  return (
    <>
      <HeaderContainer>
        <Box marginTop="15px" marginBottom="14px" marginLeft={TLHPaddingLeft} id="CaseList-AllCases-label">
          <Template code="CaseList-AllCases" />
        </Box>
      </HeaderContainer>
      <TableContainer>
        <CLTable tabIndex={0} aria-labelledby="CaseList-AllCases-label" data-testid="CaseList-Table">
          <CaseListTableHead
            sortBy={getCasesParams.sortBy}
            order={getCasesParams.order}
            handleColumnClick={handleColumnClick}
          />
          {loading && (
            <TableBody>
              <CLTableRow
                style={{ position: 'relative', background: 'transparent', height: `${caseList.length * 89}px` }}
              >
                <CLNamesCell style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '40%' }}>
                  <CircularProgress size={50} />
                </CLNamesCell>
              </CLTableRow>
            </TableBody>
          )}
          {!loading && (
            <TableBody>
              {caseList.map(caseItem => (
                <CaseListTableRow
                  caseItem={caseItem}
                  key={`CaseListItem-${caseItem.id}`}
                  handleClickViewCase={handleClickViewCase}
                  counselorsHash={counselorsHash}
                />
              ))}
            </TableBody>
          )}
          <Pagination page={page} pagesCount={pagesCount} handleChangePage={handleChangePage} />
        </CLTable>
      </TableContainer>
    </>
  );
};

CaseListTable.displayName = 'CaseListTable';
CaseListTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  caseList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  caseCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  getCasesParams: PropTypes.shape({
    sortBy: PropTypes.string.isRequired,
    order: PropTypes.string.isRequired,
  }).isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleColumnClick: PropTypes.func.isRequired,
  handleClickViewCase: PropTypes.func.isRequired,
  counselorsHash: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

export default connect(mapStateToProps)(CaseListTable);
