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
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { SectionTitleContainer, SectionActionButton } from '../../../styles/search';

type OwnProps = { contactId: string; loadConversationIntoOverlay: () => Promise<void> };

const RecordingSection: React.FC<OwnProps> = ({ contactId, loadConversationIntoOverlay }) => {
  console.log('>>> contactId', contactId);
  const recording =
    'https://cdn.videvo.net/videvo_files/audio/premium/audio0162/watermarked/SingleFrogCroakCl%20CRT013001_preview.mp3';
  return (
    <div>
      {/* <SectionTitleContainer style={{ justifyContent: 'right', paddingTop: '10px', paddingBottom: '10px' }}>
        <SectionActionButton type="button" onClick={loadConversationIntoOverlay}>
          <Template code="ContactDetails-LoadRecording-Button" />
        </SectionActionButton>
      </SectionTitleContainer> */}
      <audio controls>
        <track kind="captions" src="data:," />
        <source type="audio/mpeg" src={recording} />
      </audio>
    </div>
  );
};

export default RecordingSection;
