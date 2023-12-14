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
import { connect } from 'react-redux';

import { CaseDetailsBorder, CaseSectionFont, CaseSummaryTextArea } from '../../styles/case';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { getTemplateStrings } from '../../hrmConfig';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import { RootState } from '../../states';

type OwnProps = {
  task: CustomITask | StandaloneITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const CaseSummary: React.FC<Props> = ({ connectedCaseState }) => {
  const strings = getTemplateStrings();
  const { connectedCase } = connectedCaseState;
  const summary = connectedCase.info?.summary || '';

  return (
    <CaseDetailsBorder marginBottom="-25px" paddingBottom="15px">
      <CaseSectionFont id="Case-CaseSummary-label">
        <Template code="Case-CaseSummarySection" />
      </CaseSectionFont>
      <CaseSummaryTextArea
        rows={summary ? 5 : undefined}
        data-testid="Case-CaseSummary-TextArea"
        aria-labelledby="Case-CaseSummary-label"
        // Add Case summary doesn't show up as default value
        placeholder={strings.NoCaseSummary}
        value={summary}
        readOnly={true}
      />
    </CaseDetailsBorder>
  );
};

CaseSummary.displayName = 'CaseSummary';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  return { connectedCaseState: selectCurrentRouteCaseState(state, task.taskSid) };
};

export default connect(mapStateToProps)(CaseSummary);
