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

import { DeepPartial } from 'redux';
import type { Theme } from '@twilio/flex-ui';

const colors = {
  /*
   * base1: '#ffffff',
   * base2: '#f6f6f6',
   * buttonTextColor: '#ffffff',
   * secondaryButtonTextColor: '#192b33',
   * disabledColor: '#d8d8d8',
   * defaultButtonColor: '#192b33',
   * secondaryButtonColor: '#ecedf1',
   * inputBackgroundColor: 'rgba(236, 237, 241, 0.37)',
   * hyperlinkColor: '#1874e1',
   * hyperlinkHoverBackgroundColor: 'rgba(24, 116, 225, 0.08)',
   * defaultCategoryColor: '#9b9b9b',
   * categoryTextColor: '#192b33',
   * categoryDisabledColor: '#a0a8bd',
   * selectedItemBorderColor: '#56a6f6',
   */
  acceptColor: '#07874a',
  acceptTextColor: '#ffffff',
  agentAvailableColor: '#62c158',
  agentBusyColor: '#f1a33e',
  agentOfflineColor: '#606471',
  agentUnavailableColor: '#dd392b',
  base1: '#ffffff',
  base10: '#202125',
  base11: '#000000',
  base2: '#f6f6f6',
  base3: '#D9DCE4',
  base4: '#C6CAD7',
  base5: '#B3B9CA',
  base6: '#A0A8BD',
  base7: '#808697',
  base8: '#606471',
  base9: '#40434B',
  buttonHoverColor: 'rgba(0, 0, 0, 0.2)',
  buttonTextColor: '#ffffff',
  categoryDisabledColor: '#a0a8bd',
  categoryTextColor: '#192b33',
  completeTaskColor: '#1976d2',
  connectingColor: '#ff9800',
  darkTextColor: '#222222',
  declineColor: '#d32f2f',
  declineTextColor: '#ffffff',
  defaultButtonColor: '#192b33',
  defaultCategoryColor: '#9b9b9b',
  disabledColor: '#d8d8d8',
  disconnectedColor: '#c0192d',
  errorColor: '#CB3232',
  errorGlow: 'rgba(234, 16, 16, 0.2)',
  flexBlueColor: '#1976D2',
  focusColor: '#197bdd',
  focusGlow: 'rgba(25, 123, 221, 0.2)',
  holdColor: '#ea6c00',
  hyperlinkColor: '#1874e1',
  hyperlinkHoverBackgroundColor: 'rgba(24, 116, 225, 0.08)',
  inputBackgroundColor: 'rgba(236, 237, 241, 0.37)',
  lightTextColor: '#ffffff',
  notificationBackgroundColorError: '#feced3',
  notificationBackgroundColorInformation: '#ffffff',
  notificationBackgroundColorSuccess: '#d0f4d1',
  notificationBackgroundColorWarning: '#ffe3b9',
  notificationIconColorError: '#d32f2f',
  notificationIconColorWarning: '#ea6c00',
  secondaryButtonColor: '#ecedf1',
  secondaryButtonTextColor: '#192b33',
  tertiaryButtonColor: 'rgb(246, 246, 246)',
  tertiaryButtonTextColor: '#192b33',
  selectedItemBorderColor: '#56a6f6',
  tabSelectedColor: '#009cff',
  userAvailableColor: '#31aa71',
  userUnavailableColor: '#999999',
};

type ThemeOverrides = DeepPartial<Omit<Theme, 'tokens' | 'isLight'>>;

// eslint-disable-next-line import/no-unused-modules
export const overrides: ThemeOverrides = {
  MainHeader: {
    Container: {
      background: colors.base2,
      borderColor: colors.base2,
    },
    Button: {
      color: colors.lightTextColor,
      lightHover: true,
    },
  },
  SideNav: {
    Container: {
      background: colors.base2,
      borderColor: colors.base2,
    },
    Button: {
      background: colors.base2,
    },
  },
  TaskList: {
    Filter: {
      Container: {
        background: colors.base2,
        borderColor: colors.base2,
      },
    },
    Item: {
      Container: {
        borderColor: colors.base2,
        background: colors.base2,
      },
      SelectedContainer: {
        background: colors.base1,
        border: `2px solid ${colors.selectedItemBorderColor}`,
      },
    },
  },
  AgentDesktopView: {
    ContentSplitter: {
      background: colors.base1,
      borderColor: colors.base1,
    },
  },
  CRMContainer: {
    Container: {
      borderColor: colors.base2,
    },
  },
};

const HrmTheme = {
  baseName: 'HrmTheme',
  colors,
  overrides,
};

export default HrmTheme;
