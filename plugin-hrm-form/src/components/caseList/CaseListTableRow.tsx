/* eslint-disable react/prop-types */

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Link, Button, ButtonBase } from '@material-ui/core';
// import { FullscreenIcon } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';
import type { Case, CounselorHash } from '../../types/types';

import {
  CLTableRow,
  CLTableCell,
  CLNamesCell,
  CLSummaryCell,
  CLNumberCell,
  CLActionCell,
  CLTableBodyFont,
  CLCaseNumberContainer,
  CLCaseIDButton
} from '../../styles/caseList';
import { Box, HiddenText, StyledIcon, addHover } from '../../styles/HrmStyles';
import { formatName, getShortSummary } from '../../utils';
import { getContactTags, renderTag } from '../../utils/categories';
import { caseStatuses } from '../../states/DomainConstants';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import ta from 'date-fns/esm/locale/ta/index.js';

const CHAR_LIMIT = 200;

type Props = {
  caseItem: Case;
  counselorsHash: CounselorHash;
  handleClickViewCase:(currentCase: Case) => () => void;
};

// eslint-disable-next-line react/no-multi-comp
const CaseListTableRow: React.FC<Props> = ({ caseItem, counselorsHash, handleClickViewCase }) => {
  const status = caseItem.status;
  const name = formatName(caseItem.childName);
  const summary = caseItem.info && caseItem.info.summary;
  const shortSummary = getShortSummary(summary, CHAR_LIMIT, 'case');
  const counselor = formatName(counselorsHash[caseItem.twilioWorkerId]);
  const opened = `${format(new Date(caseItem.createdAt), 'MMM d, yyyy')}`;
  const beenUpdated = caseItem.createdAt !== caseItem.updatedAt;
  const updated = beenUpdated ? `${format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}` : '—';
  const followUpDate =
    caseItem.info && caseItem.info.followUpDate
      ? `${format(parseISO(caseItem.info.followUpDate), 'MMM d, yyyy')}`
      : '—';
  const categories = getContactTags(caseItem.info.definitionVersion, caseItem.categories);
  // const isOpenCase = caseItem.status !== caseStatuses.closed;

  return (
    <CLTableRow data-testid="CaseList-TableRow">
      <CLNumberCell aria-sort="ascending">
        <CLCaseNumberContainer>
          <CLTableBodyFont
          >
            <CLCaseIDButton
              aria-label={`Open Case ${caseItem.id}`}
              type='button'
              style={{ color: '#1876D1', textDecoration: 'underline', cursor: 'pointer' }}
              tabIndex={0}
              onClick={handleClickViewCase(caseItem)}
            >
              {caseItem.id}
            </CLCaseIDButton>
          </CLTableBodyFont>
          <CLTableBodyFont aria-label="Case Status" style={{ color: '#606B85', paddingTop: '2px' }}>
              { status === 'open'
                ? <Template code="CaseList-StatusOpen"/>
                : <Template code="CaseList-StatusClosed"/>}
          </CLTableBodyFont>
        </CLCaseNumberContainer>
      </CLNumberCell>
      <CLNamesCell>
        <CLTableBodyFont>{name}</CLTableBodyFont>
      </CLNamesCell>
      <CLSummaryCell>
        <CLTableBodyFont>{shortSummary}</CLTableBodyFont>
      </CLSummaryCell>
      <CLNamesCell>
        <CLTableBodyFont>{counselor}</CLTableBodyFont>
      </CLNamesCell>
      <CLTableCell>
        <CLTableBodyFont>{opened}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont>{updated}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont>{followUpDate}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <div style={{ display: 'inline-block', flexDirection: 'column' }}>
          {categories &&
            categories.map(category => (
              <Box key={`category-tag-${category.label}`} marginBottom="5px">
                <CategoryWithTooltip renderTag={renderTag} category={category.label} color={category.color} />
              </Box>
            ))}
        </div>
      </CLTableCell>
    </CLTableRow>
  );
};

CaseListTableRow.displayName = 'CaseListTableRow';

export default CaseListTableRow;
