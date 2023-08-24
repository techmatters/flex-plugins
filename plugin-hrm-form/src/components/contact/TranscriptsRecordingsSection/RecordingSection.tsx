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
import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';
import CircularProgress from '@material-ui/core/CircularProgress';

import { SectionTitleContainer, SectionActionButton } from '../../../styles/search';
import { ErrorFont, ItalicFont, LoadTranscriptButton, LoadTranscriptButtonText } from './styles';

type OwnProps = {
  contactId: string;
  loadConversationIntoOverlay: () => Promise<void>;
};

const RecordingSection: React.FC<OwnProps> = ({ contactId, loadConversationIntoOverlay }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(true);

  const recording200 =
    'https://cdn.videvo.net/videvo_files/audio/premium/audio0162/watermarked/SingleFrogCroakCl%20CRT013001_preview.mp3';

  // const recording200 = null;
  const isErrTemporary = (err: Error): boolean => {
    return err.message === 'Failed to fetch';
  };

  const handleLoadException = (err: Error) => {
    console.error(`Error loading the recording overlay for contact ${contactId}`, err);

    const errorMessage = isErrTemporary(err) ? 'RecordingSection-TemporaryError' : 'RecordingSection-PermanentError';
    setErrorMessage(errorMessage);
    setLoading(false);
  };

  const handleLoadRecording = async () => {
    try {
      setLoading(true);
      setShowButton(false);

      // await loadConversationIntoOverlay();
      setLoading(false);
    } catch (err) {
      handleLoadException(err);
    }
  };

  if (loading) {
    return <CircularProgress size={30} />;
  }

  if (recording200 === null) {
    // if (errorMessage ) {
    return (
      <ErrorFont>
        <Template code={errorMessage} />
      </ErrorFont>
    );
  }

  if (showButton) {
    return (
      <>
        <LoadTranscriptButton
          style={{ justifyContent: 'center', paddingTop: '10px', paddingBottom: '10px', whiteSpace: 'nowrap' }}
          type="button"
          onClick={handleLoadRecording}
        >
          <LoadTranscriptButtonText>
            <Template code="ContactDetails-LoadRecording-Button" />
          </LoadTranscriptButtonText>
        </LoadTranscriptButton>
      </>
    );
  }
  return (
    <div>
      <audio controls>
        <track kind="captions" src="data:," />
        <source type="audio/mpeg" src={recording200} />
      </audio>
    </div>
  );
};

export default RecordingSection;
