import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

import {
  CLTableRow,
  CLTableCell,
  CLTableBodyActiveFont,
  CLTableBodyInactiveFont,
  CLCaseNumberContainer,
  CategoryTag,
  CatergoryFont,
} from '../../styles/caseList';
import { getShortSummary } from '../../utils';
import { caseStatuses } from '../../states/DomainConstants';

const CHAR_LIMIT = 200;

const getCaseFontStyle = status => (status === caseStatuses.open ? CLTableBodyActiveFont : CLTableBodyInactiveFont);

const CaseListTableRow = ({ caseItem }) => {
  const opened = `${format(new Date(caseItem.createdAt), 'MMM d, yyyy')}`;
  const updated = `${format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}`;

  const CaseFontStyle = getCaseFontStyle(caseItem.status);

  return (
    <CLTableRow>
      <CLTableCell>
        <CLCaseNumberContainer>
          <CaseFontStyle>#{caseItem.id}</CaseFontStyle>
        </CLCaseNumberContainer>
      </CLTableCell>
      <CLTableCell>
        <CaseFontStyle>Kurt McKinley</CaseFontStyle>
      </CLTableCell>
      <CLTableCell>
        <CaseFontStyle>
          {getShortSummary(
            'Jill Peterson called to say Kurt was thinking of taking his Fanny pack leggings hammock, excepteur id celiac irure direct trade put a bird on it enamel pin banjo quinoa exercitation. Umami pickled in shabby chic, aliquip… readymade aliqua. Quinoa authentic ex, keffiyeh squid do laboris ut officia tattooed skateboard. Artisan cloud bread XOXO dolore hoodie cillum salvia wayfarers small batch adipisicing lyft sunt.',
            // 'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
            CHAR_LIMIT,
          )}
        </CaseFontStyle>
      </CLTableCell>
      <CLTableCell>
        <CaseFontStyle>Gianfranco Paoloni</CaseFontStyle>
      </CLTableCell>
      <CLTableCell>
        <CaseFontStyle>{opened}</CaseFontStyle>
      </CLTableCell>
      <CLTableCell>
        <CaseFontStyle>{updated}</CaseFontStyle>
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
      <CLTableCell />
    </CLTableRow>
  );
};

CaseListTableRow.displayName = 'CaseListTableRow';
CaseListTableRow.propTypes = {
  caseItem: PropTypes.shape({}).isRequired,
};

export default CaseListTableRow;
