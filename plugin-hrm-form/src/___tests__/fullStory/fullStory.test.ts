import * as FullStory from '@fullstory/browser';

import { recordBackendError, recordEvent, recordFormValidationError, recordingErrorHandler } from '../../fullStory';

let mockEventThrow = false;

jest.mock('@fullstory/browser', () => ({
  event: jest.fn(() => {
    if (mockEventThrow) {
      throw new Error('BOOM');
    }
  }),
}));

describe('FullStory Custom Events', () => {
  const originalConsoleWarn = console.warn;
  beforeEach(() => {
    mockEventThrow = false;
    console.warn = jest.fn();
    (<jest.Mock>FullStory.event).mockClear();
  });
  afterEach(() => {
    console.warn = originalConsoleWarn;
  });
  describe('recordEvent', () => {
    test('Delegates parameters to FullStory.event', () => {
      const payload = {};
      recordEvent('Test Event', {});
      expect(FullStory.event).toBeCalledWith('Test Event', payload);
      expect(console.warn).not.toBeCalled();
    });

    test('Swallows exceptions from Fullstory.event and logs a warning', () => {
      mockEventThrow = true;
      const payload = {};
      recordEvent('Test Event', {});
      expect(FullStory.event).toBeCalledWith('Test Event', payload);
      expect(console.warn).toBeCalled();
    });
  });

  describe('recordBackendError', () => {
    beforeEach(() => {
      mockEventThrow = false;
      console.warn = jest.fn();
    });
    test("Sends 'Backend Error' to FullStory.event with message and stack", () => {
      const payload = {};
      try {
        throw new Error('Test Error');
      } catch (error) {
        error.stack = 'Stack that can be verified';
        recordBackendError('Testing Fullstory', error);
      }
      expect(FullStory.event).toBeCalledWith(
        'Backend Error',
        expect.objectContaining({
          // eslint-disable-next-line camelcase
          action_str: 'Testing Fullstory',
          // eslint-disable-next-line camelcase
          message_str: 'Test Error',
          // eslint-disable-next-line camelcase
          stack_str: 'Stack that can be verified',
        }),
      );
      expect(console.warn).not.toBeCalled();
    });
    test('Supplies placeholders if message and/or stack are absent', () => {
      const payload = {};

      recordBackendError('Testing Fullstory', <Error>{});
      expect(FullStory.event).toBeCalledWith(
        'Backend Error',
        expect.objectContaining({
          // eslint-disable-next-line camelcase
          action_str: 'Testing Fullstory',
          // eslint-disable-next-line camelcase
          message_str: expect.any(String),
          // eslint-disable-next-line camelcase
          stack_str: expect.any(String),
        }),
      );
      expect(console.warn).not.toBeCalled();
    });
  });
  describe('recordFormValidationError', () => {
    test("Records a 'Form Error' with origin and error object JSON when error object is simple key / value pairs ", () => {
      const payload = {
        propertyA: 'valueA',
        propertyB: 1,
      };

      recordFormValidationError('Test Form', payload);

      expect(FullStory.event).toBeCalledWith('Form Error', {
        // eslint-disable-next-line camelcase
        form_str: 'Test Form',
        // eslint-disable-next-line camelcase
        errors_str: JSON.stringify(payload),
      });
      expect(console.warn).not.toBeCalled();
    });
    test("Removes 'ref' property from key / value pairs ", () => {
      const originalPayload = {
        ref: 'something',
        propertyA: 'valueA',
        propertyB: 1,
      };

      const fullStoryPayload = {
        propertyA: 'valueA',
        propertyB: 1,
      };

      recordFormValidationError('Test Form', originalPayload);

      expect(FullStory.event).toBeCalledWith('Form Error', {
        // eslint-disable-next-line camelcase
        form_str: 'Test Form',
        // eslint-disable-next-line camelcase
        errors_str: JSON.stringify(fullStoryPayload),
      });
      expect(console.warn).not.toBeCalled();
    });

    test("Removes 'ref' property from nested key / value pairs ", () => {
      const originalPayload = {
        ref: 'something',
        propertyA: 'valueA',
        propertyB: 1,
        objectA: {
          innerPropA: 'innerValue1',
          innerObject: {
            deepPropA: 'deepValue1',
            ref: ['something', 'else'],
          },
        },
      };

      const fullStoryPayload = {
        propertyA: 'valueA',
        propertyB: 1,
        objectA: {
          innerPropA: 'innerValue1',
          innerObject: {
            deepPropA: 'deepValue1',
          },
        },
      };

      recordFormValidationError('Test Form', originalPayload);

      expect(FullStory.event).toBeCalledWith('Form Error', {
        // eslint-disable-next-line camelcase
        form_str: 'Test Form',
        // eslint-disable-next-line camelcase
        errors_str: JSON.stringify(fullStoryPayload),
      });
      expect(console.warn).not.toBeCalled();
    });

    test("Circular references other than those in 'ref' properties log warning and send event with no error data", () => {
      const originalPayload = {
        propertyA: 'valueA',
        propertyB: 1,
        objectA: {
          innerPropA: 'innerValue1',
        },
      };

      (<any>originalPayload.objectA).loopyProp = originalPayload.objectA;

      recordFormValidationError('Test Form', originalPayload);
      expect(FullStory.event).toBeCalledWith('Form Error', {
        // eslint-disable-next-line camelcase
        form_str: 'Test Form',
        // eslint-disable-next-line camelcase
        errors_str: '{}',
      });
      expect(console.warn).toBeCalled();
    });
  });
  describe('recordingErrorHandler', () => {
    test('Wraps existing error handler in function that records form error first, then runs original handler', () => {
      const mockErrorHandler = jest.fn();
      const wrappedHandler = recordingErrorHandler('Test Wrapping Form', mockErrorHandler);
      const payload = {
        propertyA: 'valueA',
        propertyB: 1,
      };

      wrappedHandler(payload);
      expect(FullStory.event).toBeCalledWith('Form Error', {
        // eslint-disable-next-line camelcase
        form_str: 'Test Wrapping Form',
        // eslint-disable-next-line camelcase
        errors_str: JSON.stringify(payload),
      });

      expect(mockErrorHandler).toBeCalledWith(payload);
    });
  });
});
