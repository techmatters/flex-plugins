/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { CaseInfo, DocumentEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import DocumentInformationRow from './DocumentInformationRow';
import { PermissionActions, PermissionActionType } from '../../permissions';

type OwnProps = {
  onClickAddDocument: () => void;
  onClickView: (document: DocumentEntry) => void;
  documents: CaseInfo['documents'];
  can: (action: PermissionActionType) => boolean;
};

const Documents: React.FC<OwnProps> = ({ onClickAddDocument, onClickView, documents, can }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddDocumentSection-label">
            <Template code="Case-AddDocumentSection" />
          </CaseSectionFont>
          <CaseAddButton
            templateCode="Case-Document"
            onClick={onClickAddDocument}
            disabled={!can(PermissionActions.ADD_DOCUMENT)}
          />
        </Row>
      </Box>
      {documents.length ? (
        documents.map((d, index) => (
          <DocumentInformationRow key={`document-${index}`} documentEntry={d} onClickView={() => onClickView(d)} />
        ))
      ) : (
        <TimelineRow>
          <PlaceHolderText>
            <Template code="Case-NoDocuments" />
          </PlaceHolderText>
        </TimelineRow>
      )}
    </>
  );
};

Documents.displayName = 'Documents';

export default Documents;
