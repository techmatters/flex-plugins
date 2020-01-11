import { handleFocus, handleBlur } from '../states/ActionCreators';

test('handleBlur is just a stub right now', () => {
  expect(handleBlur(null)(null)).toBe(null);
});

test('handleFocus is just a stub right now', () => {
  expect(handleFocus(null)(null, null)).toBe(null);
});