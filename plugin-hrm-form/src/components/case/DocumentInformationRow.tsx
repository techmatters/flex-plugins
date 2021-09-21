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
} from '../../styles/case';
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
      <Box marginLeft="auto" marginRight="10px">
        <ViewButton onClick={onClickView} data-testid="Case-InformationRow-ViewButton">
          <Template code="Case-ViewButton" />
        </ViewButton>
      </Box>
    </TimelineRow>
  );
};

DocumentInformationRow.displayName = 'DocumentInformationRow';

export default DocumentInformationRow;
