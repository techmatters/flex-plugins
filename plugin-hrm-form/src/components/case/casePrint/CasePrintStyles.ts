import { StyleSheet, Font } from '@react-pdf/renderer';

/*
 * Unfortunately we have to import each font that we want to use (even with the style and weight variations)
 * More info: https://react-pdf.org/fonts
 */
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0ef8pkAg.ttf' }, // font-style: normal, font-weight: normal
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem6YaGs126MiZpBA-UFUK0ZdchGAK6b.ttf', fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UNirkOUuhsKKSTjw.ttf', fontWeight: 600 },
  ],
});

/*
 * Some UI elements (such as: checkboxes) needs to be replaced by Emojis
 */
Font.registerEmojiSource({
  format: 'png',
  url: 'https://twemoji.maxcdn.com/2/72x72/',
});

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  caseHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caseBody: {
    fontFamily: 'Open Sans',
    marginTop: 20,
    marginBottom: 20,
  },
  caseDetailsContainer: {
    marginLeft: 5,
    marginRight: 5,
  },
  caseDetailsLabel: {
    marginBottom: 10,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.67,
  },
  caseDetailsSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    backgroundColor: 'lightgray',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  caseCounsellorSection: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 10,
    fontSize: 12,
  },
  caseDetailsBoldText: {
    marginTop: 5,
    fontWeight: 600,
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
  childName: {
    fontFamily: 'Open Sans',
    fontSize: 24,
    fontWeight: 600,
  },
  caseId: {
    fontFamily: 'Open Sans',
    fontSize: 18,
  },
  officeName: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 5,
  },
  sectionHeader: {
    marginTop: 20,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
    fontFamily: 'Open Sans',
    backgroundColor: 'black',
    fontWeight: 600,
  },
  whiteText: {
    textTransform: 'uppercase',
    fontFamily: 'Open Sans',
    fontSize: 10,
    letterSpacing: 1.67,
    color: 'white',
  },
  sectionBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  sectionItemRowEven: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionItemRowOdd: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f5f5f5',
  },
  sectionItemRowText: {
    flexGrow: 0,
    maxWidth: '50%',
  },
  caseSummaryText: {
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    fontSize: 12,
    marginTop: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

export default styles;
