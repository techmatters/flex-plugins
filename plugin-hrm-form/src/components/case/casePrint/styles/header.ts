import ReactPDF from '@react-pdf/renderer';

const headerStyles: ReactPDF.Styles = {
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  childName: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 600,
  },
  caseId: {
    fontFamily: 'Roboto',
    fontSize: 18,
  },
  officeName: {
    fontFamily: 'Roboto',
    fontSize: 10,
    marginLeft: 5,
  },
  logo: {
    maxWidth: 275,
    maxHeight: 80,
    objectFit: 'scale-down',
  },
};

export default headerStyles;
