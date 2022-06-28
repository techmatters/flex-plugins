/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { range } from 'lodash';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { PaginationButton, PaginationChevron, ButtonText } from '../styles/caseList';
import { HiddenText, PaginationRow } from '../styles/HrmStyles';

export const getPaginationNumbers = (page, pageCount) => {
  if (pageCount <= 11) return range(pageCount);
  if (page <= 6) return [...range(0, 9), -1, pageCount - 2, pageCount - 1];
  if (page >= pageCount - 6) return [0, 1, -1, ...range(pageCount - 9, pageCount)];
  return [0, 1, -1, ...range(page - 3, page + 3 + 1), -1, pageCount - 2, pageCount - 1];
};

// eslint-disable-next-line react/display-name
const renderPaginationButton = (page, handleChangePage) => n => {
  if (n === -1)
    return (
      <ButtonText style={{ padding: '6px 10px', margin: '0 2px' }} key={`ellipsis-${Math.random()}`}>
        ...
      </ButtonText>
    );

  return (
    <PaginationButton
      aria-label={`Page ${n + 1}`}
      highlight={page === n}
      key={`CaseList-pagination-${n}`}
      onClick={() => handleChangePage(n)}
    >
      <ButtonText highlight={page === n}>{n + 1}</ButtonText>
    </PaginationButton>
  );
};

type ChevronButtonProps = {
  chevronDirection: 'left' | 'right';
  onClick: () => void;
  templateCode: string;
  disabled?: boolean;
};

const ChevronButton: React.FC<ChevronButtonProps> = ({ chevronDirection, onClick, templateCode, disabled }) => {
  const ChevronIcon = chevronDirection === 'left' ? ChevronLeft : ChevronRight;
  return (
    <PaginationChevron onClick={onClick} disabled={disabled}>
      <HiddenText>
        <Template code={templateCode} />
      </HiddenText>
      <ChevronIcon style={{ margin: '-7px 0' }} />
    </PaginationChevron>
  );
};
ChevronButton.displayName = 'ChevronButton';

type PaginationProps = {
  page: number;
  pagesCount: number;
  handleChangePage: (page: number) => void;
  transparent?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({ page, pagesCount, handleChangePage, transparent }) => {
  const renderButtons = renderPaginationButton(page, handleChangePage);

  const decreasePage = () => {
    if (page > 0) handleChangePage(page - 1);
  };

  const increasePage = () => {
    if (page < pagesCount - 1) handleChangePage(page + 1);
  };

  return (
    <PaginationRow transparent={transparent} data-testid="CaseList-TableFooter">
      <ChevronButton
        disabled={page === 0}
        chevronDirection="left"
        onClick={decreasePage}
        templateCode="CaseList-PrevPage"
      />
      {getPaginationNumbers(page, pagesCount).map(renderButtons)}
      <ChevronButton
        disabled={page === pagesCount - 1}
        chevronDirection="right"
        onClick={increasePage}
        templateCode="CaseList-NextPage"
      />
    </PaginationRow>
  );
};

Pagination.displayName = 'Pagination';
Pagination.defaultProps = {
  transparent: false,
};

export default Pagination;
