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

import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText, CaseDetailsBorder } from './styles';
import CaseAddButton from './CaseAddButton';

type OwnProps = {
  onClickAddItem: () => void;
  canAdd: () => boolean;
  sectionTypeId: string;
  children?: JSX.Element;
};

const CaseSection: React.FC<OwnProps> = ({ onClickAddItem, canAdd, children, sectionTypeId }) => {
  return (
    <CaseDetailsBorder sectionTypeId={sectionTypeId === 'Document'}>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id={`Case-Add${sectionTypeId}Section-label`}>
            <Template code={`Case-Add${sectionTypeId}Section`} />
          </CaseSectionFont>
          <CaseAddButton templateCode={`Case-${sectionTypeId}`} onClick={onClickAddItem} disabled={!canAdd()} />
        </Row>
      </Box>

      {!children || children.type === null ? (
        <TimelineRow>
          <PlaceHolderText>
            <Template code={`Case-No${sectionTypeId}s`} />
          </PlaceHolderText>
        </TimelineRow>
      ) : (
        children
      )}
    </CaseDetailsBorder>
  );
};

CaseSection.displayName = `CaseSection`;

export default CaseSection;
