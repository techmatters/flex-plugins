import { default as styled } from 'react-emotion';

export const HrmFormComponentStyles = styled('div')`
  padding: 10px;
  margin: 0px;
  color: #fff;
  background: #000;

  .accented {
    color: red;
    cursor: pointer;
    float: right;
  }

  option[value=""][disabled] {
    display: none;
  }

  button {
    align-self: center;
    height: 28px;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
    white-space: nowrap;
    color: rgb(255, 255, 255);
    padding: 0px 16px;
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    background: linear-gradient(to top, rgb(25, 118, 210), rgb(25, 118, 210));
    outline: none;
    border-radius: 100px;
    cursor: pointer;
  }

  button:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;
