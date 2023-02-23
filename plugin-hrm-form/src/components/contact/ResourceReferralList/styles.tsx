import styled from '@emotion/styled';

export const Container = styled('div')`
  width: 250px;
  margin-top: 25px;
  color: #000000;
`;

export const InputWrapper = styled('div')`
  display: flex;
  align-items: center;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  width: 100%;
  height: 39px;
  padding: 0 6px;
  margin-top: 10px;
  margin-bottom: 15px;

  &:focus-within {
    outline: 1px solid rgb(0, 95, 204);
  }
`;

export const InputText = styled('input')`
  border: none;
  flex-grow: 1;
  margin-right: 4px;
  width: inherit;

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: white;
  }
`;

type AddButtonProps = {
  disabled: boolean;
};

export const AddButton = styled('button')<AddButtonProps>`
  border: none;
  border-radius: 4px;
  height: 28px;
  padding-left: 12px;
  padding-right: 12px;
  color: rgba(18, 28, 45, 0.7);
  font-weight: 600;
  font-size: 13px;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};

  &:hover {
    ${props => !props.disabled && 'background-color: #d8d8d8'};
  }
`;

export const Error = styled('p')`
  display: flex;
  color: red;
  margin-left: 12px;
  margin-bottom: 12px;
`;

export const ReferralList = styled('ul')`
  margin-left: 12px;
  color: rgba(0, 0, 0, 0.7);
`;

export const ReferralItem = styled('li')`
  display: flex;
  margin-bottom: 12px;
`;

export const ReferralItemInfo = styled('div')`
  display: flex;
  flex-direction: column;
  font-style: italic;
`;
