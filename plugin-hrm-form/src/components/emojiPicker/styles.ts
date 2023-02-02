import { styled } from '@twilio/flex-ui';

type PopupProps = {
  isOpen: boolean;
};

export const Relative = styled('div')`
  position: relative;
`;

export const Popup = styled('div')<PopupProps>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  left: 0;
  bottom: 36px;
`;

export const SelectEmojiButton = styled('button')`
  background: none;
  border: none;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  width: 2.25rem;
  height: 2.25rem;
  padding: 8px;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    background: rgb(225, 227, 234);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    fill: currentColor;
  }
`;
