import { formatName, formatAddress, formatDuration, formatChannel } from '../utils';

test('Test name formatter', () => {
  const name = 'Some name';
  const expectName = formatName(name);
  const expectUnknown = formatName(' ');

  expect(expectName).toEqual(name);
  expect(expectUnknown).toEqual('Unknown');
});

test('Test address formatter', () => {
  const addr1 = ['Street', 'City', 'State', 'CP'];
  const expectedAddr1 = 'Street, City, State CP';
  const formattedAddr1 = formatAddress(addr1[0], addr1[1], addr1[2], addr1[3]);

  const addr2 = ['', 'City', 'State', ''];
  const expectedAddr2 = 'City, State';
  const formattedAddr2 = formatAddress(addr2[0], addr2[1], addr2[2], addr2[3]);

  const addr3 = ['', '', '', ''];
  const expectedAddr3 = '';
  const formattedAddr3 = formatAddress(addr3[0], addr3[1], addr3[2], addr3[3]);

  expect(formattedAddr1).toEqual(expectedAddr1);
  expect(formattedAddr2).toEqual(expectedAddr2);
  expect(formattedAddr3).toEqual(expectedAddr3);
});
test('Test conversation duration formatter', () => {
  const duration1 = 42;
  const expectedDuration1 = '42s';
  const formattedDuration1 = formatDuration(duration1);

  const duration2 = 1449;
  const expectedDuration2 = '24m 9s';
  const formattedDuration2 = formatDuration(duration2);

  const duration3 = 4320;
  const expectedDuration3 = '1h 12m 0s';
  const formattedDuration3 = formatDuration(duration3);

  expect(formattedDuration1).toEqual(expectedDuration1);
  expect(formattedDuration2).toEqual(expectedDuration2);
  expect(formattedDuration3).toEqual(expectedDuration3);
});

test('Test contact channel formatter', () => {
  const ch1 = 'facebook';
  const expectCh1 = 'Facebook Messenger';
  const fmtCh1 = formatChannel(ch1);

  const ch2 = 'web';
  const expectCh2 = 'Chat';
  const fmtCh2 = formatChannel(ch2);

  const ch3 = 'voice';
  const expectCh3 = 'Voice';
  const fmtCh3 = formatChannel(ch3);

  const ch4 = 'sms';
  const expectCh4 = 'SMS';
  const fmtCh4 = formatChannel(ch4);

  const ch5 = 'whatsapp';
  const expectCh5 = 'WhatsApp';
  const fmtCh5 = formatChannel(ch5);

  const undef = 'anything else';
  const expectUndef = 'Undefined';
  const fmtUndef = formatChannel(undef);

  expect(fmtCh1).toEqual(expectCh1);
  expect(fmtCh2).toEqual(expectCh2);
  expect(fmtCh3).toEqual(expectCh3);
  expect(fmtCh4).toEqual(expectCh4);
  expect(fmtCh5).toEqual(expectCh5);
  expect(fmtUndef).toEqual(expectUndef);
});
