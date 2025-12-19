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

type ContactBannersProps = {
  contactId: string;
};

const ContactInProgressBanners: React.FC<ContactBannersProps> = ({ contactId }) => {
  const savedContact = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.savedContact);
  const finalizeError = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.metadata?.finalizeStatus?.error);
  const [showResolvedBanner, setShowResolvedBanner] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [finalizeRequested, setFinalizeRequested] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const dispatch = useDispatch();
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
    if (finalizeRequested && finalizeError instanceof CompleteTaskError) {
      setIsRemoveDialogOpen(true);
    }

    // Clean up notification if it exists
    return () => {
      Notifications.dismissNotificationById('NoConversationMediaNotification');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalizeRequested, isDraftContact]);

  const updateAndSaveContact = async (removeTask = false) => {
    const updatedContact = {
      ...savedContact,
      rawJson: {
        callType: 'Uncategorized',
        ...savedContact.rawJson,
      },
    };
    try {
      await dispatch(newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction(updatedContact, removeTask)).payload;
      setFinalizeRequested(true);
    } catch (error) {
      console.error('Failed to save and finalize contact:', error);
    }
  };

  const handleSaveAndEnd = async () => {
    const { isAssigned } = await checkTaskAssignment(savedContact.taskId);

    if (isAssigned === true) {
      setIsDialogOpen(true);
    } else {
      await updateAndSaveContact();
    }
  };

  const handleConfirm = async () => {
    await updateAndSaveContact();
    setIsDialogOpen(false);
    setIsRemoveDialogOpen(false);
  };

  const handleRemoveTaskConfirm = async () => {
    await updateAndSaveContact(true);
    setIsDialogOpen(false);
    setIsRemoveDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setIsRemoveDialogOpen(false);
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
        openDialog={isDialogOpen}
        actionComponent={<PrimaryButton onClick={handleConfirm} />}
        closeDialogHeader=""
        closeDialogContent="NonDataCallTypeDialog-CloseConfirm"
        onCloseDialog={handleCancel}
      />
      <ConfirmDialog
        openDialog={isRemoveDialogOpen}
        actionComponent={<DestructiveButton onClick={handleRemoveTaskConfirm} />}
        closeDialogHeader=""
        closeDialogContent="An error occured trying to close the task, associated with this task. Do you want to try to cancel / remove it instead? The data for this contents will probably not get stored in the insights reporting system if you do."
        onCloseDialog={handleCancel}
      />
    </>
  );
};

export default ContactInProgressBanners;
