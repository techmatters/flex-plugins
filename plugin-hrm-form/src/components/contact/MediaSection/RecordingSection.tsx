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

import { ErrorFont, LoadMediaButton, LoadMediaButtonText } from './styles';
import { S3StoredRecording } from '../../../types/types';
import { generateExternalMediaPath } from '../../../services/ContactService';
import fetchHrmApi from '../../../services/fetchHrmApi';

type OwnProps = { contactId: string; externalStoredRecording: S3StoredRecording };

const RecordingSection: React.FC<OwnProps> = ({ contactId, externalStoredRecording }) => {
  const [voiceRecording, setVoiceRecording] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchAndLoadRecording = async () => {
    try {
      setLoading(true);
      setShowButton(false);

      const mediaType = 'recording';

      const { media_url: recordingPreSignedUrl } = await fetchHrmApi(
        generateExternalMediaPath(
          contactId,
          mediaType,
          externalStoredRecording.location.bucket,
          externalStoredRecording.location.key,
        ),
      );

      setVoiceRecording(recordingPreSignedUrl);

      setLoading(false);
    } catch (error) {
      handleFetchAndLoadException(error);
    }
  };

  const handleFetchAndLoadException = err => {
    console.error(
      `Error loading the recording for contact ${contactId}, recording url ${externalStoredRecording.location.key}`,
      err,
    );
    const errorMessage = 'RecordingSection-Error';

    setErrorMessage(errorMessage);
    setLoading(false);
  };

  if (errorMessage) {
    return (
      <ErrorFont>
        <Template code={errorMessage} />
      </ErrorFont>
    );
  }

  if (loading) {
    return <CircularProgress size={30} />;
  }

  if (showButton) {
    return (
      <LoadMediaButton
        style={{ justifyContent: 'center', paddingTop: '10px', paddingBottom: '10px', whiteSpace: 'nowrap' }}
        type="button"
        onClick={fetchAndLoadRecording}
      >
        <LoadMediaButtonText>
          <Template code="ContactDetails-LoadRecording-Button" />
        </LoadMediaButtonText>
      </LoadMediaButton>
    );
  }

  return (
    <div>
      {voiceRecording ? (
        <audio controls src={voiceRecording} preload="metadata" onError={handleFetchAndLoadException}>
          <track kind="captions" />
        </audio>
      ) : (
        <ErrorFont>
          <Template code={errorMessage} />
        </ErrorFont>
      )}
    </div>
  );
};

export default RecordingSection;
