import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  caseHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caseDetailsLabel: {
    marginTop: 30,
    marginBottom: 10,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.67,
    fontWeight: 700,
  },
  caseDetailsSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    backgroundColor: 'lightgray',
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 40,
  },
  caseDetailsItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  nameContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  childName: {
    fontSize: 24,
    fontWeight: 600,
  },
  sectionHeader: {
    marginTop: 20,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
    marginRight: 40,
    backgroundColor: 'black',
  },
  whiteText: {
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.67,
    fontWeight: 700,
    color: 'white',
  },
  sectionBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  sectionItemRowEven: {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: 40,
  },
  sectionItemRowOdd: {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f5f5f5',
    marginRight: 40,
  },
  sectionItemRowText: {
    flexGrow: 0,
    maxWidth: '50%',
  },
  caseSummaryText: {
    fontSize: 12,
    marginRight: 40,
  },
  logo: {
    marginRight: 50,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

export default styles;
