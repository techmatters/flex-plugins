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

import { StyleSheet, Font } from '@react-pdf/renderer';
import { DefinitionVersionId } from 'hrm-form-definitions';

import headerStyles from './header';
import footerStyles from './footer';
import detailsStyles from './details';
import sectionStyles from './section';
import notesStyles from './notes';
import summaryStyles from './summary';
import categoriesStyles from './categories';

/*
 * Unfortunately we have to import each font that we want to use (even with the style and weight variations)
 * More info: https://react-pdf.org/fonts
 * .TTF links extracted with: https://nikoskip.me/gfonts.php
 */

const robotoSrc = 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: `${robotoSrc}-light-webfont.ttf`, fontWeight: 300, fontStyle: 'italic' },
    { src: `${robotoSrc}-regular-webfont.ttf`, fontWeight: 400 },
    { src: `${robotoSrc}-medium-webfont.ttf`, fontWeight: 500 },
    { src: `${robotoSrc}-bold-webfont.ttf`, fontWeight: 700 },
  ],
});

const notosansSrc =
  'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansThaiLooped/hinted/ttf/NotoSansThaiLooped';

Font.register({
  family: 'NotoSansThaiLooped',
  fonts: [
    { src: `${notosansSrc}-Light.ttf`, fontWeight: 300, fontStyle: 'italic' },
    { src: `${notosansSrc}-Regular.ttf`, fontWeight: 400 },
    { src: `${notosansSrc}-Medium.ttf`, fontWeight: 500 },
    { src: `${notosansSrc}-Bold.ttf`, fontWeight: 700 },
  ],
});

/*
 * Some UI elements (such as: checkboxes) needs to be replaced by Emojis
 */
Font.registerEmojiSource({
  format: 'png',
  url: 'https://twemoji.maxcdn.com/2/72x72/',
});

const { footer } = footerStyles;
const { childName, caseId, officeName } = headerStyles;
const { sectionHeader, whiteText, sectionItemRowEven, sectionItemRowOdd } = sectionStyles;
const { caseSummaryText } = summaryStyles;

/**
 * 'Roboto' font family works for all languages/fonts supported thus far.
 * However, Thai characters are not readable with Roboto, hence substituting to NotoSansThaiLooped is required.
 * https://fonts.google.com/noto/specimen/Noto+Sans
 * In the future, when more languages are added, adding a compatible fontFamily might be necessary
 *
 */
export const useThaiFontFamily = () => {
  [
    styles.page,
    footer,
    childName,
    caseId,
    officeName,
    sectionHeader,
    whiteText,
    sectionItemRowEven,
    sectionItemRowOdd,
    caseSummaryText,
  ].forEach(el => (el.fontFamily = 'NotoSansThaiLooped'));
};

const styles = StyleSheet.create({
  ...headerStyles,
  ...footerStyles,
  ...detailsStyles,
  ...sectionStyles,
  ...notesStyles,
  ...summaryStyles,
  ...categoriesStyles,
  page: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Roboto',
    paddingTop: 20,
    paddingBottom: 50,
    paddingLeft: 20,
    paddingRight: 20,
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
