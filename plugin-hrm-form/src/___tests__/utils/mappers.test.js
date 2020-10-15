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

  const undef = 'anything else';
  const expectUndef = 'Undefined';
  const fmtUndef = mapChannel(undef);

  expect(fmtCh1).toEqual(expectCh1);
  expect(fmtCh2).toEqual(expectCh2);
  expect(fmtCh3).toEqual(expectCh3);
  expect(fmtCh4).toEqual(expectCh4);
  expect(fmtCh5).toEqual(expectCh5);
  expect(fmtUndef).toEqual(expectUndef);
});

test('mapAge handles values correctly', () => {
  expect(mapAge('Unknown')).toEqual('Unknown');
  expect(mapAge(undefined)).toEqual('Unknown');
  expect(mapAge('10')).toEqual('10-12');
  expect(mapAge('57')).toEqual('>25');
  expect(mapAge('101')).toEqual('Unknown');
});
