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
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';

import { Row } from '../../styles';
import { CaseActionDetailFont } from './styles';
import { Case } from '../../types/types';
import ActionHeader from './ActionHeader';
import { caseItemHistory } from '../../states/case/types';
import { getAseloFeatureFlags } from '../../hrmConfig';

type OwnProps = {
  sourceCase: Case;
  counselorsHash: { [key: string]: string };
  definitionVersion: DefinitionVersion;
};

type Props = OwnProps;

const CaseSummaryEditHistory: React.FC<Props> = ({ sourceCase, counselorsHash, definitionVersion }) => {
  const { status, previousStatus, statusUpdatedAt, statusUpdatedBy } = sourceCase;
  const previousStatusLabel = previousStatus
    ? definitionVersion.caseStatus[previousStatus]?.label || 'Unknown'
    : 'None';
  const statusLabel = previousStatus ? definitionVersion.caseStatus[status]?.label || 'Unknown' : undefined;
  const statusUpdatingCounsellorName = statusUpdatedBy ? counselorsHash[statusUpdatedBy] || 'Unknown' : undefined;
  const statusUpdated = statusUpdatedAt ? new Date(statusUpdatedAt) : undefined;
  const { enable_last_case_status_update_info: enableLastCaseStatusUpdateInfo } = getAseloFeatureFlags();
  const { added, addingCounsellorName, updated, updatingCounsellorName } = caseItemHistory(sourceCase, counselorsHash);

  return (
    <>
      <ActionHeader
        added={added}
        addingCounsellor={addingCounsellorName}
        updated={updated}
        updatingCounsellor={updatingCounsellorName}
      />

      {enableLastCaseStatusUpdateInfo && status && statusUpdated && (
        <Row style={{ width: '100%' }}>
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-EditSummary-EditHistory-StatusUpdated">
            <Template
              code="Case-EditSummary-EditHistory-StatusUpdated"
              date={statusUpdated.toLocaleDateString()}
              time={statusUpdated.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })}
              counsellor={statusUpdatingCounsellorName}
              previousStatus={previousStatusLabel}
              updatedStatus={statusLabel}
            />
          </CaseActionDetailFont>
        </Row>
      )}
    </>
  );
};

CaseSummaryEditHistory.displayName = 'ActionHeader';

export default CaseSummaryEditHistory;
