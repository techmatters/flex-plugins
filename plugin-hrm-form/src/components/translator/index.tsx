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

import React, { useState } from 'react';
import * as Flex from '@twilio/flex-ui';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { selectLanguage } from '../../states/configuration/selectLanguage';
import { selectCurrentDefinitionVersion } from '../../states/configuration/selectDefinitions';
import { changeLanguage } from '../../states/configuration/actions';

type Props = {
  translateUI: (language: string) => Promise<void>;
  manager: Flex.Manager;
};

const Translator: React.FC<Props> = ({ manager }) => {
  const language = useSelector(selectLanguage);
  const { flexUiLocales } = useSelector(selectCurrentDefinitionVersion);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (flexUiLocales.length < 2) return null;

  // receives the new language selected (passed via event value)
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleChange = async e => {
    const selectedLocale = e.target.value;
    if (!loading && selectedLocale !== language) {
      setLoading(true);
      // await translateUI(selectedLanguage);
      localStorage.setItem('ASELO_PLUGIN_USER_LOCALE', selectedLocale);
      dispatch(changeLanguage(selectedLocale));
      const { availableLocales } = manager.localization;
      const specifiedFlexLocale = flexUiLocales.find(locale => locale === selectedLocale)?.flexLocale;
      if (specifiedFlexLocale) {
        //
        if (availableLocales.find(locale => locale.tag === selectedLocale)) {
          await manager.localization.setLocalePreference(specifiedFlexLocale);
          return;
        }
        console.warn(
          `The configured Flex Locale '${specifiedFlexLocale}' for Aselo Locale '${selectedLocale}' is not supported in this version of Flex UI. Attempting to find a best match from available locales`,
        );
      } else {
        const exactMatch = availableLocales.find(({ tag }) => tag === selectedLocale)?.tag;
        if (exactMatch) {
          console.info(
            `Aselo Locale '${selectedLocale}' is also a supported Flex Locale, setting Flex Llocale to '${selectedLocale}'`,
          );
          await manager.localization.setLocalePreference(exactMatch);
        } else {
          const [selectedLanguage] = selectedLocale.split('-');
          const languageMatch = availableLocales.find(l => {
            const [availableLocaleLanguage] = l.tag.split('-');
            return availableLocaleLanguage === selectedLanguage;
          })?.tag;
          if (languageMatch) {
            console.info(
              `Aselo Locale '${selectedLocale}' is not supported, but a locale with the same language, '${languageMatch}' is supported, so using that`,
            );
            await manager.localization.setLocalePreference(languageMatch);
          } else {
            console.info(
              `Aselo Locale '${selectedLocale}' is not supported, nor are any with the same language, falling back to global default (en-US)`,
            );
            await manager.localization.setLocalePreference('en-US');
          }
        }
      }
      setLoading(false);
    }
  };

  const { TranslateButtonAriaLabel } = manager.strings as any;

  return (
    <FormControl variant="filled">
      <InputLabel id={`${TranslateButtonAriaLabel}-label`}>{TranslateButtonAriaLabel}</InputLabel>
      <Select
        style={{ padding: '0 20px' }}
        disableUnderline
        labelId={`${TranslateButtonAriaLabel}-label`}
        id={TranslateButtonAriaLabel}
        value={language}
        defaultValue={language}
        onChange={handleChange}
        disabled={loading}
      >
        {flexUiLocales.map(({ aseloLocale, label }) => (
          <MenuItem value={aseloLocale} key={aseloLocale}>
            {label}
          </MenuItem>
        ))}
      </Select>
      {loading && <CircularProgress style={{ position: 'absolute', flex: 1 }} />}
    </FormControl>
  );
};

Translator.displayName = 'Translator';

export default Translator;
