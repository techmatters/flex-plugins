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
import AssignmentIcon from '@material-ui/icons/AssignmentOutlined';
import { useDispatch } from 'react-redux';

import { getAseloFeatureFlags } from '../../hrmConfig';
import { Row, StyledCSAMReportButton } from '../../styles';
import { CSAMReportButtonText } from './styles';
import asyncDispatch from '../../states/asyncDispatch';
import { newGenerateSummaryAsyncAction } from '../../states/contacts/llmAssistant';
import { isInMyBehalfITask, isTwilioTask, RouterTask} from '../../types/types';

type Props = {
  task: RouterTask;
};

const GenerateSummaryButton: React.FC<Props> = ({ task }) => {
  const { enable_llm_summary: enableLlmSummary } = getAseloFeatureFlags();
  const dispatch = asyncDispatch(useDispatch());
  if (!enableLlmSummary || !isTwilioTask(task) || isInMyBehalfITask(task)) return null;

  const handleClick = async () => {
    await dispatch(newGenerateSummaryAsyncAction(task));
  };

  return (
    <Row>
      <StyledCSAMReportButton style={{ marginRight: 10 }} onClick={handleClick}>
        <AssignmentIcon fontSize="inherit" style={{ marginRight: 5 }} />
        <CSAMReportButtonText>Generate Summary</CSAMReportButtonText>
      </StyledCSAMReportButton>
    </Row>
  );
};

GenerateSummaryButton.displayName = 'GenerateSummaryButton';

export default GenerateSummaryButton;
