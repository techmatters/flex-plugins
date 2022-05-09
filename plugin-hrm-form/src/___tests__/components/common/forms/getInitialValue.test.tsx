import each from 'jest-each';

import { MockDateSetup, setupMockDate } from '../../../dateAndTimeMocks';
import { getInitialValue } from '../../../../components/common/forms/formGenerators';

describe('getInitialValue', () => {
  test('Missing values throw', () => {
    expect(() => getInitialValue(undefined)).toThrow();
    expect(() => getInitialValue(null)).toThrow();
  });
  each([
    { type: 'input' },
    { type: 'numeric-input' },
    { type: 'email' },
    { type: 'textarea' },
    { type: 'file-upload' },
  ]).test('$type returns empty string.', ({ type }) => {
    expect(getInitialValue({ type, name: '', category: 'data', label: '' })).toEqual('');
  });
  describe('date & time', () => {
    let mockDate: MockDateSetup;
    const justAfterMidnight = () => new Date(2015, 6, 15, 0, 5);
    const justBeforeMidnight = () => new Date(2015, 6, 14, 23, 55);

    beforeEach(() => {
      mockDate = setupMockDate();
    });

    afterEach(() => {
      mockDate.reset();
    });

    describe('date-input', () => {
      test("Returns empty string if 'initializeWithCurrent' is false", () => {
        expect(getInitialValue({ type: 'date-input', name: '', label: '' })).toEqual('');
      });
      test('Returns current day if local timezone offset is zero', () => {
        mockDate.set({ offsetMinutes: 0 });
        mockDate.set({ isoDate: justAfterMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'date-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('2015-07-15');
      });
      test('Returns current day if local timezone offset is positive, just after midnight', () => {
        mockDate.set({ offsetMinutes: 600 });
        mockDate.set({ isoDate: justAfterMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'date-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('2015-07-15');
      });
      test('Returns current day if local timezone offset is positive, just before midnight', () => {
        mockDate.set({ offsetMinutes: 600 });
        mockDate.set({ isoDate: justBeforeMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'date-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('2015-07-14');
      });
      test('Returns current day if local timezone offset is negative, just after midnight', () => {
        mockDate.set({ offsetMinutes: -600 });
        mockDate.set({ isoDate: justAfterMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'date-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('2015-07-15');
      });
      test('Returns current day if local timezone offset is negative, just before midnight', () => {
        mockDate.set({ offsetMinutes: -600 });
        mockDate.set({ isoDate: justBeforeMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'date-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('2015-07-14');
      });
    });
    describe('time-input', () => {
      test("Returns empty string if 'initializeWithCurrent' is false", () => {
        expect(getInitialValue({ type: 'time-input', name: '', label: '' })).toEqual('');
      });
      test('Returns current time as HH:mm if local timezone offset is zero', () => {
        mockDate.set({ offsetMinutes: 0 });
        mockDate.set({ isoDate: justAfterMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'time-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('00:05');
      });
      test('Returns current day if local timezone offset is positive, just after midnight', () => {
        mockDate.set({ offsetMinutes: 600 });
        mockDate.set({ isoDate: justAfterMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'time-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('00:05');
      });
      test('Returns current day if local timezone offset is negative, just after midnight', () => {
        mockDate.set({ offsetMinutes: -600 });
        mockDate.set({ isoDate: justAfterMidnight().toISOString() });
        console.log(new Date().toISOString());
        const val = getInitialValue({ type: 'time-input', name: '', label: '', initializeWithCurrent: true });
        expect(val).toEqual('00:05');
      });
    });
  });
  describe('radio-input', () => {
    test('default option not set - empty string', () => {
      expect(getInitialValue({ type: 'radio-input', name: '', label: '', options: [] })).toEqual('');
    });
    test('default option set - returns default option', () => {
      expect(
        getInitialValue({ type: 'radio-input', name: '', label: '', options: [], defaultOption: 'DEFAULT VALUE' }),
      ).toEqual('DEFAULT VALUE');
    });
  });
  describe('checkbox', () => {
    test('initialChecked not set - false', () => {
      expect(getInitialValue({ type: 'checkbox', name: '', label: '' })).toEqual(false);
    });
    test('initialChecked set - initialChecked value', () => {
      expect(getInitialValue({ type: 'checkbox', name: '', label: '', initialChecked: true })).toEqual(true);
      expect(getInitialValue({ type: 'checkbox', name: '', label: '', initialChecked: false })).toEqual(false);
    });
  });
  describe('mixed-checkbox', () => {
    test('initialChecked not set - false', () => {
      expect(getInitialValue({ type: 'mixed-checkbox', name: '', label: '' })).toEqual('mixed');
    });
    test('initialChecked set - initialChecked value', () => {
      expect(getInitialValue({ type: 'mixed-checkbox', name: '', label: '', initialChecked: true })).toEqual(true);
      expect(getInitialValue({ type: 'mixed-checkbox', name: '', label: '', initialChecked: false })).toEqual(false);
    });
  });
  describe('select', () => {
    test('defaultOption not set - first option value', () => {
      expect(
        getInitialValue({ type: 'select', name: '', label: '', options: [{ value: 'FIRST VALUE', label: '' }] }),
      ).toEqual('FIRST VALUE');
    });
    test('defaultOption set - returns defaultOption', () => {
      expect(
        getInitialValue({
          type: 'select',
          name: '',
          label: '',
          options: [],
          defaultOption: { value: 'DEFAULT VALUE' },
        }),
      ).toStrictEqual({ value: 'DEFAULT VALUE' });
    });
    test('defaultOption not set and no options defined - throws', () => {
      expect(() => getInitialValue({ type: 'select', name: '', label: '', options: [] })).toThrow();
    });
  });
  test('dependent-select with defaultOption set - defaultOption value', () => {
    expect(
      getInitialValue({
        type: 'dependent-select',
        name: '',
        label: '',
        options: { x: [] },
        dependsOn: '',
        defaultOption: { value: 'DEFAULT VALUE', label: '' },
      }),
    ).toEqual('DEFAULT VALUE');
  });
});
