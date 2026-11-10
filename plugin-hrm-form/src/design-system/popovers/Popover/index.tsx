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

import React, { useEffect, useRef } from 'react';
import { Template } from '@twilio/flex-ui';
import Close from '@material-ui/icons/Close';
import Popper, { PopperPlacementType } from '@material-ui/core/Popper';
import type PopperJs from 'popper.js';

import { HeaderCloseButton } from '../../../styles/buttons';
import { HiddenText } from '../../../styles';
import { textColor, Variant } from '../../variants';
import { PopoverContainer, PopoverContent, PopoverHeader, PopoverTitle } from './styles';

type Props = {
  open: boolean;
  anchorElement: HTMLElement | null;
  title: string;
  onClose: () => void;
  variant?: Variant;
  placement?: PopperPlacementType;
  // Gap between the anchor and the popover, in pixels
  distanceFromAnchor?: number;
};

/**
 * A titled, dismissible popover, rendered in a portal and positioned against an anchor element.
 * Popper only repositions on window resize and scroll events, so the popover is also repositioned whenever the
 * anchor's container changes size (e.g. when Flex re-lays out its panels, or a panel splitter is dragged).
 */
export const Popover: React.FC<Props> = ({
  open,
  anchorElement,
  title,
  onClose,
  variant = 'default',
  placement = 'bottom',
  distanceFromAnchor = 0,
  children,
}) => {
  const popperRef = useRef<PopperJs | null>(null);

  useEffect(() => {
    const anchorContainer = anchorElement?.parentElement;
    if (!anchorContainer) return undefined;

    const resizeObserver = new ResizeObserver(() => popperRef.current?.update());
    resizeObserver.observe(anchorContainer);
    return () => resizeObserver.disconnect();
  }, [anchorElement]);

  return (
    <Popper
      open={open && Boolean(anchorElement)}
      anchorEl={anchorElement}
      popperRef={popperRef}
      placement={placement}
      modifiers={{ offset: { offset: `0, ${distanceFromAnchor}` } }}
      style={{ zIndex: 10 }}
    >
      <PopoverContainer variant={variant} aria-label={title}>
        <PopoverHeader>
          <PopoverTitle>
            <Template code={title} />
          </PopoverTitle>
          <HeaderCloseButton onClick={onClose} data-testid="Popover-CloseButton">
            <HiddenText>
              <Template code="CloseButton" />
            </HiddenText>
            <Close style={{ fontSize: 20, color: textColor }} />
          </HeaderCloseButton>
        </PopoverHeader>
        <PopoverContent variant={variant}>{children}</PopoverContent>
      </PopoverContainer>
    </Popper>
  );
};

Popover.displayName = 'Popover';
