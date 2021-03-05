import ReactPDF from '@react-pdf/renderer';

const categoriesStyles: ReactPDF.Styles = {
  categoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  categoryView: {
    marginBottom: '10px',
    borderRadius: '2px',
  },
  categoryText: {
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '5px',
    paddingRight: '5px',
    fontSize: 10,
    fontWeight: 600,
  },
};

export default categoriesStyles;
