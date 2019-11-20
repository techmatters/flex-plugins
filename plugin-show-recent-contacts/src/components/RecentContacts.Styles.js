import { default as styled } from 'react-emotion';

// For some reason, Flex does not import the styles for react-json-to-table
// so we import then manually from here: 
// https://github.com/thehyve/react-json-to-table/blob/master/src/components/JsonToTable/JsonToTable.scss
// as of September 16, 2019 (SHA 5c45565f6ee0cb0473e93aa390fd3246b7538250)
// We also add "overflow: auto" because if the list is too long for the screen,
// Flex won't scroll without this.
export const RecentContactsComponentStyles = styled('div')`
  overflow: auto;

  h1 {
    font-size: 20px;
  }

  td,
  th {
    padding: 5px;
    border: 1px solid rgb(190, 190, 190);
  }

  td {
    text-align: left;
  }

  tr:nth-child(even) {
    background-color: #eee;
  }

  th[scope="col"] {
    background-color: #696969;
    color: #fff;
  }

  th[scope="row"] {
    background-color: #d7d9f2;
  }

  caption {
    caption-side: bottom;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-family: sans-serif;
    font-size: 0.8rem;
  }
`;
