import ReactPDF from '@react-pdf/renderer';

const headerStyles: ReactPDF.Styles = {
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
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
    fontSize: 10,
    marginLeft: 5,
  },
  logo: {
    maxWidth: 275,
    maxHeight: 80,
  },
};

export default headerStyles;
