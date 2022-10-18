import { Template } from '@twilio/flex-ui';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';

import { contactFormsBase, namespace, RootState } from '../../states';
import { getFileDownloadUrl } from '../../services/ServerlessService';
import { SectionActionButton } from '../../styles/search';

type OwnProps = {
  contactId: string;
  transcriptUrl: string;
};
// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const TranscriptSection: React.FC<Props> = ({ contactId, transcriptUrl, transcript }) => {
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
        console.log('>>>>>>>>>>>>>>', transcriptParsed);
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

  return <div>TranscriptSection</div>;
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  transcript: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.transcript,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptSection);
