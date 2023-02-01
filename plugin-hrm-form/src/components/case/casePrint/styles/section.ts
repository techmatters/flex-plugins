import type ReactPDF from '@react-pdf/renderer';

const sectionStyles: ReactPDF.Styles = {
  sectionHeader: {
    marginTop: 20,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
    fontFamily: 'Roboto',
    backgroundColor: 'black',
    fontWeight: 600,
  },
  whiteText: {
    textTransform: 'uppercase',
    fontFamily: 'Roboto',
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
    fontFamily: 'Roboto',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionItemRowOdd: {
    fontFamily: 'Roboto',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f5f5f5',
  },
  sectionItemFirstColumn: {
    width: '50%',
  },
  sectionItemSecondColumn: {
    width: '50%',
    fontWeight: 600,
  },
};

export default sectionStyles;
