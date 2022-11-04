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
  ErrorFont,
  ItalicFont,
  MessageList,
  MessageBubble,
  MessageBubbleBody,
  MessageBubbleHeader,
} from './TranscriptSection.styles';

type OwnProps = {
  contactId: string;
  twilioStoredTranscript?: TwilioStoredMedia;
  externalStoredTranscript?: S3StoredTranscript;
  loadConversationIntoOverlay: () => Promise<void>;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class TranscriptFetchResponseError extends Error {
  public response: Response;

  constructor(message, options) {
    super(message);

    // see: https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, TranscriptFetchResponseError.prototype);

    this.name = 'TranscriptFetchResponseError';
    this.response = options.response;

  }
}

const TranscriptSection: React.FC<Props> = ({
  contactId,
  twilioStoredTranscript,
  externalStoredTranscript,
  loadConversationIntoOverlay,
  myIdentity,
  transcript,
  loadTranscript,

  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Currently this should only really catch errors when we try to download the file from the signed link.
  const isErrTemporary = err => {
    return err.message === 'Failed to fetch';
  };

  const handleFetchAndLoadException = err => {
    console.error(
      `Error loading the transcript for contact ${contactId}, transcript url ${externalStoredTranscript.url}`,
      err,
    );

    const errorMessage = isErrTemporary(err) ? 'TranscriptSection-TemporaryError' : 'TranscriptSection-PermanentError';

    setErrorMessage(errorMessage);
    setLoading(false);
  };

  /*
   *The underlying s3Client.getSignedUrl() method returns a signed URL even if there is a problem.
   *We need to check the response status code to make sure there isn't a permission or pathing issue with the file.
   */
  const validateFetchResponse = response => {
    if (response.status !== 200) {
      throw new TranscriptFetchResponseError('Error fetching transcript', { response });
    }
  };

  const fetchAndLoadTranscript = async () => {
    try {
      setLoading(true);

      const transcriptPreSignedUrl = await getFileDownloadUrlFromUrl(externalStoredTranscript.url, '');
      const transcriptResponse = await fetch(transcriptPreSignedUrl.downloadUrl);

      validateFetchResponse(transcriptResponse);

      const transcriptJson = await transcriptResponse.json();

      loadTranscript(contactId, transcriptJson.transcript);

      setLoading(false);
    } catch (err) {
      handleFetchAndLoadException(err);
    }
  };

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

  if (loading) {
    return <CircularProgress size={30} />;
  }

  if (errorMessage) {
    return (
      <ErrorFont>
        <Template code={errorMessage} />
      </ErrorFont>
    );
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
    return (
      <SectionActionButton type="button" onClick={fetchAndLoadTranscript}>
        <Template code="ContactDetails-LoadTranscript-Button" />
      </SectionActionButton>
    );
  }

  // External transcript is pending/disabled but Twilio transcript is enabled
  if (twilioStoredTranscript) {
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
      <Template code="TranscriptSection-TemporaryError" />
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
