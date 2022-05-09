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
import { Box, Row, HiddenText } from '../../styles/HrmStyles';
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
    <CLTableRow data-testid="CaseList-TableRow">
      <CLNumberCell>
        <CLCaseNumberContainer>
          <CLCaseIDButton tabIndex={0} onClick={handleClickViewCase(caseItem)}>
            <HiddenText>
              <Template code={statusString} />
              <Template code="CaseList-THCase" />
            </HiddenText>
            {caseItem.id}
          </CLCaseIDButton>
          <CLTableBodyFont style={{ color: '#606B85', paddingTop: '2px', textAlign: 'center' }}>
            <Template code={`CaseList-Status${statusString}`} />
          </CLTableBodyFont>
        </CLCaseNumberContainer>
      </CLNumberCell>
      <CLNamesCell>
        <CLTableBodyFont>{name}</CLTableBodyFont>
      </CLNamesCell>
      <CLTableCell>
        <CLTableBodyFont>{counselor}</CLTableBodyFont>
      </CLTableCell>
      <CLSummaryCell>
        <CLTableBodyFont>{shortSummary}</CLTableBodyFont>
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
        <CLTableBodyFont>{opened}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont>{updated}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont>{followUpDate}</CLTableBodyFont>
      </CLTableCell>
    </CLTableRow>
  );
};

CaseListTableRow.displayName = 'CaseListTableRow';

export default CaseListTableRow;
