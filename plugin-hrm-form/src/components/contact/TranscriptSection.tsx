import { Template, MessageListItem, MessageList } from '@twilio/flex-ui';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { format } from 'date-fns';

import { contactFormsBase, namespace, RootState } from '../../states';
import { getFileDownloadUrl } from '../../services/ServerlessService';
import { SectionActionButton } from '../../styles/search';
import { loadTranscript } from '../../states/contacts/existingContacts';

type OwnProps = {
  contactId: string;
  transcriptUrl: string;
};
// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const TranscriptSection: React.FC<Props> = ({ contactId, transcriptUrl, transcript, loadTranscript }) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <CircularProgress size={50} />;
  }

  if (!transcript) {
    const fetchAndLoadTranscript = async () => {
      try {
        setLoading(true);
        const [, fileNameAtAws] = transcriptUrl.split('s3.amazonaws.com/');
        const transcriptPreSignedUrl = await getFileDownloadUrl(fileNameAtAws, '');
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
    <div className="Twilio-MessageList">
      {transcript.messages.map(m => {
        return (
          <div className="Twilio-MessageListItem-BubbleContainer" key={m.sid}>
            <div className="Twilio-MessageBubble-default">
              <div className="Twilio-MessageBubble-Header">
                <div className="Twilio-MessageBubble-UserName">{m.from}</div>
                <div className="Twilio-MessageBubble-Time">{format(new Date(m.dateCreated), 'h:mm aaaaa')}m</div>
              </div>
              <div className="Twilio-MessageBubble-Body">{m.body}</div>
              <div className="Twilio-MessageBubble-end" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  transcript: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.transcript,
});

const mapDispatchToProps = {
  loadTranscript,
};

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptSection);
