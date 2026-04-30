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
import { OperatingHoursPhase } from './OperatingHoursPhase';
import {
  innerContainerStyles,
  mobileInnerContainerStyles,
  mobileOuterContainerStyles,
  outerContainerStyles,
} from './styles/RootContainer.styles';
import { EntryPoint } from './EntryPoint';
import { useMobileOptimizations } from '../hooks/useMobileOptimizations';

const getPhaseComponent = (phase: EngagementPhase) => {
  switch (phase) {
    case EngagementPhase.Loading:
      return <LoadingPhase />;
    case EngagementPhase.MessagingCanvas:
      return <MessagingCanvasPhase />;
    case EngagementPhase.OperatingHours:
      return <OperatingHoursPhase />;
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
  const alwaysOpen = useSelector((state: AppState) => state.config.alwaysOpen);
  const { isMobileFullscreen } = useMobileOptimizations();

  return (
    <Box style={defaultFont}>
      <Box {...(isMobileFullscreen ? mobileOuterContainerStyles : outerContainerStyles)}>
        {expanded && (
          <Box data-test="root-container" {...(isMobileFullscreen ? mobileInnerContainerStyles : innerContainerStyles)}>
            {getPhaseComponent(currentPhase)}
          </Box>
        )}
        {!alwaysOpen && <EntryPoint />}
      </Box>
    </Box>
  );
}
