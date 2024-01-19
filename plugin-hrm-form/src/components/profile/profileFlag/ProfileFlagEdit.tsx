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

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { IconButton } from '@twilio/flex-ui';
import { Box, Popper, Paper } from '@material-ui/core';
import { parseISO } from 'date-fns';

import { StyledMenuList, StyledMenuItem, ProfileFlagEditList, StyledPaper } from '../styles';
import { ProfileFlag } from '../../../types/types';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import { useProfileFlags } from '../../../states/profile/hooks';
import { RootState } from '../../../states';
import ProfileFlagList from './ProfileFlagList';
import { ProfileCommonProps } from '../types';
import useProfileFlagDurations from '../../../states/configuration/hooks/useProfileFlagDurations';

type OwnProps = ProfileCommonProps & {
  modalRef?: React.RefObject<HTMLDivElement>;
};

type Props = OwnProps;

const ProfileFlagsEdit: React.FC<Props> = (props: Props) => {
  const { modalRef, profileId } = props;

  const { allProfileFlags, filteredProfileFlags, associateProfileFlag } = useProfileFlags(profileId);
  const loading = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId))?.loading;

  const customFlagDurations = useProfileFlagDurations();
  const anchorRef = useRef(null);
  console.log('>>> anchorRef', anchorRef);

  const [paperWidth, setPaperWidth] = useState(0);

  useEffect(() => {
    if (anchorRef.current) {
      setPaperWidth(anchorRef.current.offsetWidth);
    }
  }, []);
  /**
   * We need refs to manage focus for accessibility since we're using a Popper
   * a lot of this is based around the example here: https://mui.com/material-ui/react-menu/#StyledMenuList-composition
   */
  const associateButtonRef = useRef(null);
  const associateRef = useRef(null);
  const disassociateRef = useRef(null);
  const [open, setOpen] = useState(true);
  const availableFlags = allProfileFlags?.filter(flag => !filteredProfileFlags.find(f => f.id === flag.id));
  const hasAvailableFlags = Boolean(availableFlags?.length);
  const shouldAllowAssociate = hasAvailableFlags && !loading;

  useEffect(() => {
    setOpen(hasAvailableFlags);
  }, [hasAvailableFlags]);

  useEffect(() => {
    /**
     * If there are flags to disassociate, focus on the disassociate button
     */
    if (filteredProfileFlags?.length) {
      disassociateRef?.current?.focus();
      return;
    }
    associateButtonRef?.current?.focus();
  }, [filteredProfileFlags]);

  const focusOnAssociateRef = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    associateRef?.current?.focus();
  };

  function handleListKeyDown(e: React.KeyboardEvent) {
    const exitListKeys = ['Tab', 'Escape'];
    if (!exitListKeys.includes(e.key)) return;

    e.preventDefault();
    e.stopPropagation();
    associateButtonRef?.current?.focus();
  }

  return (
    <>
      <ProfileFlagEditList title="Edit statuses" ref={anchorRef}>
        <Box display="flex" justifyContent="space-between">
          <ProfileFlagList {...props} enableDisassociate={true} disassociateRef={disassociateRef} />
          <Box alignItems="center">
            <IconButton
              id="associate-status-button"
              icon="ArrowDown"
              title={open ? 'Add status' : 'All statuses are associated'}
              onClick={focusOnAssociateRef}
              disabled={!shouldAllowAssociate}
              aria-controls={open ? 'associate-status-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              ref={associateButtonRef}
            />
          </Box>
        </Box>
      </ProfileFlagEditList>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" ref={modalRef}>
        <StyledPaper paperWidth={paperWidth}>
          <StyledMenuList
            id="associate-status-menu"
            aria-labelledby="associate-status-button"
            onKeyDown={handleListKeyDown}
          >
            {availableFlags
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((flag: ProfileFlag, index: number) => {
                const customDurations = customFlagDurations.filter(customDuration => customDuration.flag === flag.name);
                if (customDurations.length > 0) {
                  return customDurations.map((customDuration, customDurationIndex) => {
                    const validUntil = new Date(
                      Date.now() + Number(customDuration.durationInHours) * 60 * 60 * 1000,
                    ).toISOString();
                    const validatedTime = parseISO(validUntil);
                    return (
                      <StyledMenuItem
                        key={customDuration.durationInHours}
                        onClick={() => shouldAllowAssociate && associateProfileFlag(flag.id, validatedTime)}
                        ref={index && customDurationIndex ? null : associateRef}
                      >
                        {customDuration.label}
                      </StyledMenuItem>
                    );
                  });
                }

                return (
                  <StyledMenuItem
                    key={flag.id}
                    onClick={() => shouldAllowAssociate && associateProfileFlag(flag.id)}
                    ref={index ? null : associateRef}
                  >
                    {flag.name}
                  </StyledMenuItem>
                );
              })}
          </StyledMenuList>
        </StyledPaper>
      </Popper>
    </>
  );
};

export default ProfileFlagsEdit;
