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
import { connect, ConnectedProps } from 'react-redux';
import { DefinitionVersionId } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';

import { getDefinitionVersion } from '../../services/ServerlessService';
import { RootState } from '../../states';
import * as ConfigActions from '../../states/configuration/actions';
import { Case } from '../../types/types';
import {
  Box,
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
import { formatName, getShortSummary } from '../../utils';
import { getContactTags } from '../../utils/categories';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import { getHrmConfig } from '../../hrmConfig';
import { configurationBase, namespace } from '../../states/storeNamespaces';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';
import { selectFirstCaseContact } from '../../states/contacts/selectContactByCaseId';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';

const CHAR_LIMIT = 200;

type OwnProps = {
  caseId: Case['id'];
  handleClickViewCase: (currentCase: Case) => () => void;
};

const mapStateToProps = (state: RootState, { caseId }: OwnProps) => {
  const caseItem = selectCaseByCaseId(state, caseId)?.connectedCase;
  return {
    definitionVersions: state[namespace][configurationBase].definitionVersions,
    counselorsHash: selectCounselorsHash(state),
    caseItem,
    firstConnectedContact: selectFirstCaseContact(state, caseItem),
  };
};

const mapDispatchToProps = {
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseListTableRow: React.FC<Props> = ({
  caseItem,
  firstConnectedContact,
  counselorsHash,
  handleClickViewCase,
  ...props
}) => {
  const { updateDefinitionVersion, definitionVersions } = props;
  const { definitionVersion } = getHrmConfig();
  let version = caseItem.info.definitionVersion;
  if (!Object.values(DefinitionVersionId).includes(version)) {
    console.warn(
      `Form definition version ${
        typeof version === 'string' ? `'${version}'` : version
      } does not exist in defined set: ${Object.values(
        DefinitionVersionId,
      )}. Falling back to to current configured version '${definitionVersion}' for case with id ${caseItem.id}`,
    );
    version = definitionVersion;
  }

  useEffect(() => {
    const fetchDefinitionVersions = async () => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };
    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions();
    }
  }, [definitionVersions, updateDefinitionVersion, version]);

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

    const categories = getContactTags(definitionVersion, caseItem.categories);
    // Get the status for a case from the value of CaseStatus.json of the current form definitions
    const getCaseStatusLabel = (caseStatus: string) => {
      return definitionVersion
        ? Object.values(definitionVersion.caseStatus).filter(status => status.value === caseStatus)[0].label
        : caseStatus;
    };

    const contactLabel = contactLabelFromHrmContact(definitionVersion, firstConnectedContact);

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
          <TableBodyFont>{contactLabel}</TableBodyFont>
        </TextCell>
        <DataCell>
          <TableBodyFont>{counselor}</TableBodyFont>
        </DataCell>
        <SummaryCell>
          <TableSummaryFont>{shortSummary}</TableSummaryFont>
        </SummaryCell>
        <CategoriesCell>
          {categories &&
            categories.map(category => (
              <Box key={`category-tag-${category.label}`} marginBottom="5px">
                <CategoryWithTooltip category={category.label} color={category.color} />
              </Box>
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
const connected = connector(CaseListTableRow);

export default connected;
