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

export const applyWidgetBranding = (backgroundColor: string, color: string) => {
  return injectGlobal`
    .Twilio .Twilio-MainContainer {
        width: 350px;
      }
    .Twilio .Twilio-EntryPoint {
      background-image: linear-gradient(to top, ${backgroundColor}, ${backgroundColor});
      color: ${color};
     }
    .Twilio-DynamicForm button {
      background-image: linear-gradient(to top, ${backgroundColor}, ${backgroundColor}) !important;
      color: ${color} !important;
    }
   .Twilio-MessageInput-SendButton {
    background: ${backgroundColor} !important;
    color: ${color} !important;
    }
  `;
};
