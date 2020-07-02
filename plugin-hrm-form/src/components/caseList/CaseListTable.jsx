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

import {
  CaseListTableCell,
  CaseListTableRow,
  TableContainer,
  CaseListBodyCell,
  TableBodyActiveFont,
} from '../../styles/caseList';
import CaseListTableHead from './CaseListTableHead';

/**
 * This component is splitted to make it easier to read, but is basically a 8 columns Table (7 for data, 1 for the "expand" button)
 */
const CaseListTable = ({ caseList }) => {
  return (
    <TableContainer>
      <Table>
        <CaseListTableHead />
        <TableBody>
          <CaseListTableRow>
            <CaseListBodyCell>
              <TableBodyActiveFont>#123456</TableBodyActiveFont>
            </CaseListBodyCell>
            <CaseListBodyCell>
              <TableBodyActiveFont>Kurt McKinley</TableBodyActiveFont>
            </CaseListBodyCell>
            <CaseListBodyCell>
              <TableBodyActiveFont>
                Jill Peterson called to say Kurt was thinking of taking his Fanny pack leggings hammock, excepteur id
                celiac irure direct trade put a bird on it enamel pin banjo quinoa exercitation. Umami pickled in shabby
                chic, aliquip… readymade aliqua. Quinoa authentic ex, keffiyeh squid do laboris ut officia tattooed
                skateboard. Artisan cloud bread XOXO dolore hoodie cillum salvia wayfarers small batch adipisicing lyft
                sunt.
              </TableBodyActiveFont>
            </CaseListBodyCell>
            <CaseListBodyCell>
              <TableBodyActiveFont>Gianfranco Paoloni</TableBodyActiveFont>
            </CaseListBodyCell>
            <CaseListBodyCell>
              <TableBodyActiveFont>Jun 8, 2019</TableBodyActiveFont>
            </CaseListBodyCell>
            <CaseListBodyCell>
              <TableBodyActiveFont>Jul 10, 2019</TableBodyActiveFont>
            </CaseListBodyCell>
            <CaseListBodyCell>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
            </CaseListBodyCell>
            <CaseListBodyCell />
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
