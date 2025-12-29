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

import React, { useMemo, useState, useEffect } from 'react';
import { Close } from '@material-ui/icons';
import { Template, Manager, Notifications, NotificationType } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import InfoIcon from '../caseMergingBanners/InfoIcon';
import {
  BannerAction,
  BannerContainer,
  BannerText,
  Flex,
  HeaderCloseButton,
  HiddenText,
  DestructiveButton,
  PrimaryButton,
} from '../../styles';
import getCanEditInProgressContact from '../../permissions/canEditInProgressContact';
import {
  CompleteTaskError,
  newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction,
} from '../../states/contacts/saveContact';
import { RootState } from '../../states';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { checkTaskAssignment } from '../../services/twilioTaskService';
import { isOfflineContact } from '../../types/types';
import { ConfirmDialog } from '../../design-system/modals/ConfirmDialog';
import asyncDispatch from '../../states/asyncDispatch';

type ContactBannersProps = {
  contactId: string;
};

const ContactInProgressBanners: React.FC<ContactBannersProps> = ({ contactId }) => {
  const savedContact = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.savedContact);
  const finalizeError = useSelector(
    (state: RootState) => selectContactStateByContactId(state, contactId)?.metadata?.finalizeStatus?.error,
  );
  const [showResolvedBanner, setShowResolvedBanner] = useState(false);
  const [isFinalizeContactDialogOpen, setIsFinalizeContactDialogOpen] = useState(false);
  const [isRemoveTaskDialogOpen, setIsRemoveTaskDialogOpen] = useState(false);
  const [finalizeRequested, setFinalizeRequested] = useState(false);
  const asyncDispatcher = asyncDispatch(useDispatch());
  const workerRoles = Manager.getInstance().workerClient.attributes.roles;
  const isDraftContact = savedContact.finalizedAt;

  const canEditContact = useMemo(() => getCanEditInProgressContact(savedContact, workerRoles), [
    savedContact,
    workerRoles,
  ]);

  useEffect(() => {
    if (finalizeRequested && savedContact.finalizedAt) {
      setShowResolvedBanner(true);

      if (!isOfflineContact(savedContact) && savedContact.conversationMedia.length === 0) {
        try {
          Notifications.registerNotification({
            id: 'NoConversationMediaNotification',
            closeButton: true,
            content: <Template code="ContactDetails-NoConversationMediaNotification" />,
            type: NotificationType.warning,
            timeout: 15000,
          });
          Notifications.showNotification('NoConversationMediaNotification');
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
    }
    // Show the dialog offering to remove the task if completing it failed in the first attempt
    // Currently, other errors don't do anything
    if (finalizeRequested && finalizeError instanceof CompleteTaskError) {
      setIsRemoveTaskDialogOpen(true);
    }

    // Clean up notification if it exists
    return () => {
      Notifications.dismissNotificationById('NoConversationMediaNotification');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalizeRequested, finalizeError, isDraftContact]);

  /**
   * Dispatches the action to try to complete the task (if it's not an offline contact and the task still exists) and finalize the contact
   * @param removeTask - will try to cancel the task rather than complete it, and failing that, remove it. Used when attempting to complete has already failed
   */
  const updateTaskAndFinalizeContact = async (removeTask = false) => {
    const updatedContact = {
      ...savedContact,
      rawJson: {
        callType: 'Uncategorized',
        ...savedContact.rawJson,
      },
    };
    try {
      await asyncDispatcher(newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction(updatedContact, removeTask));
      setFinalizeRequested(true);
    } catch (error) {
      console.error('Failed to save and finalize contact:', error);
    }
  };

  const handleSaveAndEnd = async () => {
    const { isAssigned } = await checkTaskAssignment(savedContact.taskId);

    if (isAssigned === true) {
      setIsFinalizeContactDialogOpen(true);
    } else {
      await updateTaskAndFinalizeContact();
    }
  };

  const handleFinalizeContactConfirm = async () => {
    await updateTaskAndFinalizeContact();
    setIsFinalizeContactDialogOpen(false);
  };

  const handleRemoveTaskConfirm = async () => {
    await updateTaskAndFinalizeContact(true);
    setIsRemoveTaskDialogOpen(false);
  };

  const handleCancel = () => {
    setIsFinalizeContactDialogOpen(false);
    setIsRemoveTaskDialogOpen(false);
  };

  return (
    <>
      {!isDraftContact && (
        <BannerContainer color="yellow">
          <Flex width="100%" alignItems="center">
            <InfoIcon color="#fed44b" />
            <BannerText>
              <Template code="Contact-DraftStatus" />
            </BannerText>
            {canEditContact() && (
              <BannerAction alignRight={true} onClick={handleSaveAndEnd}>
                <DestructiveButton>
                  <Template code="BottomBar-SaveAndEnd" />
                </DestructiveButton>
              </BannerAction>
            )}
          </Flex>
        </BannerContainer>
      )}
      {showResolvedBanner && (
        <BannerContainer color="blue" style={{ padding: '12px 0', margin: '10px 0' }}>
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <InfoIcon color="#001489" />
            <BannerText>
              <Template code="Contact-ResolvedStatus" />
            </BannerText>
            <BannerAction onClick={() => setShowResolvedBanner(false)} alignRight={true} color="black">
              <HeaderCloseButton />
              <HiddenText>
                <Template code="CloseButton" />
              </HiddenText>
              <Close fontSize="small" />
            </BannerAction>
          </Flex>
        </BannerContainer>
      )}
      <ConfirmDialog
        openDialog={isFinalizeContactDialogOpen}
        actionComponent={
          <PrimaryButton onClick={handleFinalizeContactConfirm}>
            <Template code="Contact-ConfirmFinalizeContactDialog-ConfirmButton" />
          </PrimaryButton>
        }
        closeDialogHeader="Contact-ConfirmFinalizeContactDialog-Header"
        closeDialogContent="Contact-ConfirmFinalizeContactDialog-Content"
        onCloseDialog={handleCancel}
      />
      <ConfirmDialog
        openDialog={isRemoveTaskDialogOpen}
        actionComponent={
          <DestructiveButton onClick={handleRemoveTaskConfirm}>
            <Template code="Contact-ConfirmRemoveTaskDialog-ConfirmButton" />
          </DestructiveButton>
        }
        closeDialogHeader="Contact-ConfirmRemoveTaskDialog-Header"
        closeDialogContent="Contact-ConfirmRemoveTaskDialog-Content"
        onCloseDialog={handleCancel}
      />
    </>
  );
};

export default ContactInProgressBanners;
