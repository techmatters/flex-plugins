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
import { CaseOverviewTypeEntry } from 'hrm-form-definitions';

import { CaseDetailsBorder, CaseSectionFont, CaseStyledTextArea } from '../styles';
import type { CustomITask, StandaloneITask } from '../../../types/types';
import { getTemplateStrings } from '../../../hrmConfig';
import selectCurrentRouteCaseState from '../../../states/case/selectCurrentRouteCase';
import { RootState } from '../../../states';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  textareaFields?: (CaseOverviewTypeEntry & {
    placeholder?: string;
  })[];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const CaseTextAreaEntry: React.FC<Props> = ({ connectedCaseState, textareaFields }) => {
  const strings = getTemplateStrings();
  const { connectedCase } = connectedCaseState;

  if (!textareaFields || textareaFields.length === 0) return null;

  return (
    <>
      {textareaFields.map(field => {
        const fieldValue = connectedCase.info?.[field.name] || '';
        const defaultRows = 5;

        const placeholder =
          field.placeholder || (field.name === 'summary' ? strings.NoCaseSummary : `No ${field.label}`);

        return (
          <CaseDetailsBorder key={field.name} marginTop="25px">
            <CaseSectionFont id={`Case-${field.name}-label`}>
              <Template code={field.label} />
            </CaseSectionFont>
            <CaseStyledTextArea
              rows={fieldValue ? defaultRows : undefined}
              data-testid={field.name === 'summary' ? 'Case-CaseSummary-TextArea' : `Case-${field.name}-TextArea`}
              aria-labelledby={`Case-${field.name}-label`}
              placeholder={placeholder}
              value={fieldValue}
              readOnly={true}
            />
          </CaseDetailsBorder>
        );
      })}
    </>
  );
};

CaseTextAreaEntry.displayName = 'CaseTextAreaEntry';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  return { connectedCaseState: selectCurrentRouteCaseState(state, task.taskSid) };
};

export default connect(mapStateToProps)(CaseTextAreaEntry);
