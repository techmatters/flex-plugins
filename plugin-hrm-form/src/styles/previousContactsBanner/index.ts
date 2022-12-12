import { styled } from '@twilio/flex-ui';

const YellowBannerHeight = '36px';

export const YellowBanner = styled('div')`
  display: flex;
  background-color: #fdfad3;
  height: ${YellowBannerHeight};
  font-size: 13px;
  align-items: center;
  justify-content: center;
`;

YellowBanner.displayName = 'YellowBanner';
