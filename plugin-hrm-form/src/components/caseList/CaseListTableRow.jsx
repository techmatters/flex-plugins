import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ButtonBase } from '@material-ui/core';
import { Fullscreen } from '@material-ui/icons';
import { connect } from 'react-redux';
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
  CatergoryFont,
  addHover,
} from '../../styles/caseList';
import { HiddenText, StyledIcon } from '../../styles/HrmStyles';
import { formatName, getShortSummary } from '../../utils';
import { namespace, configurationBase } from '../../states';
import { caseStatuses } from '../../states/DomainConstants';

const CHAR_LIMIT = 200;
const FullscreenIcon = addHover(StyledIcon(Fullscreen));

// eslint-disable-next-line react/display-name
const renderCategory = (category) => (
  <div style={{ width: '100%' }} key={`category-tag-${category}`}>
    <CategoryTag>
      <CatergoryFont>{category}</CatergoryFont>
    </CategoryTag>
  </div>
);

// eslint-disable-next-line react/no-multi-comp
const CaseListTableRow = ({ caseItem, counselorsHash, openMockedMessage }) => {
  const name = formatName(caseItem.childName);
  const summary = getShortSummary(caseItem.callSummary, CHAR_LIMIT, 'case');
  const counselor = formatName(counselorsHash[caseItem.twilioWorkerId]);
  const opened = `${format(new Date(caseItem.createdAt), 'MMM d, yyyy')}`;
  const updated = `${format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}`;
  const { categories } = caseItem;
  const isOpenCase = caseItem.status === caseStatuses.open;

  return (
    <CLTableRow>
      <CLNumberCell>
        <CLCaseNumberContainer isOpenCase={isOpenCase}>
          <CLTableBodyFont isOpenCase={isOpenCase}>#{caseItem.id}</CLTableBodyFont>
        </CLCaseNumberContainer>
      </CLNumberCell>
      <CLNamesCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{name}</CLTableBodyFont>
      </CLNamesCell>
      <CLSummaryCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{summary}</CLTableBodyFont>
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
        <div style={{ display: 'inline-block', flexDirection: 'column' }}>
          {categories && categories.map((category) => renderCategory(category))}
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

const mapStateToProps = (state) => ({
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

export default connect(mapStateToProps)(CaseListTableRow);
