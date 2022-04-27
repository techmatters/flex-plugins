/* eslint-disable react/prop-types */
import React from 'react';
import { TableBody, CircularProgress } from '@material-ui/core';
import { connect } from 'react-redux';

import { namespace, configurationBase } from '../../states';
import { TableContainer, CLTable, CLTableRow, CLNamesCell } from '../../styles/caseList';
import Filters from './filters/Filters';
import CaseListTableHead from './CaseListTableHead';
import CaseListTableRow from './CaseListTableRow';
import Pagination from '../Pagination';
import { CASES_PER_PAGE } from './CaseList';
import type { Case, ListCasesQueryParams, ListCasesFilters } from '../../types/types';

const ROW_HEIGHT = 89;

type OwnProps = {
  loading: boolean;
  caseList: Case[];
  caseCount: number;
  page: number;
  queryParams: ListCasesQueryParams;
  handleChangePage: (page: number) => void;
  handleColumnClick: (sortBy: ListCasesQueryParams['sortBy'], order: ListCasesQueryParams['sortDirection']) => void;
  handleClickViewCase: (currentCase: Case) => () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * This component is splitted to make it easier to read, but is basically a 9 columns Table (8 for data, 1 for the "expand" button)
 */
const CaseListTable: React.FC<Props> = ({
  loading,
  caseList,
  caseCount,
  page,
  queryParams,
  handleChangePage,
  handleColumnClick,
  handleClickViewCase,
  counselorsHash,
  currentDefinitionVersion,
}) => {
  const pagesCount = Math.ceil(caseCount / CASES_PER_PAGE);

  return (
    <>
      <Filters
        caseCount={caseCount}
        currentDefinitionVersion={currentDefinitionVersion}
        counselorsHash={counselorsHash}
      />
      <TableContainer>
        <CLTable tabIndex={0} aria-labelledby="CaseList-Cases-label" data-testid="CaseList-Table">
          <CaseListTableHead
            sortBy={queryParams.sortBy}
            sortDirection={queryParams.sortDirection}
            handleColumnClick={handleColumnClick}
          />
          {loading && (
            <TableBody>
              <CLTableRow
                style={{
                  position: 'relative',
                  background: 'transparent',
                  height: `${(caseList.length || queryParams.limit) * ROW_HEIGHT}px`,
                }}
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

const mapStateToProps = state => ({
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  currentDefinitionVersion: state[namespace][configurationBase].currentDefinitionVersion,
});

export default connect(mapStateToProps)(CaseListTable);
