import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';

import { CaseListTableRow, TableContainer, CaseListTableCell, TableBodyActiveFont } from '../../styles/caseList';
import CaseListTableHead from './CaseListTableHead';
import { getShortSummary } from '../../utils';

const CHAR_LIMIT = 200;

/**
 * This component is splitted to make it easier to read, but is basically a 8 columns Table (7 for data, 1 for the "expand" button)
 */
const CaseListTable = ({ caseList }) => {
  return (
    <TableContainer>
      <Table tabIndex={0} aria-labelledby="CaseList-AllCases-label">
        <CaseListTableHead />
        <TableBody>
          <CaseListTableRow>
            <CaseListTableCell>
              <TableBodyActiveFont>#123456</TableBodyActiveFont>
            </CaseListTableCell>
            <CaseListTableCell>
              <TableBodyActiveFont>Kurt McKinley</TableBodyActiveFont>
            </CaseListTableCell>
            <CaseListTableCell>
              <TableBodyActiveFont>
                {getShortSummary(
                  'Jill Peterson called to say Kurt was thinking of taking his Fanny pack leggings hammock, excepteur id celiac irure direct trade put a bird on it enamel pin banjo quinoa exercitation. Umami pickled in shabby chic, aliquip… readymade aliqua. Quinoa authentic ex, keffiyeh squid do laboris ut officia tattooed skateboard. Artisan cloud bread XOXO dolore hoodie cillum salvia wayfarers small batch adipisicing lyft sunt.',
                  CHAR_LIMIT,
                )}
              </TableBodyActiveFont>
            </CaseListTableCell>
            <CaseListTableCell>
              <TableBodyActiveFont>Gianfranco Paoloni</TableBodyActiveFont>
            </CaseListTableCell>
            <CaseListTableCell>
              <TableBodyActiveFont>Jun 8, 2019</TableBodyActiveFont>
            </CaseListTableCell>
            <CaseListTableCell>
              <TableBodyActiveFont>Jul 10, 2019</TableBodyActiveFont>
            </CaseListTableCell>
            <CaseListTableCell>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
            </CaseListTableCell>
            <CaseListTableCell />
          </CaseListTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

CaseListTable.displayName = 'CaseListTable';
CaseListTable.propTypes = {
  caseList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CaseListTable;
