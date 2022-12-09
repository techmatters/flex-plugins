import { styled } from '@twilio/flex-ui';

import ExpandableTextBlock, { ExpandableTextBlockProps } from './ExpandableTextBlock';

export const PreviewDescription = styled(ExpandableTextBlock)<ExpandableTextBlockProps>`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  color: #000000;
  font-family: Open Sans, serif;
  text-align: left;
  padding-top: 5px;
`;

PreviewDescription.displayName = 'PreviewDescription';
