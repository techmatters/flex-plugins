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
import { Template, Manager, Notifications, NotificationType, NotificationBar } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import InfoIcon from '../caseMergingBanners/InfoIcon';
import SaveContactCallTypeDialog from '../callTypeButtons/SaveContactCallTypeDialog';
import {
  BannerAction,
  BannerContainer,
  BannerText,
  Flex,
  HeaderCloseButton,
  HiddenText,
  SaveAndEndButton,
} from '../../styles';
import getCanEditInProgressContact from '../../permissions/canEditInProgressContact';
import { newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction } from '../../states/contacts/saveContact';
import { getAseloFeatureFlags } from '../../hrmConfig';
import { RootState } from '../../states';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { checkTaskAssignment } from '../../services/twilioTaskService';
import { isOfflineContact } from '../../types/types';

type ContactBannersProps = {
  contactId: string;
};

const ContactInProgressBanners: React.FC<ContactBannersProps> = ({ contactId }) => {
  const savedContact = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.savedContact);
  const [showResolvedBanner, setShowResolvedBanner] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [finalizeRequested, setFinalizeRequested] = useState(false);

  const dispatch = useDispatch();
  const workerRoles = Manager.getInstance().workerClient.attributes.roles;
  const isDraftContact = savedContact.finalizedAt;

  const enableInProgressContacts = getAseloFeatureFlags().enable_save_in_progress_contacts;

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

    // Clean up notification if it exists
    return () => {
      Notifications.dismissNotificationById('NoConversationMediaNotification');
    };
  }, [finalizeRequested, isDraftContact]);

  const updateAndSaveContact = async () => {
    const updatedContact = {
      ...savedContact,
      rawJson: {
        callType: 'Uncategorized',
        ...savedContact.rawJson,
      },
    };
    try {
      await dispatch(newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction(updatedContact)).payload;
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
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
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
            {enableInProgressContacts && canEditContact() && (
              <BannerAction alignRight={true} onClick={handleSaveAndEnd}>
                <SaveAndEndButton>
                  <Template code="BottomBar-SaveAndEnd" />
                </SaveAndEndButton>
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
      <SaveContactCallTypeDialog
        isOpen={isDialogOpen}
        isEnabled={true}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </>
  );
};

export default ContactInProgressBanners;
