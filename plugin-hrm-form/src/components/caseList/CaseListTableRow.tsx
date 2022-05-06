/* eslint-disable react/prop-types */
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Fullscreen } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { Case, CounselorHash } from '../../types/types';
import {
  CLTableRow,
  CLTableCell,
  CLNamesCell,
  CLSummaryCell,
  CLNumberCell,
  CLTableBodyFont,
  CLCaseNumberContainer,
  CLCaseIDButton,
} from '../../styles/caseList';
import { Box } from '../../styles/HrmStyles';
import { formatName, getShortSummary } from '../../utils';
import { getContactTags, renderTag } from '../../utils/categories';
import { caseStatuses } from '../../states/DomainConstants';
import CategoryWithTooltip from '../common/CategoryWithTooltip';

const CHAR_LIMIT = 200;

// eslint-disable-next-line react/no-multi-comp
type Props = {
  caseItem: Case;
  counselorsHash: CounselorHash;
  handleClickViewCase: (currentCase: Case) => () => void;
};

const CaseListTableRow: React.FC<Props> = ({ caseItem, counselorsHash, handleClickViewCase }) => {
  const { status } = caseItem;
  const statusString = status.charAt(0).toUpperCase() + status.slice(1);
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
  const isOpenCase = caseItem.status !== caseStatuses.closed;

  return (
    <CLTableRow data-testid="CaseList-TableRow" onClick={handleClickViewCase(caseItem)}>
      <CLNumberCell>
        <CLCaseNumberContainer isOpenCase={isOpenCase}>
          <CLCaseIDButton aria-label={`Open Case ${caseItem.id}`} tabIndex={0} onClick={handleClickViewCase(caseItem)}>
            {caseItem.id}
          </CLCaseIDButton>
          <CLTableBodyFont style={{ color: '#606B85', paddingTop: '2px', textAlign: 'center' }} isOpenCase={isOpenCase}>
            <Template code={`CaseList-Status${statusString}`} />
          </CLTableBodyFont>
        </CLCaseNumberContainer>
      </CLNumberCell>
      <CLNamesCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{name}</CLTableBodyFont>
      </CLNamesCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{counselor}</CLTableBodyFont>
      </CLTableCell>
      <CLSummaryCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{shortSummary}</CLTableBodyFont>
      </CLSummaryCell>
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
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{opened}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{updated}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{followUpDate}</CLTableBodyFont>
      </CLTableCell>
    </CLTableRow>
  );
};

CaseListTableRow.displayName = 'CaseListTableRow';

export default CaseListTableRow;
