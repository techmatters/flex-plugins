import React from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';
import { TableFooter, TableCell, ButtonBase } from '@material-ui/core';

import { PaginationButton, ButtonText, CLFooterRow } from '../../styles/caseList';

const getPaginationNumbers = (page, pageCount) => {
  if (pageCount <= 9) return range(pageCount);
  if (page <= 6) return [...range(0, 9), -1, pageCount - 2, pageCount - 1];
  if (page >= pageCount - 5) return [0, 1, -1, ...range(pageCount - 9, pageCount)];
  return [0, 1, -1, ...range(page - 3, page + 3 + 1), -1, pageCount - 2, pageCount - 1];
};

const CaseListTableFooter = ({ page, pagesCount, handleChangePage }) => {
  return (
    <TableFooter>
      <CLFooterRow>
        <TableCell colSpan={8}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            {getPaginationNumbers(page, pagesCount).map(n => {
              if (n === -1)
                return (
                  <PaginationButton>
                    <ButtonText>...</ButtonText>
                  </PaginationButton>
                );

              return (
                <ButtonBase key={`CaseList-pagination-${n}`} onClick={() => handleChangePage(n)}>
                  <PaginationButton highlight={page === n}>
                    <ButtonText highlight={page === n}>{n + 1}</ButtonText>
                  </PaginationButton>
                </ButtonBase>
              );
            })}
          </div>
        </TableCell>
      </CLFooterRow>
    </TableFooter>
  );
};

CaseListTableFooter.displayName = 'CaseListTableFooter';
CaseListTableFooter.propTypes = {
  page: PropTypes.number.isRequired,
  pagesCount: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
};

export default CaseListTableFooter;
