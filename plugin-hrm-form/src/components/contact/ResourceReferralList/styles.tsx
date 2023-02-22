import styled from '@emotion/styled';

export const InputWrapper = styled('div')`
  display: flex;
  align-items: center;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  width: 100%;
  height: 39px;
  padding: 0 6px;
  margin-top: 10px;
  margin-bottom: 8px;

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
`;

export const AddButton = styled('button')`
  border: none;
  border-radius: 4px;
  height: 28px;
  padding-left: 12px;
  padding-right: 12px;
  color: rgba(18, 28, 45, 0.7);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: #d8d8d8;
  }
`;
