import React from 'react';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import { ButtonBase } from '@material-ui/core';
import { Fullscreen } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import {
  CLTableRow,
  CLTableCell,
  CLNamesCell,
  CLSummaryCell,
  CLNumberCell,
  CLActionCell,
  CLTableBodyFont,
  CLCaseNumberContainer,
  CategoryTag,
  CategoryFont,
} from '../../styles/caseList';
import { HiddenText, StyledIcon, addHover } from '../../styles/HrmStyles';
import { formatName, formatCategories, getShortSummary } from '../../utils';
import { caseStatuses } from '../../states/DomainConstants';
import CategoryWithTooltip from '../common/CategoryWithTooltip';

const CHAR_LIMIT = 200;
const FullscreenIcon = addHover(StyledIcon(Fullscreen));

/**
 * @param {string} tag
 */
// eslint-disable-next-line react/display-name
const renderTag = tag => (
  <div style={{ width: '100%' }}>
    <CategoryTag>
      <CategoryFont>{tag}</CategoryFont>
    </CategoryTag>
  </div>
);

// eslint-disable-next-line react/no-multi-comp
const CaseListTableRow = ({ caseItem, counselorsHash, openMockedMessage }) => {
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
  const categories = formatCategories(caseItem.categories);
  const isOpenCase = caseItem.status === caseStatuses.open;

  return (
    <CLTableRow data-testid="CaseList-TableRow">
      <CLNumberCell>
        <CLCaseNumberContainer isOpenCase={isOpenCase}>
          <CLTableBodyFont isOpenCase={isOpenCase}>#{caseItem.id}</CLTableBodyFont>
        </CLCaseNumberContainer>
      </CLNumberCell>
      <CLNamesCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{name}</CLTableBodyFont>
      </CLNamesCell>
      <CLSummaryCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{shortSummary}</CLTableBodyFont>
      </CLSummaryCell>
      <CLNamesCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{counselor}</CLTableBodyFont>
      </CLNamesCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{opened}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{updated}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{followUpDate}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <div style={{ display: 'inline-block', flexDirection: 'column' }}>
          {categories &&
            categories.map(category => (
              <CategoryWithTooltip renderTag={renderTag} category={category} key={`category-tag-${category}`} />
            ))}
        </div>
      </CLTableCell>
      <CLActionCell>
        <ButtonBase onClick={() => openMockedMessage()}>
          <HiddenText>
            <Template code="CaseList-ExpandButton" />
            {caseItem.id}
          </HiddenText>
          <FullscreenIcon />
        </ButtonBase>
      </CLActionCell>
    </CLTableRow>
  );
};

CaseListTableRow.displayName = 'CaseListTableRow';
CaseListTableRow.propTypes = {
  caseItem: PropTypes.shape({
    id: PropTypes.number,
    twilioWorkerId: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    status: PropTypes.string,
    info: PropTypes.string,
    childName: PropTypes.string,
    callSummary: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  counselorsHash: PropTypes.shape({}).isRequired,
  openMockedMessage: PropTypes.func.isRequired,
};

export default CaseListTableRow;
