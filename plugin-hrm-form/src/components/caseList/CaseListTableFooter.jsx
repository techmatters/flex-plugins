/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';
import { TableFooter, TableCell, ButtonBase } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { PaginationButton, PaginationChevron, ButtonText, CLFooterRow } from '../../styles/caseList';
import { HiddenText } from '../../styles/HrmStyles';

export const getPaginationNumbers = (page, pageCount) => {
  if (pageCount <= 11) return range(pageCount);
  if (page <= 6) return [...range(0, 9), -1, pageCount - 2, pageCount - 1];
  if (page >= pageCount - 6) return [0, 1, -1, ...range(pageCount - 9, pageCount)];
  return [0, 1, -1, ...range(page - 3, page + 3 + 1), -1, pageCount - 2, pageCount - 1];
};

const renderPaginationButton = (page, handleChangePage) => n => {
  if (n === -1)
    return (
      <PaginationButton key={`ellipsis-${Math.random()}`}>
        <ButtonText style={{ paddingTop: 10 }}>...</ButtonText>
      </PaginationButton>
    );

  return (
    <ButtonBase key={`CaseList-pagination-${n}`} onClick={() => handleChangePage(n)}>
      <PaginationButton highlight={page === n}>
        <ButtonText highlight={page === n}>{n + 1}</ButtonText>
      </PaginationButton>
    </ButtonBase>
  );
};

const ChevronButton = ({ chevronDirection, onClick, templateCode }) => {
  const ChevronIcon = chevronDirection === 'left' ? ChevronLeft : ChevronRight;
  return (
    <ButtonBase onClick={onClick}>
      <PaginationChevron>
        <HiddenText>
          <Template code={templateCode} />
        </HiddenText>
        <ButtonText>
          <ChevronIcon />
        </ButtonText>
      </PaginationChevron>
    </ButtonBase>
  );
};

ChevronButton.propTypes = {
  chevronDirection: PropTypes.oneOf(['left', 'right']).isRequired,
  onClick: PropTypes.func.isRequired,
  templateCode: PropTypes.string.isRequired,
};

const CaseListTableFooter = ({ page, pagesCount, handleChangePage }) => {
  const renderButtons = renderPaginationButton(page, handleChangePage);

  const decreasePage = () => {
    if (page > 0) handleChangePage(page - 1);
  };

  const increasePage = () => {
    if (page < pagesCount - 1) handleChangePage(page + 1);
  };

  return (
    <TableFooter data-testid="CaseList-TableFooter">
      <CLFooterRow>
        <TableCell colSpan={8}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <ChevronButton chevronDirection="left" onClick={decreasePage} templateCode="CaseList-PrevPage" />
            {getPaginationNumbers(page, pagesCount).map(renderButtons)}
            <ChevronButton chevronDirection="right" onClick={increasePage} templateCode="CaseList-NextPage" />
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
