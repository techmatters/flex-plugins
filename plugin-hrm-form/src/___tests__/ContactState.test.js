import { editNestedField } from '../states/ContactState';

describe('editedNestedField', () => {
  const original = {      
    callType: '',
    internal: {
      tab: 0
    },
    callerInformation: {
      name: {
        firstName: {
          value: '',
          touched: false,
          error: null
        },
        lastName: ''
      }
    },
    childInformation: {
      name: {
        firstName: '',
        lastName: ''
      }
    }
  };

  test('edits a normal nested field', () => {
    const expected = {      
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: {
            value: '',
            touched: false,
            error: null
          },
          lastName: ''
        }
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: 'aNewLastName'
        }
      }
    };
    expect(editNestedField(original, ['childInformation', 'name'], 'lastName', 'aNewLastName'))
      .toStrictEqual(expected);
  });

  test('edits callerInformation firstName all special like', () => {
    const expected = {      
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: {
            value: 'aNewFirstName',
            touched: false,
            error: null
          },
          lastName: ''
        }
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: ''
        }
      }
    };
    expect(editNestedField(original, ['callerInformation', 'name'], 'firstName', 'aNewFirstName'))
      .toStrictEqual(expected);
  })
});