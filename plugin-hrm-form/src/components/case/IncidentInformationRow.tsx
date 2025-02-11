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
import type { FormDefinition, LayoutDefinition, LayoutValue } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import { RowItemContainer, TimelineDate, TimelineLabel, TimelineRow, TimelineText, ViewButton } from './styles';
import { Box, Flex, HiddenText } from '../../styles';
import { CaseSection } from '../../services/caseSectionService';
import { formatFileNameAtAws } from '../../utils';

type OwnProps = {
  definition: FormDefinition;
  section: CaseSection;
  layoutDefinition: LayoutDefinition;
  onClickView: () => void;
};

const RowItem: React.FC<{ flexWidthRatio: number }> = ({ children, flexWidthRatio }) => (
  <RowItemContainer style={{ flex: flexWidthRatio }}>{children}</RowItemContainer>
);
RowItem.displayName = 'RowItem';

const IncidentInformationRow: React.FC<OwnProps> = ({ definition, section, layoutDefinition, onClickView }) => {
  const layouts = layoutDefinition.layout ?? { createdAt: { format: 'date' } };
  const previewFields = layoutDefinition.previewFields ?? Object.values(layouts);

  const renderValue = (name: string): JSX.Element => {
    const layout: LayoutValue | undefined = layouts[name];
    switch (layout?.format) {
      case 'date': {
        let value: Date | string = section.sectionTypeSpecificData[name];
        if (!value) {
          value = section[name];
        }
        if (!(value instanceof Date)) {
          value = parseISO(value);
        }
        return <TimelineDate>{value.toLocaleDateString(navigator.language)}</TimelineDate>;
      }
      case 'file': {
        return (
          <Flex>
            <AttachFileIcon style={{ fontSize: '20px', marginRight: 5 }} />
            <TimelineText>{formatFileNameAtAws(section.sectionTypeSpecificData[name])}</TimelineText>
          </Flex>
        );
      }
      case 'string':
      default:
        if (layout?.valueTemplateCode) {
          return (
            <TimelineText>
              <Template code={layout.valueTemplateCode} {...section.sectionTypeSpecificData} />
            </TimelineText>
          );
        }
        return <TimelineText>{section.sectionTypeSpecificData[name]}</TimelineText>;
    }
  };
  return (
    <TimelineRow>
      {previewFields.map((name, index) => {
        const fieldDef = definition.find(e => e.name === name);
        const layout = layouts[name];

        return (
          <RowItem key={`item-${name}-${index}`} flexWidthRatio={layout?.widthRatio ?? 1}>
            <HiddenText>
              <Template code={layout?.labelTemplateCode ?? fieldDef?.label ?? '#MISSING_LABEL'} />
            </HiddenText>
            <div style={{ display: 'inline-block' }}>
              {layout?.includeLabel && (
                <TimelineLabel>
                  <Template code={layout?.labelTemplateCode ?? fieldDef?.label ?? '#MISSING_LABEL'} />:{' '}
                </TimelineLabel>
              )}
              {renderValue(name)}
            </div>
          </RowItem>
        );
      })}
      <RowItem flexWidthRatio={1}>
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
