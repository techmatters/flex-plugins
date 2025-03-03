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

import { Row } from '../../../styles';
import { CaseActionDetailFont } from '../styles';
import ActionHeader from '../ActionHeader';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import { CaseHistoryDetails } from '../../../states/case/selectCaseStateByCaseId';

type OwnProps = CaseHistoryDetails;

type Props = OwnProps;

const CaseOverviewEditHistory: React.FC<Props> = ({
  createdAt,
  createdBy,
  updatedBy,
  updatedAt,
  statusUpdatedAt,
  statusUpdatedBy,
  previousStatusLabel,
  statusLabel,
}) => {
  const { enable_last_case_status_update_info: enableLastCaseStatusUpdateInfo } = getAseloFeatureFlags();

  return (
    <>
      <ActionHeader added={createdAt} addingCounsellor={createdBy} updated={updatedAt} updatingCounsellor={updatedBy} />

      {enableLastCaseStatusUpdateInfo && statusUpdatedAt && (
        <Row style={{ width: '100%' }}>
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-EditSummary-EditHistory-StatusUpdated">
            <Template
              code="Case-EditSummary-EditHistory-StatusUpdated"
              date={statusUpdatedAt.toLocaleDateString()}
              time={statusUpdatedAt.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })}
              counsellor={statusUpdatedBy}
              previousStatus={previousStatusLabel}
              updatedStatus={statusLabel}
            />
          </CaseActionDetailFont>
        </Row>
      )}
    </>
  );
};

CaseOverviewEditHistory.displayName = 'ActionHeader';

export default CaseOverviewEditHistory;
