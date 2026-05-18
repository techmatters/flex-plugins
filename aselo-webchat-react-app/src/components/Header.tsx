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

import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core/text';
import { ChevronDownIcon } from '@twilio-paste/icons/cjs/ChevronDownIcon';
import { useDispatch } from 'react-redux';

import { containerStyles, minimizeButtonStyles, titleStyles } from './styles/Header.styles';
import LocalizedTemplate from '../localization/LocalizedTemplate';
import { useMobileOptimizations } from '../hooks/useMobileOptimizations';
import { changeExpandedStatus } from '../store/actions/genericActions';

export const Header = ({ customTitle }: { customTitle?: string }) => {
  const dispatch = useDispatch();
  const { isMobileFullscreen } = useMobileOptimizations();

  return (
    <Box as="header" {...containerStyles}>
      <Text as="h2" {...titleStyles}>
        <LocalizedTemplate code={customTitle || 'Header-TitleBar-Title'} />
      </Text>
      {isMobileFullscreen && (
        <Box
          as="button"
          {...minimizeButtonStyles}
          onClick={() => dispatch(changeExpandedStatus({ expanded: false }))}
          data-testid="header-minimize-button"
        >
          <ChevronDownIcon decorative={false} title="Minimize chat" size="sizeIcon60" />
        </Box>
      )}
    </Box>
  );
};
