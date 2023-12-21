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

import { Template } from '@twilio/flex-ui';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import format from 'date-fns/format';

import type { TwilioStoredMedia, S3StoredTranscript } from '../../../types/types';
import { RootState } from '../../../states';
import { fetchHrmApi, generateSignedURLPath } from '../../../services/fetchHrmApi';
import { loadTranscript, TranscriptMessage, TranscriptResult } from '../../../states/contacts/existingContacts';
import { Box } from '../../../styles';
import { GroupedMessage } from '../../Messaging/MessageItem';
import { MessageList } from '../../Messaging/MessageList';
import { ErrorFont, ItalicFont, LoadMediaButton, LoadMediaButtonText } from './styles';
import { contactFormsBase, namespace } from '../../../states/storeNamespaces';

type OwnProps = {
  contactId: string;
  twilioStoredTranscript?: TwilioStoredMedia;
  externalStoredTranscript?: S3StoredTranscript;
  loadConversationIntoOverlay: () => Promise<void>;
};

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

type MessageWithSenderInfo = TranscriptMessage & {
  friendlyName: string;
  isCounselor: boolean;
};
const addSenderInfoToMessage = (participants: TranscriptResult['transcript']['participants']) => (
  message: TranscriptMessage,
): MessageWithSenderInfo => {
  const friendlyName = participants[message.from]?.user?.friendlyName;
  const isCounselor = participants[message.from]?.role?.isCounselor;

  return { ...message, friendlyName, isCounselor };
};

const areSameDate = (m1: MessageWithSenderInfo, m2: MessageWithSenderInfo): boolean =>
  format(new Date(m1.dateCreated), 'yyyy/MM/dd') === format(new Date(m2.dateCreated), 'yyyy/MM/dd');

const groupMessagesByDate = (m: MessageWithSenderInfo, index: number, ms: MessageWithSenderInfo[]): GroupedMessage => {
  const prevMessage = index > 0 ? ms[index - 1] : null;
  const isGroupedWithPrevious = Boolean(prevMessage && prevMessage.from === m.from && areSameDate(prevMessage, m));

  return { ...m, isGroupedWithPrevious };
};

const groupMessagesAndAddSenderInfo = (transcript: TranscriptResult['transcript']): GroupedMessage[] =>
  transcript.messages.map(addSenderInfoToMessage(transcript.participants)).map(groupMessagesByDate);

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const TranscriptSection: React.FC<Props> = ({
  contactId,
  twilioStoredTranscript,
  externalStoredTranscript,
  loadConversationIntoOverlay,
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
      `Error loading the transcript for contact ${contactId}, transcript url ${externalStoredTranscript.storeTypeSpecificData.location.key}`,
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
    const {
      storeTypeSpecificData: { location },
    } = externalStoredTranscript;
    try {
      setLoading(true);

      const { media_url: transcriptPreSignedUrl } = await fetchHrmApi(
        generateSignedURLPath({
          method: 'getObject',
          objectType: 'contact',
          objectId: contactId,
          fileType: 'transcript',
          location,
        }),
      );

      const transcriptResponse = await fetch(transcriptPreSignedUrl);

      validateFetchResponse(transcriptResponse);
      const transcriptJson: TranscriptResult = await transcriptResponse.json();

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
    const groupedMessages = groupMessagesAndAddSenderInfo(transcript);

    return (
      <Box padding="0 3.75% 50px 3.75%" width="100%">
        <MessageList messages={groupedMessages} />
      </Box>
    );
  }

  // The external transcript is exported but it hasn't been fetched yet
  if (externalStoredTranscript?.storeTypeSpecificData?.location && !transcript) {
    return (
      <LoadMediaButton type="button" onClick={fetchAndLoadTranscript}>
        <LoadMediaButtonText>
          <Template code="ContactDetails-LoadTranscript-Button" />
        </LoadMediaButtonText>
      </LoadMediaButton>
    );
  }

  // External transcript is pending/disabled but Twilio transcript is enabled
  if (twilioStoredTranscript) {
    return (
      <LoadMediaButton type="button" onClick={loadTwilioStoredTranscript}>
        <LoadMediaButtonText>
          <Template code="ContactDetails-LoadTranscript-Button" />
        </LoadMediaButtonText>
      </LoadMediaButton>
    );
  }

  // External is still pending and Twilio transcript is disabled
  if (externalStoredTranscript && !externalStoredTranscript.storeTypeSpecificData?.location) {
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
});

const mapDispatchToProps = {
  loadTranscript,
};

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptSection);
