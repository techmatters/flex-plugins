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
import { isEqual } from 'date-fns';

import { Row } from '../../styles';
import { CaseActionDetailFont } from './styles';

type OwnProps = {
  added?: Date;
  addingCounsellor: string;
  updated?: Date;
  updatingCounsellor?: string;
  includeTime?: boolean;
  codeTemplate?: string;
  focusCloseButton?: boolean;
};

type Props = OwnProps;

const ActionHeader: React.FC<Props> = ({ added, addingCounsellor, updated, updatingCounsellor, codeTemplate }) => {
  return (
    <>
      <Row style={{ width: '100%' }}>
        {added && (
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderAdded">
            <Template
              code={codeTemplate ? codeTemplate : 'Case-ActionHeaderAdded'}
              date={added.toLocaleDateString()}
              time={added.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })}
              counsellor={addingCounsellor}
            />
          </CaseActionDetailFont>
        )}
        {!added && (
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderCounselor">
            <Template code="Case-ActionHeaderCounselor" /> {addingCounsellor}
          </CaseActionDetailFont>
        )}
      </Row>
      {updated && !isEqual(updated, added) && (
        <Row style={{ width: '100%' }}>
          <CaseActionDetailFont style={{ marginRight: 20 }} data-testid="Case-ActionHeaderUpdated">
            <Template
              code="Case-ActionHeaderUpdated"
              date={updated.toLocaleDateString()}
              time={updated.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })}
              counsellor={updatingCounsellor}
            />
          </CaseActionDetailFont>
        </Row>
      )}
    </>
  );
};

ActionHeader.displayName = 'ActionHeader';

export default ActionHeader;
