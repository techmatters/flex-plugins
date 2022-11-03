import { Template } from '@twilio/flex-ui';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import format from 'date-fns/format';

import type { TwilioStoredMedia, S3StoredTranscript } from '../../types/types';
import { contactFormsBase, namespace, RootState } from '../../states';
import { getFileDownloadUrlFromUrl } from '../../services/ServerlessService';
import { loadTranscript, TranscriptMessage } from '../../states/contacts/existingContacts';
import {
  MessageList,
  ItalicFont,
  LoadTranscriptButton,
  LoadTranscriptButtonText,
  DateRulerContainer,
  DateRulerHr,
  DateRulerDateText,
} from './TranscriptSection.styles';
import MessageItem from './MessageItem';

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
    const messagesToRender = transcript.messages.reduce<{
      [dateKey: string]: (TranscriptMessage & { isCounsellor: boolean; isGroupedWithPrevious: boolean })[];
    }>((accum, m, index) => {
      const isCounsellor = m.from.startsWith('gian');
      // const isCounsellor = m.isCounsellor;
      const dateKey = format(new Date(m.dateCreated), 'yyyy/MM/dd');

      if (!accum[dateKey]) {
        return { ...accum, [dateKey]: [{ ...m, isGroupedWithPrevious: false, isCounsellor }] };
      }

      const prevMessage = accum[dateKey][accum[dateKey].length - 1];
      const isGroupedWithPrevious = Boolean(index && prevMessage.from === m.from);

      return { ...accum, [dateKey]: [...accum[dateKey], { ...m, isGroupedWithPrevious, isCounsellor }] };
    }, {});

    const messagesComponents = Object.entries(messagesToRender).flatMap(([dateKey, ms]) => {
      const dateRuler = (
        <DateRulerContainer>
          <DateRulerHr />
          <DateRulerDateText>{dateKey}</DateRulerDateText>
          <DateRulerHr />
        </DateRulerContainer>
      );

      return [
        dateRuler,
        ms.map(m => (
          <MessageItem
            key={m.sid}
            message={m}
            isCounsellor={m.isCounsellor}
            isGroupedWithPrevious={m.isGroupedWithPrevious}
          />
        )),
      ];
    });

    return <MessageList>{messagesComponents}</MessageList>;
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
      <LoadTranscriptButton type="button" onClick={fetchAndLoadTranscript}>
        <LoadTranscriptButtonText>
          <Template code="ContactDetails-LoadTranscript-Button" />
        </LoadTranscriptButtonText>
      </LoadTranscriptButton>
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
      <LoadTranscriptButton type="button" onClick={loadTwilioStoredTranscript}>
        <LoadTranscriptButtonText>
          <Template code="ContactDetails-LoadTranscript-Button" />
        </LoadTranscriptButtonText>
      </LoadTranscriptButton>
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
