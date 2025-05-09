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

import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import type { Manager } from '@twilio/flex-webchat-ui';
import PubSub from 'pubsub-js';

import { safeParseHtml } from '../safe-html-parser';

type LocalizationProviderProps = {
  manager: Manager;
  children: JSX.Element;
};

const LocalizationContext = createContext({});
const STRINGS_UPDATED = 'STRINGS_UPDATED';

export const notifyStringsUpdated = () => PubSub.publish(STRINGS_UPDATED);

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ manager, children }) => {
  const [strings, setStrings] = useState(manager.strings);

  useEffect(() => {
    const token = PubSub.subscribe(STRINGS_UPDATED, () => setStrings(manager.strings));

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [manager]);

  return <LocalizationContext.Provider value={strings}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = () => {
  const strings = useContext<Record<string, string>>(LocalizationContext);

  const getLabel = (label?: string, disableHtml?: boolean) => {
    const localizedLabel = label ? strings[label] ?? label : '';
    return disableHtml ? localizedLabel : safeParseHtml(localizedLabel);
  };

  return {
    strings,
    getLabel,
  };
};
