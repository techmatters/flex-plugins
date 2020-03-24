import styled from 'react-emotion';

export const ContactWrapper = styled('div')`
  margin-top: 5px;
  margin-bottom: 5px;

  &:hover{
    box-shadow: -1px 7px 29px 0px rgba(0,0,0,0.3);
`;

export const ContactButtonsWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  margin-left: auto;
`;

export const ContactLabel = styled('div')`
  border-radius: 5%;
  background-color: #d3d3d3;
  margin-left: 10px;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
`;