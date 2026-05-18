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
import { useDispatch, useSelector } from 'react-redux';

import { AppState } from '../../store/store';
import { EngagementPhase } from '../../store/definitions';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => null),
  useSelector: jest.fn(),
}));
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;

const fileAttachmentConfig = {
  enabled: true,
  maxFileSize: 16777216,
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'amr', 'mp3', 'mp4', 'pdf'],
};
export const BASE_MOCK_REDUX: AppState = {
  chat: {
    conversation: undefined,
    conversationsClient: {},
    messages: [],
    participants: [],
    users: [],
  },
  config: {
    helplineCode: 'ut',
    aseloBackendUrl: 'http://mock-unit-test.backend',
    fileAttachment: fileAttachmentConfig,
    defaultLocale: 'ut-UT',
    translations: {
      'ut-UT': {},
    },
  },
  notifications: {},
  task: {
    tasksSids: [],
  },
  session: {
    expanded: false,
    currentPhase: EngagementPhase.Loading,
    preEngagementData: {},
  },
};

let currentMockRedux = BASE_MOCK_REDUX;

export const resetMockRedux = (reduxPatch: Partial<AppState> = {}) => {
  currentMockRedux = { ...BASE_MOCK_REDUX, ...reduxPatch };
  mockUseSelector.mockImplementation(cb => cb(currentMockRedux));
  const mockDispatch = jest.fn();
  mockUseDispatch.mockReturnValue(mockDispatch);
  return { mockDispatch, mockUseSelector };
};
