import { StyleSheet, Font } from '@react-pdf/renderer';
// import { getConfig } from '../../../../HrmFormPlugin';

/*
 *   const config = getConfig();
 *   console.log('>>> CasePrint Index',config)
 */

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
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0ef8pkAg.ttf' }, // font-style: normal, font-weight: normal
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem6YaGs126MiZpBA-UFUK0ZdchGAK6b.ttf', fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UNirkOUuhsKKSTjw.ttf', fontWeight: 600 },
  ],
});

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 600 },
  ],
});

Font.register({
  family: 'NotoSansThaiLooped',
  fonts: [
    {
      src:
        'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansThaiLooped/hinted/ttf/NotoSansThaiLooped-Light.ttf',
      fontWeight: 300,
    },
    {
      src:
        'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansThaiLooped/hinted/ttf/NotoSansThaiLooped-Regular.ttf',
      fontWeight: 400,
    },
    {
      src:
        'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansThaiLooped/hinted/ttf/NotoSansThaiLooped-Medium.ttf',
      fontWeight: 500,
    },
    {
      src:
        'https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansThaiLooped/hinted/ttf/NotoSansThaiLooped-Bold.ttf',
      fontWeight: 600,
    },
  ],
});

/*
 * Some UI elements (such as: checkboxes) needs to be replaced by Emojis
 */
Font.registerEmojiSource({
  format: 'png',
  url: 'https://twemoji.maxcdn.com/2/72x72/',
});

let fontFamilyByLanguage = 'OpenSans';

// let version;
// if (version = 'uk-v1'){
//   fontFamilyByLanguage = 'Roboto'
// } else if (version = 'th-v1'){
//   fontFamilyByLanguage = 'NotoSansThaiLooped'
// } 
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
    fontFamily: fontFamilyByLanguage,
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
