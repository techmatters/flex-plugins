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
import { CircularProgress, MenuItem, MenuList } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import LanguageIcon from '@material-ui/icons/Language';

import { selectLocaleState } from '../../states/configuration/selectLocaleState';
import { selectCurrentDefinitionVersion } from '../../states/configuration/selectDefinitions';
import asyncDispatch from '../../states/asyncDispatch';
import { newChangeLanguageAsyncAction } from '../../states/configuration/changeLanguage';
import { Flex, MultiSelectButton } from '../../styles';
import {
  MainHeaderButton,
  MainHeaderDialog,
  MainHeaderDialogTitle,
  MainHeaderMenuItemText,
} from '../../styles/mainHeader';
import ChevronDownIcon from '../common/icons/ChevronDownIcon';

const Translator: React.FC = () => {
  const { selected: currentlocale, status: loadingStatus } = useSelector(selectLocaleState);
  const definitionVersion = useSelector(selectCurrentDefinitionVersion);
  const [isOpened, setOpened] = React.useState(false);
  const dispatch = asyncDispatch(useDispatch());
  const { flexUiLocales } = definitionVersion;
  const { shortLabel } = flexUiLocales.find(e => e.aseloLocale === currentlocale) ?? {
    shortLabel: currentlocale,
  };

  if (flexUiLocales.length < 2) return null;

  // receives the new language selected (passed via event value)
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleMenuButtonClick = async () => {
    setOpened(!isOpened);
  };

  // receives the new language selected (passed via event value)
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const handleMenuItemClick = async (selectedLocale: string) => {
    await dispatch(newChangeLanguageAsyncAction(selectedLocale, definitionVersion));
    setOpened(false);
  };

  return (
    <div
      style={{ position: 'relative' }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpened(false);
        }
      }}
    >
      <MainHeaderButton
        data-testid="MainHeader-Translator-Button"
        type="button"
        name="MainHeader-Translator-Button"
        onClick={handleMenuButtonClick}
      >
        <LanguageIcon style={{ width: '20px', marginRight: '10px' }} />
        {shortLabel}
        <Flex marginLeft="15px" style={{ width: '20px' }}>
          <ChevronDownIcon />
        </Flex>
      </MainHeaderButton>
      {isOpened && (
        <MainHeaderDialog>
          <MainHeaderDialogTitle id="dialog-title">
            <Template code="MainHeader-Translator-MenuTitle" />
          </MainHeaderDialogTitle>
          <MenuList id="MainHeader-Translator-MenuList" defaultValue={currentlocale}>
            {flexUiLocales.map(({ aseloLocale, label }) => (
              <MenuItem
                value={aseloLocale}
                key={aseloLocale}
                disabled={loadingStatus === 'loading'}
                onClick={() => handleMenuItemClick(aseloLocale)}
                style={{ paddingLeft: 0, marginLeft: 0 }}
              >
                <MainHeaderMenuItemText style={{ fontWeight: aseloLocale === currentlocale ? 'bold' : 'normal' }}>
                  {label}
                </MainHeaderMenuItemText>
              </MenuItem>
            ))}
          </MenuList>
          {loadingStatus === 'loading' && <CircularProgress style={{ position: 'absolute', flex: 1 }} />}
        </MainHeaderDialog>
      )}
    </div>
  );
};

Translator.displayName = 'Translator';

export default Translator;
