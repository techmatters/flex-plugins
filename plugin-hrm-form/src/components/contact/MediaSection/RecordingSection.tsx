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

import { LoadMediaButton, LoadMediaButtonText } from './styles';
import { S3StoredRecording } from '../../../types/types';

type OwnProps = {
  loadConversationIntoOverlay: () => Promise<void>;
};

const RecordingSection: React.FC<OwnProps> = ({ loadConversationIntoOverlay }) => {
  const [loading, setLoading] = useState(false);

  const fetchAndLoadRecording = async () => {
    setLoading(true);

    await loadConversationIntoOverlay();

    setLoading(false);
  };

  if (loading) {
    return <CircularProgress size={30} />;
  }

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
};

export default RecordingSection;
