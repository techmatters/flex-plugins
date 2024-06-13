/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { mapAge, mapCallType, mapChannel } from '../../utils';
import { channelTypes } from '../../states/DomainConstants';

test('Test contact call type mapper', () => {
  const mapSelf = 'Child calling about self';
  const mapCaller = 'Someone calling about a child';
  const string = 'anything else';

  expect(mapCallType(mapSelf)).toEqual('SELF');
  expect(mapCallType(mapCaller)).toEqual('CALLER');
  expect(mapCallType(string)).toEqual('ANYTHING ELSE');
});

test('Test contact channel mapper', () => {
  const ch1 = channelTypes.facebook;
  const expectCh1 = 'Facebook Messenger';
  const fmtCh1 = mapChannel(ch1);

  const ch2 = channelTypes.web;
  const expectCh2 = 'Chat';
  const fmtCh2 = mapChannel(ch2);

  const ch3 = channelTypes.voice;
  const expectCh3 = 'Voice';
  const fmtCh3 = mapChannel(ch3);

  const ch4 = channelTypes.sms;
  const expectCh4 = 'SMS';
  const fmtCh4 = mapChannel(ch4);

  const ch5 = channelTypes.whatsapp;
  const expectCh5 = 'WhatsApp';
  const fmtCh5 = mapChannel(ch5);

  const ch6 = channelTypes.telegram;
  const expectCh6 = 'Telegram';
  const fmtCh6 = mapChannel(ch6);

  const ch7 = channelTypes.instagram;
  const expectCh7 = 'Instagram';
  const fmtCh7 = mapChannel(ch7);

  const undef = 'Anything else';
  const expectUndef = 'Anything else';
  const fmtUndef = mapChannel(undef);

  expect(fmtCh1).toEqual(expectCh1);
  expect(fmtCh2).toEqual(expectCh2);
  expect(fmtCh3).toEqual(expectCh3);
  expect(fmtCh4).toEqual(expectCh4);
  expect(fmtCh5).toEqual(expectCh5);
  expect(fmtCh6).toEqual(expectCh6);
  expect(fmtCh7).toEqual(expectCh7);
  expect(fmtUndef).toEqual(expectUndef);
});

test('mapAge handles values correctly', () => {
  const ageOptions = [...Array(26).keys(), '>25'].map(n => n.toString());

  expect(mapAge(ageOptions)('Unknown')).toEqual('Unknown');
  expect(mapAge(ageOptions)(undefined)).toEqual('Unknown');
  expect(mapAge(ageOptions)('-1')).toEqual('Unknown');
  expect(mapAge(ageOptions)('not number')).toEqual('Unknown');
  [...Array(26).keys()].forEach(n => expect(mapAge(ageOptions)(`${n}`)).toEqual(`${n}`));
  expect(mapAge(ageOptions)('29')).toEqual('>25');
});
