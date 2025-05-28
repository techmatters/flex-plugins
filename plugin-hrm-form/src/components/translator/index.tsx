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

import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { selectLocaleState } from '../../states/configuration/selectLocaleState';
import { selectCurrentDefinitionVersion } from '../../states/configuration/selectDefinitions';
import asyncDispatch from '../../states/asyncDispatch';
import { newChangeLanguageAsyncAction } from '../../states/configuration/changeLanguage';

type Props = {
  translateUI: (language: string) => Promise<void>;
  manager: Flex.Manager;
};

const Translator: React.FC<Props> = ({ manager }) => {
  const { selected: currentlocale, status: loadingStatus } = useSelector(selectLocaleState);
  const definitionVersion = useSelector(selectCurrentDefinitionVersion);
  const dispatch = asyncDispatch(useDispatch());
  const { flexUiLocales } = definitionVersion;
  const { shortLabel } = flexUiLocales.find(e => e.aseloLocale === currentlocale) ?? {
    shortLabel: currentlocale,
  };

  if (flexUiLocales.length < 2) return null;

  // receives the new language selected (passed via event value)
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleChange = async e => {
    const selectedLocale = e.target.value;
    if (loadingStatus === 'loaded' && selectedLocale !== currentlocale) {
      await dispatch(newChangeLanguageAsyncAction(selectedLocale, definitionVersion));
    }
  };

  const { TranslateButtonAriaLabel } = manager.strings as any;

  return (
    <FormControl variant="filled">
      <InputLabel id={`${TranslateButtonAriaLabel}-label`}>{TranslateButtonAriaLabel}</InputLabel>
      <Select
        style={{ padding: '0 20px' }}
        label={shortLabel}
        disableUnderline
        labelId={`${TranslateButtonAriaLabel}-label`}
        id={TranslateButtonAriaLabel}
        value={currentlocale}
        defaultValue={currentlocale}
        onChange={handleChange}
        disabled={loadingStatus === 'loading'}
      >
        {flexUiLocales.map(({ aseloLocale, label }) => (
          <MenuItem value={aseloLocale} key={aseloLocale}>
            {label}
          </MenuItem>
        ))}
      </Select>
      {loadingStatus === 'loading' && <CircularProgress style={{ position: 'absolute', flex: 1 }} />}
    </FormControl>
  );
};

Translator.displayName = 'Translator';

export default Translator;
