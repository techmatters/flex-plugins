import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ButtonBase } from '@material-ui/core';
import { Fullscreen } from '@material-ui/icons';
import { connect } from 'react-redux';

import {
  CLTableRow,
  CLTableCell,
  CLTableBodyFont,
  CLCaseNumberContainer,
  CategoryTag,
  CatergoryFont,
  ActionsContainer,
  addHover,
} from '../../styles/caseList';
import { StyledIcon } from '../../styles/HrmStyles';
import { formatName, getShortSummary } from '../../utils';
import { namespace, configurationBase } from '../../states';
import { caseStatuses } from '../../states/DomainConstants';

const CHAR_LIMIT = 200;
const FullscreenIcon = addHover(StyledIcon(Fullscreen));

const CaseListTableRow = ({ caseItem, counselorsHash, handleMockedMessage }) => {
  // const caseInfo = caseItem.info ? JSON.parse(caseItem.info) : {};
  const name = formatName(caseItem.childName);
  const summary = getShortSummary(caseItem.callSummary, CHAR_LIMIT, 'case');
  const counselor = formatName(counselorsHash[caseItem.twilioWorkerId]);
  const opened = `${format(new Date(caseItem.createdAt), 'MMM d, yyyy')}`;
  const updated = `${format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}`;
  const isOpenCase = caseItem.status === caseStatuses.open;

  return (
    <CLTableRow>
      <CLTableCell>
        <CLCaseNumberContainer isOpenCase={isOpenCase}>
          <CLTableBodyFont isOpenCase={isOpenCase}>#{caseItem.id}</CLTableBodyFont>
        </CLCaseNumberContainer>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{name}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{summary}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{counselor}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{opened}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableBodyFont isOpenCase={isOpenCase}>{updated}</CLTableBodyFont>
      </CLTableCell>
      <CLTableCell>
        <div style={{ display: 'inline-block', flexDirection: 'column' }}>
          <CategoryTag>
            <CatergoryFont>abuse</CatergoryFont>
          </CategoryTag>
          <CategoryTag>
            <CatergoryFont>suicide</CatergoryFont>
          </CategoryTag>
          <CategoryTag>
            <CatergoryFont>something</CatergoryFont>
          </CategoryTag>
        </div>
      </CLTableCell>
      <CLTableCell>
        <ActionsContainer>
          <ButtonBase onClick={() => handleMockedMessage()}>
            <FullscreenIcon />
          </ButtonBase>
        </ActionsContainer>
      </CLTableCell>
    </CLTableRow>
  );
};

CaseListTableRow.displayName = 'CaseListTableRow';
CaseListTableRow.propTypes = {
  caseItem: PropTypes.shape({
    id: PropTypes.string,
    twilioWorkerId: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    status: PropTypes.string,
    info: PropTypes.string,
    childName: PropTypes.string,
    callSummary: PropTypes.string,
  }).isRequired,
  counselorsHash: PropTypes.shape({}).isRequired,
  handleMockedMessage: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

export default connect(mapStateToProps)(CaseListTableRow);
