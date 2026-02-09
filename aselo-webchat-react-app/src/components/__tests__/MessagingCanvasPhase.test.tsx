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
import { render, waitFor } from '@testing-library/react';

// eslint-disable-next-line import/order
import { BASE_MOCK_REDUX, resetMockRedux } from '../../__mocks__/redux/mockRedux';
import '@testing-library/jest-dom';

import { MessagingCanvasPhase } from '../MessagingCanvasPhase';
import { notifications } from '../../notifications';
import * as genericActions from '../../store/actions/genericActions';

jest.mock('../Header', () => ({
  Header: () => <div title="Header" />,
}));

jest.mock('../NotificationBar', () => ({
  NotificationBar: () => <div title="NotificationBar" />,
}));

jest.mock('../AttachFileDropArea', () => ({
  AttachFileDropArea: (props: any) => <div title="AttachFileDropArea">{props.children}</div>,
}));

jest.mock('../MessageList', () => ({
  MessageList: () => <div title="MessageList" />,
}));

jest.mock('../MessageInput', () => ({
  MessageInput: () => <div title="MessageInput" />,
}));

jest.mock('../ConversationEnded', () => ({
  ConversationEnded: () => <div title="ConversationEnded" />,
}));

const messageMock = {
  setBody: jest.fn(),
  build: jest.fn(),
  send: jest.fn(),
};
const conversationMock = {
  getMessagesCount: jest.fn(),
  prepareMessage: jest.fn(),
};
const TEST_QUERY = 'test query';
const baseReduxState = {
  chat: { conversationState: 'closed', ...BASE_MOCK_REDUX.chat },
  session: { token: 'token', ...BASE_MOCK_REDUX.session },
  task: { tasksSids: ['tasksSids'], ...BASE_MOCK_REDUX.task },
};

describe('Messaging Canvas Phase', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetMockRedux(baseReduxState);
    conversationMock.getMessagesCount.mockResolvedValue(0);
    conversationMock.prepareMessage.mockReturnValue(messageMock);
    messageMock.setBody.mockReturnValue(messageMock);
    messageMock.build.mockReturnValue(messageMock);
    messageMock.send.mockReturnValue(messageMock);
  });

  it('renders the messaging canvas phase', () => {
    const { container } = render(<MessagingCanvasPhase />);

    expect(container).toBeInTheDocument();
  });

  it("dismisses any 'failedToInitSessionNotification'", () => {
    const removeNotificationSpy = jest.spyOn(genericActions, 'removeNotification');

    render(<MessagingCanvasPhase />);

    expect(removeNotificationSpy).toHaveBeenCalledWith(notifications.failedToInitSessionNotification('').id);
  });

  it('renders the header', () => {
    const { queryByTitle } = render(<MessagingCanvasPhase />);

    expect(queryByTitle('Header')).toBeInTheDocument();
  });

  it('renders the notification bar', () => {
    const { queryByTitle } = render(<MessagingCanvasPhase />);

    expect(queryByTitle('NotificationBar')).toBeInTheDocument();
  });

  it('renders the message list', () => {
    const { queryByTitle } = render(<MessagingCanvasPhase />);

    expect(queryByTitle('MessageList')).toBeInTheDocument();
  });

  it('renders message input (and file drop area wrapper) when conversation state is active', () => {
    resetMockRedux({ ...baseReduxState, chat: { conversationState: 'active', ...baseReduxState } });

    const { queryByTitle } = render(<MessagingCanvasPhase />);

    expect(queryByTitle('AttachFileDropArea')).toBeInTheDocument();
    expect(queryByTitle('MessageInput')).toBeInTheDocument();
    expect(queryByTitle('ConversationEnded')).not.toBeInTheDocument();
  });

  it('renders conversation ended when conversation state is closed', () => {
    const { queryByTitle } = render(<MessagingCanvasPhase />);

    expect(queryByTitle('ConversationEnded')).toBeInTheDocument();
    expect(queryByTitle('MessageInput')).not.toBeInTheDocument();
  });

  it("User's query is auto populated when conversation is empty", async () => {
    resetMockRedux({
      ...baseReduxState,
      chat: { ...baseReduxState.chat, conversation: conversationMock },
      session: { ...baseReduxState.session, preEngagementData: { query: TEST_QUERY, email: '', name: '' } },
    });

    await waitFor(() => render(<MessagingCanvasPhase />));

    expect(conversationMock.prepareMessage).toHaveBeenCalled();
    expect(conversationMock.prepareMessage().setBody).toHaveBeenCalledWith(TEST_QUERY);
    expect(conversationMock.prepareMessage().setBody().build).toHaveBeenCalled();
    expect(conversationMock.prepareMessage().setBody().build().send).toHaveBeenCalled();
  });

  it('Should not trigger conversation if messages exists', async () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    resetMockRedux({
      ...baseReduxState,
      chat: { ...baseReduxState.chat, conversationState: 'closed', conversation: conversationMock },
      session: { ...baseReduxState.session, preEngagementData: { query: TEST_QUERY, email: '', name: '' } },
    });
    conversationMock.getMessagesCount.mockResolvedValue(1);
    await waitFor(() => render(<MessagingCanvasPhase />));

    expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
  });

  it("Should not trigger conversation if user's query is empty", async () => {
    resetMockRedux({
      ...baseReduxState,
      chat: { conversation: conversationMock, ...baseReduxState.chat },
    });
    conversationMock.getMessagesCount.mockResolvedValue(1);
    await waitFor(() => render(<MessagingCanvasPhase />));

    expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
  });

  it('Should not trigger conversation if conversation is not initialised', async () => {
    resetMockRedux({
      ...baseReduxState,
      session: { ...baseReduxState.session, preEngagementData: { query: TEST_QUERY, email: '', name: '' } },
    });
    conversationMock.getMessagesCount.mockResolvedValue(1);
    await waitFor(() => render(<MessagingCanvasPhase />));

    expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
  });

  it("Should not trigger conversation if user's query is empty and conversation is also missing", async () => {
    conversationMock.getMessagesCount.mockResolvedValue(1);
    await waitFor(() => render(<MessagingCanvasPhase />));

    expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
  });
});
