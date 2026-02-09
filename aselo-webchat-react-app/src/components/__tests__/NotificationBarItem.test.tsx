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

import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { resetMockRedux } from '../../__mocks__/redux/mockRedux';
import { NotificationBarItem } from '../NotificationBarItem';
import * as genericActions from '../../store/actions/genericActions';
import { Notification } from '../../store/definitions';

describe('Notification Bar Item', () => {
  const notification: Notification = {
    message: 'Test notification',
    id: 'TestNotification',
    type: 'neutral',
    dismissible: false,
  };

  const dismissButtonTitle = 'Dismiss alert';

  beforeEach(() => {
    jest.resetAllMocks();
    resetMockRedux();
  });

  it('renders a notification bar item', () => {
    const { container } = render(<NotificationBarItem {...notification} />);

    expect(container).toBeInTheDocument();
  });

  it('renders the provided message', () => {
    const { queryByText } = render(<NotificationBarItem {...notification} />);

    expect(queryByText('Test notification')).toBeInTheDocument();
  });

  it('renders a dismiss button if dismissible is true', () => {
    const { queryByText } = render(<NotificationBarItem {...notification} dismissible={true} />);

    expect(queryByText(dismissButtonTitle)).toBeInTheDocument();
  });

  it('does not render a dismiss button if dismissible is false', () => {
    const { queryByText } = render(<NotificationBarItem {...notification} />);

    expect(queryByText(dismissButtonTitle)).not.toBeInTheDocument();
  });

  it('dismisses notification when dismiss button is clicked', () => {
    const removeNotificationSpy = jest.spyOn(genericActions, 'removeNotification');
    const { getByText } = render(<NotificationBarItem {...notification} dismissible={true} />);

    const dismissButton = getByText(dismissButtonTitle);
    fireEvent.click(dismissButton);

    expect(removeNotificationSpy).toHaveBeenCalledWith(notification.id);
  });

  it('runs onDismiss function prop when dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(<NotificationBarItem {...notification} dismissible={true} onDismiss={onDismiss} />);

    const dismissButton = getByText(dismissButtonTitle);
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('dismisses notification only when timeout is finished if set', () => {
    const removeNotificationSpy = jest.spyOn(genericActions, 'removeNotification');

    jest.useFakeTimers('legacy');
    const onDismiss = jest.fn();
    render(<NotificationBarItem {...notification} timeout={1000} onDismiss={onDismiss} />);

    expect(removeNotificationSpy).not.toHaveBeenCalledWith(notification.id);
    jest.runAllTimers();

    expect(removeNotificationSpy).toHaveBeenCalledWith(notification.id);
    expect(onDismiss).toHaveBeenCalled();
  });
});
