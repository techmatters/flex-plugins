import ReactPDF from '@react-pdf/renderer';

const detailsStyles: ReactPDF.Styles = {
  caseDetailsContainer: {
    marginLeft: 5,
    marginRight: 5,
  },
  caseDetailsLabel: {
    marginBottom: 10,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: 600,
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
};

export default detailsStyles;
