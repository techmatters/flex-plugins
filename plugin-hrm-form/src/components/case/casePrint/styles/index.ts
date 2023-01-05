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
    { src: `${robotoSrc}-regular-webfont.ttf`, fontWeight: 400 },
    { src: `${robotoSrc}-medium-webfont.ttf`, fontWeight: 500 },
    { src: `${robotoSrc}-bold-webfont.ttf`, fontWeight: 600 },
  ],
});

const notosansSrc =
  'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansThaiLooped/hinted/ttf/NotoSansThaiLooped';

Font.register({
  family: 'NotoSansThaiLooped',
  fonts: [
    { src: `${notosansSrc}-Light.ttf`, fontWeight: 300 },
    { src: `${notosansSrc}-Regular.ttf`, fontWeight: 400 },
    { src: `${notosansSrc}-Medium.ttf`, fontWeight: 500 },
    { src: `${notosansSrc}-Bold.ttf`, fontWeight: 600 },
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

export const changeRegisteredFonts = (definitionVersion: DefinitionVersionId) => {
  if (definitionVersion === DefinitionVersionId.thV1) {
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
  }
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
