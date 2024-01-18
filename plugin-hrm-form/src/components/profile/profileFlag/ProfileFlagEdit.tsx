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

import { StyledMenuList, StyledMenuItem } from '../../../styles';
import { ProfileFlag } from '../../../types/types';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import { useProfileFlags } from '../../../states/profile/hooks';
import { RootState } from '../../../states';
import { ProfileFlagEditList } from '../styles';
import ProfileFlagList from './ProfileFlagList';
import { ProfileCommonProps } from '../types';
import useProfileCustomBlock from '../../../states/configuration/hooks/useProfileCustomBlock';

type OwnProps = ProfileCommonProps & {
  modalRef?: React.RefObject<HTMLDivElement>;
};

type Props = OwnProps;

const computeHours = (timeFrame: string): number => {
  const [value, unit] = timeFrame.split(' ');

  switch (unit) {
    case 'hour':
    case 'hours':
      return Number(value);
    case 'day':
    case 'days':
      return Number(value) * 24;
    case 'month':
    case 'months':
      return Number(value) * 30 * 24; // Approximation, actual number varies by month
    case 'year':
    case 'years':
      return Number(value) * 365 * 24; // Approximation, actual number varies by year
    default:
      return 0;
  }
};

const ProfileFlagsEdit: React.FC<Props> = (props: Props) => {
  const { modalRef, profileId } = props;

  const { allProfileFlags, filteredProfileFlags, associateProfileFlag } = useProfileFlags(profileId);
  const loading = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId))?.loading;

  const customBlock = useProfileCustomBlock();
  const anchorRef = useRef(null);

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
        <Paper>
          <StyledMenuList
            id="associate-status-menu"
            aria-labelledby="associate-status-button"
            onKeyDown={handleListKeyDown}
          >
            {availableFlags
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((flag: ProfileFlag, index: number) => {
                if (flag.name === 'blocked') {
                  return customBlock.map((block, blockIndex) => {
                    const validUntil = new Date(
                      Date.now() + computeHours(block.timeFrame) * 60 * 60 * 1000,
                    ).toISOString();
                    const validatedTime = parseISO(validUntil);
                    return (
                      <StyledMenuItem
                        key={`${flag.id}-${block.type}`}
                        onClick={() => shouldAllowAssociate && associateProfileFlag(flag.id, validatedTime)}
                        ref={index && blockIndex ? null : associateRef}
                      >
                        {block.type}
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
        </Paper>
      </Popper>
    </>
  );
};

export default ProfileFlagsEdit;
