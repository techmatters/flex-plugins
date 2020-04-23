/*
 * File used to populate test's scope with mocked styled components
 * Should be imported before the components making use of the styled
 */

jest.mock('../styles/HrmStyles', () => ({
  Container: 'Container',
  SearchFields: 'SearchFields',
  StyledNextStepButton: 'StyledNextStepButton',
  BottomButtonBar: 'BottomButtonBar',
  StyledLabel: 'StyledLabel',
  StyledInput: 'StyledInput',
  TextField: 'TextField',
  StyledMenuItem: 'StyledMenuItem',
  StyledSelect: 'StyledSelect',
  StyledTableCell: 'StyledTableCell',
  Row: 'Row',
  FontOpenSans: 'FontOpenSans',
  Box: 'Box',
  ErrorText: 'ErrorText',
}));

jest.mock('../styles/search', () => ({
  ConfirmContainer: 'ConfirmContainer',
  ContactWrapper: 'ContactWrapper',
  ContactButtonsWrapper: 'ContactButtonsWrapper',
  StyledLink: 'StyledLink',
  ContactTag: 'ContactTag',
  CalltypeTag: 'CalltypeTag',
  ConfirmText: 'ConfirmText',
  PrevNameText: 'PrevNameText',
  SummaryText: 'SummaryText',
  ShortSummaryText: 'ShortSummaryText',
  CounselorText: 'CounselorText',
  DateText: 'DateText',
  TagText: 'TagText',
  StyledIcon: () => 'StyledIcon',
  ContactDetailsIcon: () => 'ContactDetailsIcon',
  DetailsContainer: 'DetailsContainer',
  SectionTitleContainer: 'SectionTitleContainer',
  NameContainer: 'NameContainer',
  BoldDetailFont: 'BoldDetailFont',
  BackIcon: 'BackIcon',
  BackText: 'BackText',
  DetNameText: 'DetNameText',
  SectionTitleText: 'SectionTitleText',
  BodyText: 'BodyText',
  SectionDescriptionText: 'SectionDescriptionText',
  SectionValueText: 'SectionValueText',
  ResultsHeader: 'ResultsHeader',
  ListContainer: 'ListContainer',
  ScrollableList: 'ScrollableList',
  CancelButton: 'CancelButton',
}));

jest.mock('../styles/callTypeButtons', () => ({
  Container: 'Container',
  Label: 'Label',
  DataCallTypeButton: 'DataCallTypeButton',
  NonDataCallTypeButton: 'NonDataCallTypeButton',
  CloseTaskDialog: 'CloseTaskDialog',
  CloseTaskDialogText: 'CloseTaskDialogText',
  ConfirmButton: 'ConfirmButton',
  CancelButton: 'CancelButton',
  CloseButton: 'CloseButton',
  NonDataCallTypeDialogContainer: 'NonDataCallTypeDialogContainer',
}));

jest.mock('../styles/queuesStatus', () => ({
  Container: 'Container',
  HeaderContainer: 'HeaderContainer',
  QueuesContainer: 'QueuesContainer',
  QueueName: 'QueueName',
  ChannelColumn: 'ChannelColumn',
  ChannelBox: 'ChannelBox',
  ChannelLabel: 'ChannelLabel',
  WaitTimeLabel: 'WaitTimeLabel',
  WaitTimeValue: 'WaitTimeValue',
}));
