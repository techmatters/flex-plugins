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

import { injectGlobal } from 'react-emotion';

import { WIDGET_EXPANDED_CLASS } from './widget-expanded-listener';

export function makeMobileFullScreen() {
  return injectGlobal`
    /* 
      This media query matches phones/tablets,
      regardless the screen size or orientation mode.
    */
    @media screen and (pointer: coarse) and (hover: none) {
      .Twilio .Twilio-MainContainer {
        top: 0;
        left: 0;
        min-height: 100%;
        min-width: 100%;
      }

      /* Hides the floating button when expanded */
      button.${WIDGET_EXPANDED_CLASS} {
        display: none;
      }

      /*
        On mobile, after clicking on the send button, it keeps the button
        in :hover state, which turns the button grey. Since we could not get
        rid of :hover state programatically, we're overriding :hover color
        to #1976D2, to get rid of the grey misleading color
      */
      button.Twilio-MessageInput-SendButton:hover {
        background: #1976D2;
      }
    }
  `;
}
