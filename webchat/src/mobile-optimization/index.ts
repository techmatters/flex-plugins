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

/**
 * This module optimizes the widget for mobile devices.
 *
 * Notice that some of the optimization may override the default webpage HTML/CSS. If that
 * is not desired, you can disable it by setting 'disable-mobile-optimization' attribute:
 * <script disable-mobile-optimization src='path/to/aselo.js'></script>
 */
import * as FlexWebChat from '@twilio/flex-webchat-ui';

import { makeMobileFullScreen } from './full-screen';
import { addWidgetExpandedListener } from './widget-expanded-listener';
import { updateViewport } from './viewport';

function shouldDisableMobileOptimization() {
  const disableMobileOptimizationAttribute = document.currentScript?.getAttribute('disable-mobile-optimization');
  return ['', true, 'true'].some((value) => value === disableMobileOptimizationAttribute);
}

export function applyMobileOptimization(manager: FlexWebChat.Manager) {
  if (shouldDisableMobileOptimization()) {
    return;
  }

  makeMobileFullScreen();
  addWidgetExpandedListener(manager);
  updateViewport();
}
