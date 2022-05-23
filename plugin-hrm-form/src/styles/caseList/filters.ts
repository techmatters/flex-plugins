import styled from 'react-emotion';

import { Flex } from '../HrmStyles';

export const FiltersContainer = styled(Flex)`
  align-items: center;
  color: #192b33;
  margin-left: 15px;
  margin-right: 10px;
  padding: 10px;
  font-size: 13px;
  border-bottom: 2px solid #d8d8d8;
  &:focus {
    outline: auto;
  }
`;
FiltersContainer.displayName = 'FiltersContainer';

export const CasesTitle = styled('h1')`
  font-size: 14px;
  font-weight: 600;
`;
CasesTitle.displayName = 'CasesTitle';

export const FiltersResetAll = styled('button')`
  background-color: transparent;
  color: #1876d1;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: 600;
  margin-left: 10px;

  &:hover {
    color: rgba(24, 118, 209, 0.8);
  }
`;
FiltersResetAll.displayName = 'FiltersResetAll';

export const FilterTitle = styled('span')`
  font-weight: 600;
  margin-left: 10px;
  margin-right: 20px;
`;
FilterTitle.displayName = 'FilterTitle';

export const CasesCount = styled(Flex)`
  margin-left: auto;
  padding-right: 10px;
`;
CasesCount.displayName = 'CasesCount';

type MultiSelectButtonProps = {
  isOpened?: Boolean;
  isActive?: Boolean;
};

export const MultiSelectButton = styled('button')<MultiSelectButtonProps>`
  display: flex;
  align-items: center;
  background-color: ${props => (props.isOpened || props.isActive ? 'white' : '#ecedf1')};
  cursor: pointer;
  margin: 0 5px;
  height: 28px;
  border: 1px solid #c0c1c3;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Open Sans';
  font-weight: ${props => (props.isOpened ? 'bold' : 'normal')};
  color: #192b33;
  &:hover {
    background-color: ${props => (props.isOpened ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  }
  &:focus {
    outline: auto;
  }
`;
MultiSelectButton.displayName = 'MultiSelectButton';

export const DialogArrow = styled(Flex)`
  position: absolute;
  top: 0;
  left: 60px;
  background: #ffffff;
  border: 0px solid #d3d3d3;

  &:after,
  &:before {
    bottom: 100%;
    left: 50%;
    border: solid transparent;
    content: '';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  &:after {
    border-color: rgba(255, 255, 255, 0);
    border-bottom-color: #ffffff;
    border-width: 10px;
    margin-left: -10px;
  }

  &:before {
    border-color: rgba(211, 211, 211, 0);
    border-bottom-color: rgba(211, 211, 211, 0.7);
    border-width: 13px;
    margin-left: -13px;
  }
`;
DialogArrow.displayName = 'DialogArrow';

type FiltersDialogProps = {
  width?: string;
};

export const FiltersDialog = styled('div')<FiltersDialogProps>`
  position: absolute;
  background: white;
  box-sizing: border-box;
  width: ${props => (props.width ? props.width : '330px')};
  top: 43px;
  left: -20px;
  min-width: 200px;
  padding: 25px 32px;
  border: 1px solid lightgray;
  border-radius: 4px;
  box-shadow: 0px 0px 3px 2px rgb(0 0 0 / 10%);
  z-index: 100;
`;
FiltersDialog.displayName = 'FiltersDialog';

export const FiltersDialogTitle = styled('h2')`
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: 600;
  color: #192b33;
  margin-bottom: 20px;
`;
FiltersDialogTitle.displayName = 'FiltersDialogTitle';

type MultiSelectUnorderedListProps = {
  scrollable?: Boolean;
  height?: string;
};

const scrollableUnorderedList = `
  height: 200px;
  overflow-y: scroll;
  margin: 0 -32px;
  padding: 6px 32px;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
`;

export const MultiSelectUnorderedList = styled('ul')<MultiSelectUnorderedListProps>`
  ${props => (props.scrollable ? scrollableUnorderedList : '')}
  ${props => (props.height ? `height: ${props.height};` : '')}
`;
MultiSelectUnorderedList.displayName = 'MultiSelectUnorderedList';

type MultiSelectListItemProps = {
  hidden?: Boolean;
};

export const MultiSelectListItem = styled('li')<MultiSelectListItemProps>`
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
  height: ${props => (props.hidden ? '0' : 'auto')};
  margin-bottom: ${props => (props.hidden ? '0' : '5px')};
`;
MultiSelectListItem.displayName = 'MultiSelectListItem';

export const MultiSelectCheckboxLabel = styled('span')`
  font-family: 'Open Sans';
  font-size: 13px;
  color: #192b33;
  margin-left: 2px;

  strong {
    font-weight: 700;
  }
`;
MultiSelectCheckboxLabel.displayName = 'MultiSelectCheckboxLabel';

export const MultiSelectSearchInput = styled('input')`
  margin-bottom: 15px;
  display: flex;
  flex-grow: 0;
  font-family: Open Sans;
  font-size: 13px;
  line-height: 1.33;
  letter-spacing: normal;
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  background-color: ${props => props.theme.colors.inputBackgroundColor};
  color: #192b33;
  border: none;
  boxshadow: none;
  padding: 0 34px;

  &:focus {
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
`;
MultiSelectSearchInput.displayName = 'MultiSelectSearchInput';

export const FiltersBottomButtons = styled(Flex)`
  margin-top: 20px;
  justify-content: flex-end;
  margin-right: 20px;
`;
FiltersBottomButtons.displayName = 'FiltersBottomButtons';

export const FiltersApplyButton = styled('button')`
  padding: 5px 19px;
  background-color: #192b33;
  color: white;
  font-family: 'Open Sans';
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(25, 43, 51, 0.8);
  }

  &:disabled {
    background-color: ${props => props.theme.colors.disabledColor};
    &:hover {
      cursor: not-allowed;
    }
  }
`;
FiltersApplyButton.displayName = 'FiltersApplyButton';

export const FiltersClearButton = styled(FiltersApplyButton)`
  background-color: transparent;
  color: #192b33;

  &:hover {
    background-color: rgba(25, 43, 51, 0.1);
  }

  &:disabled {
    background-color: transparent;
    color: ${props => props.theme.colors.disabledColor};
  }
`;
FiltersClearButton.displayName = 'FiltersClearButton';

export const FiltersCheckbox = styled('input')`
  &[type='checkbox'] {
    display: inline-block;
    position: relative;
    padding-left: 1.4em;
    cursor: default;
    margin-right: 5px;
  }
  &[type='checkbox']::before,
  &[type='checkbox']::after {
    position: absolute;
    top: 50%;
    left: 7px;
    transform: translate(-50%, -50%);
    content: '';
  }
  &[type='checkbox']::before {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(94, 99, 105, 0.8);
    border-radius: 0.2em;
    background-image: linear-gradient(to bottom, hsl(300, 3%, 93%), #fff 30%);
  }
  &[type='checkbox']:active::before {
    background-image: linear-gradient(to bottom, hsl(300, 3%, 73%), hsl(300, 3%, 93%) 30%);
  }

  &[type='checkbox']:checked::before,
  &[type='checkbox']:indeterminate::before {
    border-color: rgba(94, 99, 105, 0.8);
    background: #080808;
  }
  &[type='checkbox']:checked::after {
    font-family: 'Font Awesome 5 Free';
    font-size: 11px;
    content: '\f00c';
    color: #ffffff;
  }
  &[type='checkbox']:indeterminate::after {
    font-weight: 900;
    font-size: 9px;
    content: '—';
    color: #ffffff;
  }
`;
FiltersCheckbox.displayName = 'FiltersCheckbox';

type CategoryContainerProps = {
  searchTerm: string;
  noMatch: boolean;
};

export const CategoryContainer = styled('div')<CategoryContainerProps>`
  display: ${props => (props.searchTerm && props.noMatch ? 'none' : 'block')};
  cursor: ${props => (props.searchTerm ? 'default' : 'pointer')};
`;
CategoryContainer.displayName = 'CategoryContainer';

export const CategoryHeader = styled(Flex)`
  align-items: center;
  padding: 0 12px;
  margin-bottom: 3px;
  background-color: #f6f6f6;
  height: 36px;
`;
CategoryHeader.displayName = 'CategoryHeader';

type CategoryTitleProps = {
  searchTerm: string;
};

export const CategoryTitle = styled('h3')<CategoryTitleProps>`
  margin-left: ${props => (props.searchTerm ? '0' : '10px')};
  font-weight: 600;
`;
CategoryTitle.displayName = 'CategoryTitle';

export const ArrowButton = styled('button')`
  margin-left: auto;
  border: none;
  background: none;
  cursor: pointer;
`;
ArrowButton.displayName = 'ArrowButton';

type SubcategoryListProps = {
  searchTerm: string;
  expanded: boolean;
};

export const SubcategoryList = styled('ul')<SubcategoryListProps>`
  display: ${props => (props.searchTerm || props.expanded ? 'block' : 'none')};
  padding: 5px 20px;
  padding-right: 0;
`;
SubcategoryList.displayName = 'SubcategoryList';
