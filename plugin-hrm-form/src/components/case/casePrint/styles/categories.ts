import ReactPDF from '@react-pdf/renderer';

const categoriesStyles: ReactPDF.Styles = {
  categoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  categoryView: {
    marginBottom: '10px',
    opacity: 0.15,
  },
  categoryText: {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '5px',
    paddingRight: '5px',
    fontSize: 10,
    fontWeight: 600,
    color: '#000000',
    opacity: 1.0,
  },
};

export default categoriesStyles;
