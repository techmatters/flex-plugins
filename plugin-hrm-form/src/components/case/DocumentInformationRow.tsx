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
import { parseISO } from 'date-fns';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import { DocumentEntry } from '../../types/types';
import {
  TimelineRow,
  TimelineText,
  TimelineFileName,
  TimelineDate,
  ViewButton,
  RowItemContainer,
} from './styles';
import { Box, HiddenText } from '../../styles/HrmStyles';
import { formatFileNameAtAws } from '../../utils';

type OwnProps = {
  documentEntry: DocumentEntry;
  onClickView: () => void;
};

const RowItem: React.FC<{ isName?: boolean }> = ({ children, isName }) => (
  <RowItemContainer style={{ flex: isName ? 1.5 : 1 }}>{children}</RowItemContainer>
);
RowItem.displayName = 'RowItem';

const DocumentInformationRow: React.FC<OwnProps> = ({ documentEntry, onClickView }) => {
  const date = parseISO(documentEntry.createdAt).toLocaleDateString(navigator.language);
  return (
    <TimelineRow>
      <HiddenText>
        <Template code="Case-DocumentDate" />
      </HiddenText>
      <TimelineDate>{date}</TimelineDate>
      <AttachFileIcon style={{ fontSize: '20px', marginRight: 5 }} />
      <HiddenText>
        <Template code="Case-DocumentFileName" />
      </HiddenText>
      <TimelineFileName>{formatFileNameAtAws(documentEntry.document.fileName)}</TimelineFileName>
      <HiddenText>
        <Template code="Case-DocumentComments" />
      </HiddenText>
      <TimelineText>{documentEntry.document.comments}</TimelineText>
      <Box marginLeft="auto">
        <ViewButton onClick={onClickView} data-testid="Case-InformationRow-ViewButton">
          <Template code="Case-ViewButton" />
        </ViewButton>
      </Box>
    </TimelineRow>
  );
};

DocumentInformationRow.displayName = 'DocumentInformationRow';

export default DocumentInformationRow;
