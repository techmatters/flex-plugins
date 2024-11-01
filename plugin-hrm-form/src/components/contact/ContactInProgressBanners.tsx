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

import React, { useMemo, useState } from 'react';
import { Close } from '@material-ui/icons';
import { Template, Manager } from '@twilio/flex-ui';
import { useDispatch } from 'react-redux';

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
import { checkTaskAssignment, completeTaskAssignment } from '../../services/ServerlessService';
import { Contact, RouterTask } from '../../types/types';
import getCanEditInProgressContact from '../../permissions/canEditInProgressContact';
import { newFinalizeContactAsyncAction } from '../../states/contacts/saveContact';
import { getAseloFeatureFlags } from '../../hrmConfig';

type ContactBannersProps = {
  savedContact: Contact;
  task: RouterTask;
};

const ContactInProgressBanners: React.FC<ContactBannersProps> = ({ savedContact, task }) => {
  const [showResolvedBanner, setShowResolvedBanner] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dispatch = useDispatch();
  const workerRoles = Manager.getInstance().workerClient.attributes.roles;
  const isDraft = !savedContact.finalizedAt;

  const enableInProgressContacts = getAseloFeatureFlags().enable_save_in_progress_contacts;

  const saveFinalizedContact = (task: RouterTask, contact: Contact) => {
    dispatch(newFinalizeContactAsyncAction(task, contact));
  };

  const canEditContact = useMemo(() => getCanEditInProgressContact(savedContact, workerRoles), [
    savedContact,
    workerRoles,
  ]);

  const updateAndSaveContact = async () => {
    const updatedContact = {
      ...savedContact,
      rawJson: {
        ...savedContact.rawJson,
        callType: 'Uncategorized',
      },
    };
    await completeTaskAssignment(savedContact.taskId);
    saveFinalizedContact(task, updatedContact);
    setShowResolvedBanner(true);
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
      {isDraft && (
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
        <BannerContainer color="blue" style={{ paddingTop: '12px', paddingBottom: '12px', marginTop: '10px' }}>
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
