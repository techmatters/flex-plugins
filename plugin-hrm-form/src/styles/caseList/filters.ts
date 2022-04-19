import styled from 'react-emotion';

import { Flex } from '../HrmStyles';

export const FiltersContainer = styled(Flex)`
  align-items: center;
  color: #192b33;
  margin-left: 15px;
  margin-right: 10px;
  padding: 10px;
  font-size: 13px;
  box-shadow: 0 1px 2px 0 rgba(25, 43, 51, 0.1);
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

export const FilterBy = styled('span')`
  font-weight: 600;
  margin-left: 15px;
  margin-right: 30px;
`;
FilterBy.displayName = 'FilterBy';

export const CasesCount = styled(Flex)`
  margin-left: auto;
`;
CasesCount.displayName = 'CasesCount';

type MultiSelectButtonProps = {
  isOpened?: Boolean;
};

export const MultiSelectButton = styled('button')<MultiSelectButtonProps>`
  display: flex;
  align-items: center;
  background-color: ${props => (props.isOpened ? 'white' : '#ecedf1')};
  cursor: pointer;
  margin: 0 15px;
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

export const FiltersDialog = styled('div')`
  position: absolute;
  background: white;
  width: 270px;
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
`;
MultiSelectUnorderedList.displayName = 'MultiSelectUnorderedList';

type MultiSelectListItemProps = {
  hidden?: Boolean;
};

export const MultiSelectListItem = styled('li')<MultiSelectListItemProps>`
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
  height: ${props => (props.hidden ? '0' : 'auto')};
  margin-bottom: ${props => (props.hidden ? '0' : '3px')};
`;
MultiSelectListItem.displayName = 'MultiSelectListItem';

export const MultiSelectCheckboxLabel = styled('span')`
  font-family: 'Open Sans';
  font-size: 13px;
  color: #192b33;
  margin-left: 2px;
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
`;
FiltersApplyButton.displayName = 'FiltersApplyButton';

export const FiltersClearButton = styled(FiltersApplyButton)`
  background-color: transparent;
  color: #192b33;

  &:hover {
    background-color: rgba(25, 43, 51, 0.1);
  }
`;
FiltersClearButton.displayName = 'FiltersClearButton';
