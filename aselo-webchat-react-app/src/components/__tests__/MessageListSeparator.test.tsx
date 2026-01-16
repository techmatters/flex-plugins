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

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Message } from '@twilio/conversations';

import { MessageListSeparator } from '../MessageListSeparator';

const message = {
  index: 0,
  author: 'author',
  dateCreated: new Date('01/01/2021'),
  body: 'message body',
} as Message;

describe('Message List Separator', () => {
  it('renders the message list separator', () => {
    const { container } = render(<MessageListSeparator message={message} separatorType="date" />);

    expect(container).toBeInTheDocument();
  });

  it('renders a new separator correctly', () => {
    const { queryAllByRole, queryByText } = render(<MessageListSeparator message={message} separatorType="new" />);

    expect(queryAllByRole('separator')).toHaveLength(1);
    expect(queryByText('New')).toBeInTheDocument();
  });

  it("renders a date separator for today's date correctly", () => {
    const today = new Date();
    const { queryAllByRole, queryByText } = render(
      <MessageListSeparator message={{ ...message, dateCreated: today } as Message} separatorType="date" />,
    );

    expect(queryAllByRole('separator')).toHaveLength(1);
    expect(queryByText('Today')).toBeInTheDocument();
  });

  it("renders a date separator for yesturdays's date correctly", () => {
    const yesturday = new Date();
    yesturday.setDate(yesturday.getDate() - 1);

    const { queryAllByRole, queryByText } = render(
      <MessageListSeparator message={{ ...message, dateCreated: yesturday } as Message} separatorType="date" />,
    );

    expect(queryAllByRole('separator')).toHaveLength(1);
    expect(queryByText('Yesterday')).toBeInTheDocument();
  });

  it('renders a date separator for an old date correctly', () => {
    const { queryAllByRole, queryByText } = render(<MessageListSeparator message={message} separatorType="date" />);

    expect(queryAllByRole('separator')).toHaveLength(1);
    expect(queryByText(message.dateCreated.toLocaleDateString())).toBeInTheDocument();
  });
});
