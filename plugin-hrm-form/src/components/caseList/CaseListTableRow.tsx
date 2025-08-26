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
import React, { useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { parseISO } from 'date-fns';

import { getDefinitionVersion } from '../../services/ServerlessService';
import { RootState } from '../../states';
import { updateDefinitionVersion } from '../../states/configuration/actions';
import { Case } from '../../types/types';
import {
  CategoriesCell,
  DataCell,
  DataTableRow,
  HiddenText,
  NumericCell,
  OpenLinkAction,
  OpenLinkContainer,
  SummaryCell,
  TableBodyFont,
  TableSummaryFont,
  TextCell,
} from '../../styles';
import { formatName, getShortSummary } from '../../utils/formatters';
import { getContactTags } from '../../utils/categories';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';
import { selectDefinitionVersions } from '../../states/configuration/selectDefinitions';
import {
  newGetTimelineAsyncAction,
  selectCaseLabel,
  selectTimelineContactCategories,
} from '../../states/case/timeline';

const CHAR_LIMIT = 200;
const CONTACTS_TIMELINE_ID = 'print-contacts';

type Props = {
  caseId: Case['id'];
  handleClickViewCase: (currentCase: Case) => () => void;
};

const CaseListTableRow: React.FC<Props> = ({ caseId, handleClickViewCase }) => {
  const dispatch = useDispatch();
  const { connectedCase: caseItem } = useSelector((state: RootState) => selectCaseByCaseId(state, caseId));
  const counselorsHash = useSelector(selectCounselorsHash);
  const definitionVersions = useSelector(selectDefinitionVersions);
  const timelineCategories = useSelector((state: RootState) =>
    selectTimelineContactCategories(state, caseId, CONTACTS_TIMELINE_ID),
  );
  const caseLabel = useSelector((state: RootState) => selectCaseLabel(state, caseId, CONTACTS_TIMELINE_ID));

  const version = caseItem.definitionVersion ?? caseItem.info.definitionVersion;

  useEffect(() => {
    const fetchDefinitionVersions = async () => {
      const definitionVersion = await getDefinitionVersion(version);
      dispatch(updateDefinitionVersion(version, definitionVersion));
    };
    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions();
    }
  }, [definitionVersions, version, dispatch]);

  useEffect(() => {
    if (!timelineCategories) {
      dispatch(
        newGetTimelineAsyncAction(caseId, CONTACTS_TIMELINE_ID, [], true, { offset: 0, limit: 10000 }, `case-list`),
      );
    }
  }, [timelineCategories, caseId, dispatch]);

  if (!caseItem) {
    return null;
  }

  try {
    const { status } = caseItem;
    const statusString = status.charAt(0).toUpperCase() + status.slice(1);
    const summary = caseItem.info && caseItem.info.summary;
    const shortSummary = getShortSummary(summary, CHAR_LIMIT, 'case');
    const counselor = formatName(counselorsHash[caseItem.twilioWorkerId]);
    const opened = parseISO(caseItem.createdAt).toLocaleDateString();
    const beenUpdated = caseItem.createdAt !== caseItem.updatedAt;
    const updated = beenUpdated ? parseISO(caseItem.updatedAt).toLocaleDateString() : '—';
    const followUpDate =
      caseItem.info && caseItem.info.followUpDate ? parseISO(caseItem.info.followUpDate).toLocaleDateString() : '—';

    const definitionVersion = definitionVersions[version];

    const categories = timelineCategories ? getContactTags(definitionVersion, timelineCategories) : [];
    // Get the status for a case from the value of CaseStatus.json of the current form definitions
    const getCaseStatusLabel = (caseStatus: string) => {
      return definitionVersion
        ? Object.values(definitionVersion.caseStatus).filter(status => status.value === caseStatus)[0].label
        : caseStatus;
    };

    return (
      <DataTableRow data-testid="CaseList-TableRow" onClick={handleClickViewCase(caseItem)}>
        <NumericCell>
          <OpenLinkContainer>
            <OpenLinkAction tabIndex={0} data-testid="CaseList-CaseID-Button">
              <HiddenText>
                <Template code={statusString} />
                <Template code="CaseList-THCase" />
              </HiddenText>
              {caseItem.id}
            </OpenLinkAction>
            <TableBodyFont style={{ color: '#606B85', paddingTop: '2px', textAlign: 'center' }}>
              {getCaseStatusLabel(caseItem.status)}
            </TableBodyFont>
          </OpenLinkContainer>
        </NumericCell>
        <TextCell>
          <TableBodyFont>{caseLabel}</TableBodyFont>
        </TextCell>
        <DataCell>
          <TableBodyFont>{counselor}</TableBodyFont>
        </DataCell>
        <SummaryCell>
          <TableSummaryFont>{shortSummary}</TableSummaryFont>
        </SummaryCell>
        <CategoriesCell className="expanded">
          {categories.slice(0, 3).map((category, idx) => (
            <span key={`category-tag-${category.fullyQualifiedName}`}>
              <CategoryWithTooltip
                category={category.label}
                color={category.color}
                fullyQualifiedName={category.fullyQualifiedName}
              />
              {idx === 2 && categories.length > 3 && ' ...'}
            </span>
          ))}
        </CategoriesCell>
        <DataCell>
          <TableBodyFont style={{ textAlign: 'right' }}>{opened}</TableBodyFont>
        </DataCell>
        <DataCell>
          <TableBodyFont style={{ textAlign: 'right' }}>{updated}</TableBodyFont>
        </DataCell>
        <DataCell>
          <TableBodyFont style={{ textAlign: 'right' }}>{followUpDate}</TableBodyFont>
        </DataCell>
      </DataTableRow>
    );
  } catch (err) {
    console.error('Error rendering case row.', err);
    return (
      <DataTableRow>
        <DataCell colSpan={100}>
          <TableBodyFont>INVALID ROW</TableBodyFont>
        </DataCell>
      </DataTableRow>
    );
  }
};

CaseListTableRow.displayName = 'CaseListTableRow';

export default CaseListTableRow;
