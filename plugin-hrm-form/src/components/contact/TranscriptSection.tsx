import { Template } from '@twilio/flex-ui';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { format } from 'date-fns';

import type { TwilioStoredMedia, S3StoredTranscript } from '../../types/types';
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
  twilioStoredTranscript?: TwilioStoredMedia;
  externalStoredTranscript?: S3StoredTranscript;
  loadConversationIntoOverlay: () => Promise<void>;
};
// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const TranscriptSection: React.FC<Props> = ({
  contactId,
  twilioStoredTranscript,
  externalStoredTranscript,
  loadConversationIntoOverlay,
  myIdentity,
  transcript,
  loadTranscript,
}) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <CircularProgress size={30} />;
  }

  // Preferred case, external transcript is already in local state
  if (transcript) {
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
  }

  // The external transcript is exported but it hasn't been fetched yet
  if (externalStoredTranscript && externalStoredTranscript.url && !transcript) {
    const fetchAndLoadTranscript = async () => {
      try {
        setLoading(true);
        const transcriptPreSignedUrl = await getFileDownloadUrlFromUrl(externalStoredTranscript.url, '');
        const transcriptJson = await fetch(transcriptPreSignedUrl.downloadUrl);
        const transcriptParsed = await transcriptJson.json();
        loadTranscript(contactId, transcriptParsed.transcript);
        setLoading(false);
      } catch (err) {
        console.error(
          `Error loading the transcript for contact ${contactId}, transcript url ${externalStoredTranscript.url}`,
          err,
        );
      }
    };

    return (
      <SectionActionButton type="button" onClick={fetchAndLoadTranscript}>
        <Template code="ContactDetails-LoadTranscript-Button" />
      </SectionActionButton>
    );
  }

  // External transcript is pending/disabled but Twilio transcript is enabled
  if (twilioStoredTranscript) {
    const loadTwilioStoredTranscript = async () => {
      try {
        setLoading(true);
        await loadConversationIntoOverlay();
        setLoading(false);
      } catch (err) {
        console.error(
          `Error loading the conversation overlay for contact ${contactId}, Twilio stored transcript details ${twilioStoredTranscript}`,
          err,
        );
      }
    };

    return (
      <SectionActionButton type="button" onClick={loadTwilioStoredTranscript}>
        <Template code="ContactDetails-LoadTranscript-Button" />
      </SectionActionButton>
    );
  }

  // External is still pending and Twilio transcript is disabled
  if (externalStoredTranscript && !externalStoredTranscript.url) {
    return (
      <ItalicFont>
        <Template code="TranscriptSection-TranscriptNotAvailableCheckLater" />
      </ItalicFont>
    );
  }

  // Something went wrong
  return (
    <ItalicFont>
      <Template code="TranscriptSection-TranscriptNotAvailableDifficulties" />
    </ItalicFont>
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
