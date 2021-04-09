import React from 'react';
import styled from 'react-emotion';

export const YellowBanner = styled('div')`
  display: flex;
  background-color: #fdfad3;
  height: 36px;
  font-size: 13px;
  align-items: center;
  justify-content: center;
`;

YellowBanner.displayName = 'YellowBanner';

export const Bold = styled('span')`
  font-weight: 700;
`;

Bold.displayName = 'Bold';
