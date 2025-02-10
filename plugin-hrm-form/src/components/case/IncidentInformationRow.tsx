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

/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import type { FormDefinition, LayoutDefinition } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import {
  RowItemContainer,
  TimelineDate,
  TimelineFileName,
  TimelineLabel,
  TimelineRow,
  TimelineText,
  ViewButton,
} from './styles';
import { Box, HiddenText } from '../../styles';
import { CaseSection } from '../../services/caseSectionService';
import { formatFileNameAtAws } from '../../utils';

type OwnProps = {
  definition: FormDefinition;
  section: CaseSection;
  layoutDefinition: LayoutDefinition;
  onClickView: () => void;
};

const RowItem: React.FC = ({ children }) => <RowItemContainer style={{ flex: 1 }}>{children}</RowItemContainer>;
RowItem.displayName = 'RowItem';

const IncidentInformationRow: React.FC<OwnProps> = ({ definition, section, layoutDefinition, onClickView }) => {
  const renderValue = (name: string): JSX.Element => {
    const layout = layoutDefinition.layout[name];
    const fieldDef = definition.find(e => e.name === name);
    switch (layout.format) {
      case 'date': {
        let value: Date | string = section.sectionTypeSpecificData[fieldDef.name];
        if (!value) {
          value = section.sectionTypeSpecificData[fieldDef.name];
        }
        if (!(value instanceof Date)) {
          value = parseISO(value);
        }
        return <TimelineDate>{value.toLocaleDateString(navigator.language)}</TimelineDate>;
      }
      case 'file': {
        return (
          <>
            <AttachFileIcon style={{ fontSize: '20px', marginRight: 5 }} />
            <TimelineFileName>{formatFileNameAtAws(section.sectionTypeSpecificData[fieldDef.name])}</TimelineFileName>
          </>
        );
      }
      case 'string':
      default:
        if (layout.valueTemplateCode) {
          return <Template code={layout.valueTemplateCode} {...section.sectionTypeSpecificData} />;
        }
        return <TimelineText>{section.sectionTypeSpecificData[fieldDef.name]}</TimelineText>;
    }
  };
  return (
    <TimelineRow>
      {layoutDefinition.previewFields.map((name, index) => {
        const fieldDef = definition.find(e => e.name === name);
        const layout = layoutDefinition.layout[name];

        return (
          <RowItem key={`item-${fieldDef.label}-${index}`}>
            <HiddenText>
              <Template code={fieldDef.label} />
            </HiddenText>
            <div style={{ display: 'inline-block' }}>
              {layout.includeLabel && (
                <TimelineLabel>
                  <Template code={layout.labelTemplateCode ?? fieldDef.label} />:{' '}
                </TimelineLabel>
              )}
              {renderValue(name)}
            </div>
          </RowItem>
        );
      })}
      <RowItem>
        <Box marginLeft="auto">
          <ViewButton onClick={onClickView} data-testid="Case-InformationRow-ViewButton">
            <Template code="Case-ViewButton" />
          </ViewButton>
        </Box>
      </RowItem>
    </TimelineRow>
  );
};

IncidentInformationRow.displayName = 'IncidentInformationRow';

export default IncidentInformationRow;
