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
import { act, fireEvent, render, screen } from '@testing-library/react';

import ContactInProgressBanners from '../../../components/contact/ContactInProgressBanners';
import { checkTaskAssignment, getTaskAndReservations } from '../../../services/twilioTaskService';
import { newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction } from '../../../states/contacts/saveContact';

jest.mock('@twilio/flex-ui', () => ({
  Manager: { getInstance: () => ({ workerClient: { attributes: { roles: [] } } }) },
  NotificationType: { warning: 'warning' },
  Notifications: {
    dismissNotificationById: jest.fn(),
    registerNotification: jest.fn(),
    showNotification: jest.fn(),
  },
  Template: ({ code }) => code,
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: selector => selector({}),
}));

jest.mock('../../../design-system/modals/ConfirmDialog', () => {
  return {
    ConfirmDialog: ({ openDialog, dialogHeader, actionComponent }) =>
      openDialog
        ? mockReact.createElement('div', null, mockReact.createElement('span', null, dialogHeader), actionComponent)
        : null,
  };
});

jest.mock('../../../services/twilioTaskService', () => ({
  checkTaskAssignment: jest.fn(),
  getTaskAndReservations: jest.fn(),
}));

jest.mock('../../../states/asyncDispatch', () => jest.fn(() => jest.fn()));

jest.mock('../../../states/contacts/saveContact', () => ({
  CompleteTaskError: class CompleteTaskError extends Error {},
  newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction: jest.fn(),
}));

jest.mock('../../../states/contacts/selectContactStateByContactId', () =>
  jest.fn(() => ({
    savedContact: {
      id: 'contact-1',
      finalizedAt: null,
      taskId: 'task-1',
      rawJson: {},
      conversationMedia: [],
    },
  })),
);

jest.mock('../../../permissions/canEditInProgressContact', () => jest.fn(() => () => true));
jest.mock('../../../components/caseMergingBanners/InfoIcon', () => () => null);

jest.mock('../../../styles', () => {
  const element = tag => ({ children, onClick }) => mockReact.createElement(tag, onClick ? { onClick } : {}, children);
  return {
    BannerAction: element('div'),
    BannerContainer: element('div'),
    BannerText: element('span'),
    DestructiveButton: element('button'),
    Flex: element('div'),
    HeaderCloseButton: element('button'),
    HiddenText: element('span'),
    PrimaryButton: element('button'),
  };
});

const mockReact = React;
const mockedCheckTaskAssignment = checkTaskAssignment as jest.Mock;
const mockedGetTaskAndReservations = getTaskAndReservations as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCheckTaskAssignment.mockResolvedValue({ isAssigned: false });
});

const clickSaveAndEnd = () => {
  render(<ContactInProgressBanners contactId="contact-1" />);
  fireEvent.click(screen.getByText('BottomBar-SaveAndEnd'));
};

test('completed task opens the normal finalization dialog', async () => {
  mockedGetTaskAndReservations.mockResolvedValue({ task: { status: 'completed' } });

  clickSaveAndEnd();

  expect(await screen.findByText('Contact-ConfirmFinalizeContactDialog-Header')).toBeTruthy();
  expect(screen.queryByText('Contact-ConfirmRemoveTaskDialog-Header')).toBeNull();

  await act(async () => {
    fireEvent.click(screen.getByText('Contact-ConfirmFinalizeContactDialog-ConfirmButton'));
  });
  expect(newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'contact-1' }),
    false,
  );
});

test('unassigned task opens the removal dialog', async () => {
  mockedGetTaskAndReservations.mockResolvedValue({ task: { status: 'reserved' } });

  clickSaveAndEnd();

  expect(await screen.findByText('Contact-ConfirmRemoveTaskDialog-Header')).toBeTruthy();
  expect(screen.queryByText('Contact-ConfirmFinalizeContactDialog-Header')).toBeNull();
});
