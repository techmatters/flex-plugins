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

import { S3StoredRecording } from '../../../types/types';
import { getFileDownloadUrl } from '../../../services/ServerlessService';
import { ErrorFont, ItalicFont, LoadMediaButton, LoadMediaButtonText } from './styles';
import CircularProgress from '@material-ui/core/CircularProgress';

type OwnProps = { externalStoredRecording: S3StoredRecording };

const RecordingSection: React.FC<OwnProps> = ({ externalStoredRecording }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const fetchAndLoadRecording = async () => {
    try {
      setLoading(true);
      setShowButton(false);

      const recordingPreSignedUrl = await getFileDownloadUrl(externalStoredRecording.location.key);
      const recordingResponse = await fetch(recordingPreSignedUrl.downloadUrl);
      const recording = await recordingResponse.blob();
      const audio = new Audio(URL.createObjectURL(recording));
      setAudioUrl(audio.src);

      setLoading(false);
    } catch (error) {
      console.log('error:trouble loading the audio file', error);
    }
  };

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
      <audio
        controls
        src={audioUrl}
        preload="auto"
        onError={() => {
          // handle error
          console.log('cant load audio');
        }}
      >
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default RecordingSection;
