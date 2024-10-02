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

import { checkTaskAssignment, completeTaskAssignment } from '../../services/ServerlessService';
import InfoIcon from '../caseMergingBanners/InfoIcon';
import {
  HeaderCloseButton,
  SaveAndEndButton,
  HiddenText,
  Flex,
  BannerContainer,
  BannerAction,
  BannerText,
} from '../../styles';
import { Contact, RouterTask } from '../../types/types';
import getCanEditInProgressContact from '../../permissions/canEditInProgressContact';
import { newFinalizeContactAsyncAction } from '../../states/contacts/saveContact';

type DraftAndResolvedContactBannersProps = {
  savedContact: Contact;
  task: RouterTask;
};

const DraftAndResolvedContactBanners: React.FC<DraftAndResolvedContactBannersProps> = ({ savedContact, task }) => {
  const [showResolvedBanner, setShowResolvedBanner] = useState(false);

  const dispatch = useDispatch();

  const saveFinalizedContact = (task: RouterTask, contact: Contact) => {
    dispatch(newFinalizeContactAsyncAction(task, contact));
  };

  const isDraft = !savedContact.finalizedAt;

  const workerRoles = Manager.getInstance().workerClient.attributes.roles;

  const canEditContact = useMemo(() => getCanEditInProgressContact(savedContact, workerRoles), [
    savedContact,
    workerRoles,
  ]);

  const handleSaveAndEnd = async () => {
    const status = await checkTaskAssignment(savedContact.taskId);

    const updatedContact = {
      ...savedContact,
      rawJson: {
        ...savedContact.rawJson,
        callType: 'Uncategorized',
      },
    };

    if (status) {
      // dialog box to confirm if the user wants to save and end the contact

      await completeTaskAssignment(savedContact.taskId);
    }

    await saveFinalizedContact(task, updatedContact);
    setShowResolvedBanner(true);
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
            {canEditContact() && (
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
    </>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default DraftAndResolvedContactBanners;
