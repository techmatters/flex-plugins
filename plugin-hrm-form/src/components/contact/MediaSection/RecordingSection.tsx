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

import { S3StoredRecording } from '../../../types/types';
import { getFileDownloadUrl } from '../../../services/ServerlessService';

type OwnProps = { externalStoredRecording: S3StoredRecording };

const RecordingSection: React.FC<OwnProps> = ({ externalStoredRecording }) => {
  const [audioUrl, setAudioUrl] = useState(null);

  const fetchAndLoadRecording = async () => {
    try {
      const recordingPreSignedUrl = await getFileDownloadUrl(externalStoredRecording.location.key);
      const recordingResponse = await fetch(recordingPreSignedUrl.downloadUrl);
      const recording = await recordingResponse.blob();
      const audio = new Audio(URL.createObjectURL(recording));

      setAudioUrl(audio.src);
    } catch (error) {
      console.log('error:trouble loading the audio file', error);
    }
  };
  return (
    <div>
      <button onClick={fetchAndLoadRecording} type="button">
        Load Recording
      </button>
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
