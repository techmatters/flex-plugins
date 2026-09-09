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
// These are styles to emulate the existing styling on the Twilio Task panel, so our custom task panels match their styling
// They should only be rolled into the wider design system if we want to take these Twilio styles and match them in our own design system
// If we replace these with design system styles & components, and then adjust those style, our tab panel styling will diverge from the Twilio provided panels
import { styled } from '@twilio/flex-ui';

export const PanelContainer = styled('div')`
  margin: 8px;
  width: 100%;
`;
PanelContainer.displayName = 'PanelContainer';

export const SectionGroup = styled('div')`
  margin-bottom: 8px;
`;

SectionGroup.displayName = 'SectionGroup';

export const Section = styled('div')`
  margin-bottom: 1rem;
`;
Section.displayName = 'Section';

export const SectionHeader = styled('p')`
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.25rem;
`;
SectionHeader.displayName = 'SectionHeader';
