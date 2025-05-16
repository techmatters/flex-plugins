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
import type { LayoutDefinition, LayoutValue } from '@tech-matters/hrm-form-definitions';
import React from 'react';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import { CaseSection } from '../../services/caseSectionService';
import { TimelineDate, TimelineText } from './styles';
import { Flex } from '../../styles';
import formatFormValue from '../forms/formatFormValue';

type Props = {
  section: CaseSection;
  layoutDefinition: LayoutDefinition;
  fieldName: string;
};

const CaseSectionPreviewTextValue: React.FC<Props> = ({ section, layoutDefinition, fieldName }) => {
  const fieldLayouts = layoutDefinition.layout ?? { createdAt: { format: 'date' } };
  const layout: LayoutValue | undefined = fieldLayouts[fieldName];
  let value: Date | string | boolean | number = section.sectionTypeSpecificData[fieldName];
  if (!value) {
    value = section[fieldName];
  }
  if (value instanceof Date) {
    value = value.toISOString();
  }
  const formattedText = formatFormValue(value, layout, section.sectionTypeSpecificData);
  switch (layout?.format) {
    case 'timestamp':
    case 'date': {
      return <TimelineDate>{formattedText}</TimelineDate>;
    }
    case 'file': {
      return (
        <Flex>
          <AttachFileIcon style={{ fontSize: '20px', marginRight: 5 }} />
          <TimelineText>{formattedText}</TimelineText>
        </Flex>
      );
    }
    case 'string':
    default:
      return <TimelineText>{formattedText}</TimelineText>;
  }
};

CaseSectionPreviewTextValue.displayName = 'CaseSectionPreviewTextValue';

export default CaseSectionPreviewTextValue;
