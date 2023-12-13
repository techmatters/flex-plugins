/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { range } from 'lodash';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { PaginationRow, PaginationButton, PaginationChevron, PaginationButtonText } from './styles';
import { HiddenText } from '../../styles/HrmStyles';

export const getPaginationNumbers = (page, pageCount) => {
  if (pageCount <= 11) return range(pageCount);
  if (page <= 6) return [...range(0, 9), -1, pageCount - 2, pageCount - 1];
  if (page >= pageCount - 6) return [0, 1, -1, ...range(pageCount - 9, pageCount)];
  return [0, 1, -1, ...range(page - 3, page + 3 + 1), -1, pageCount - 2, pageCount - 1];
};

// eslint-disable-next-line react/display-name
const renderPaginationButton = (page, handleChangePage, disabled) => n => {
  if (n === -1)
    return (
      <PaginationButtonText style={{ padding: '6px 10px', margin: '0 2px' }} key={`ellipsis-${Math.random()}`}>
        ...
      </PaginationButtonText>
    );

  return (
    <PaginationButton
      aria-label={`Page ${n + 1}`}
      highlight={page === n}
      key={`CaseList-pagination-${n}`}
      onClick={() => {
        if (!disabled) {
          handleChangePage(n);
        }
      }}
      aria-disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <PaginationButtonText highlight={page === n}>{n + 1}</PaginationButtonText>
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
    <PaginationChevron
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      aria-disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
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
  disabled?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  pagesCount,
  handleChangePage,
  transparent,
  disabled = false,
}) => {
  const renderButtons = renderPaginationButton(page, handleChangePage, disabled);

  const decreasePage = () => {
    if (page > 0) handleChangePage(page - 1);
  };

  const increasePage = () => {
    if (page < pagesCount - 1) handleChangePage(page + 1);
  };

  return (
    <PaginationRow transparent={transparent} data-testid="CaseList-TableFooter">
      <ChevronButton
        disabled={disabled || page === 0}
        chevronDirection="left"
        onClick={decreasePage}
        templateCode="CaseList-PrevPage"
      />
      {getPaginationNumbers(page, pagesCount).map(renderButtons)}
      <ChevronButton
        disabled={disabled || page === pagesCount - 1}
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
