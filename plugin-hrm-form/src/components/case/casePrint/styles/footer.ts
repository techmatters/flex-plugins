import type ReactPDF from '@react-pdf/renderer';

const footerStyles: ReactPDF.Styles = {
  footer: {
    position: 'absolute',
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: 600,
    marginTop: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
};

export default footerStyles;
