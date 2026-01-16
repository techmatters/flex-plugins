/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Box } from '@twilio-paste/core/box';
import { useSelector } from 'react-redux';

import { MessagingCanvasPhase } from './MessagingCanvasPhase';
import { AppState, EngagementPhase } from '../store/definitions';
import { PreEngagementFormPhase } from './PreEngagementFormPhase';
import { LoadingPhase } from './LoadingPhase';
import { innerContainerStyles, outerContainerStyles } from './styles/RootContainer.styles';

const getPhaseComponent = (phase: EngagementPhase) => {
  switch (phase) {
    case EngagementPhase.Loading:
      return <LoadingPhase />;
    case EngagementPhase.MessagingCanvas:
      return <MessagingCanvasPhase />;
    case EngagementPhase.PreEngagementForm:
    default:
      return <PreEngagementFormPhase />;
  }
};

const defaultFont: React.CSSProperties = {
  fontFamily: 'Oxygen, Ubuntu, sans-serif',
};

export function RootContainer() {
  const { currentPhase, expanded } = useSelector(({ session }: AppState) => ({
    currentPhase: session.currentPhase,
    expanded: session.expanded,
  }));

  return (
    <Box style={defaultFont}>
      <Box {...outerContainerStyles}>
        {expanded && (
          <Box data-test="root-container" {...innerContainerStyles}>
            {getPhaseComponent(currentPhase)}
          </Box>
        )}
      </Box>
    </Box>
  );
}
