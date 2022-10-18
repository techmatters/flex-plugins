import { Template } from '@twilio/flex-ui';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { format } from 'date-fns';

import { contactFormsBase, namespace, RootState } from '../../states';
import { getFileDownloadUrlFromUrl } from '../../services/ServerlessService';
import { SectionActionButton } from '../../styles/search';
import { loadTranscript } from '../../states/contacts/existingContacts';
import { FontOpenSans } from '../../styles/HrmStyles';
import {
  MessageList,
  MessageBubble,
  MessageBubbleBody,
  MessageBubbleHeader,
  ItalicFont,
} from './TranscriptSection.styles';

type OwnProps = {
  contactId: string;
  transcriptUrl: string;
  canViewTranscript: boolean;
  transcriptAvailable: boolean;
};
// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const TranscriptSection: React.FC<Props> = ({
  contactId,
  canViewTranscript,
  myIdentity,
  transcriptAvailable,
  transcriptUrl,
  transcript,
  loadTranscript,
}) => {
  const [loading, setLoading] = useState(false);

  if (!canViewTranscript) {
    return (
      <ItalicFont>
        <Template code="TranscriptSection-TranscriptNotAvailableDifficulties" />
      </ItalicFont>
    );
  }

  if (!transcriptAvailable || !transcriptUrl) {
    return (
      <ItalicFont>
        <Template code="TranscriptSection-TranscriptNotAvailableCheckLater" />
      </ItalicFont>
    );
  }

  if (loading) {
    return <CircularProgress size={30} />;
  }

  if (!transcript) {
    const fetchAndLoadTranscript = async () => {
      try {
        setLoading(true);
        const transcriptPreSignedUrl = await getFileDownloadUrlFromUrl(transcriptUrl, '');
        const transcriptJson = await fetch(transcriptPreSignedUrl.downloadUrl);
        const transcriptParsed = await transcriptJson.json();
        // TODO: the current example of a transcript contains more stuff. Here we only want the transcript itself probably?
        loadTranscript(contactId, transcriptParsed.transcript);
        setLoading(false);
      } catch (err) {
        console.error(`Error loading the transcript for contact ${contactId}, transcriptUrl ${transcriptUrl}`, err);
      }
    };

    return (
      <SectionActionButton type="button" onClick={fetchAndLoadTranscript}>
        <Template code="ContactDetails-LoadTranscript-Button" />
      </SectionActionButton>
    );
  }
  console.log(transcript);
  return (
    <MessageList>
      {transcript.messages.map(m => {
        const isFromMe = m.from === myIdentity;

        return (
          <MessageBubble key={m.sid} isFromMe={isFromMe}>
            <MessageBubbleHeader>
              <FontOpenSans>{m.from}</FontOpenSans>
              <FontOpenSans>{format(new Date(m.dateCreated), 'h:mm aaaaa')}m</FontOpenSans>
            </MessageBubbleHeader>
            <MessageBubbleBody>{m.body}</MessageBubbleBody>
          </MessageBubble>
        );
      })}
    </MessageList>
  );
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  transcript: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.transcript,
  myIdentity: state.flex.chat.session.client.user.identity,
});

const mapDispatchToProps = {
  loadTranscript,
};

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptSection);
