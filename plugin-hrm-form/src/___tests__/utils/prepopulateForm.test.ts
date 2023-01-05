import { getValuesFromPreEngagementData } from '../../utils/prepopulateForm';

test('Test getValuesFromPreengagementData function - Retrieve values saved in redux used by contactForm from preEngagementData', () => {
  const preEngagementData1 = {
    upsetLevel: '1',
    gender: 'Agender',
    friendlyName: 'Anonymous',
    age: '11',
  };
  const tabFormDefinition1 = [
    {
      name: 'firstName',
      label: 'ID',
      type: 'input',
    },
    {
      name: 'age',
      label: 'Age',
      type: 'select',
      options: [
        {
          value: '',
          label: '',
        },
        {
          value: '5 or younger',
          label: '5 or younger',
        },
        {
          value: '06',
          label: '6',
        },
        {
          value: '07',
          label: '7',
        },
        {
          value: '08',
          label: '8',
        },
        {
          value: '09',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '>30',
          label: '>30',
        },
        {
          value: 'Unknown',
          label: 'Did not disclose/Did not ask',
        },
      ],
      required: {
        value: true,
        message: 'RequiredFieldError',
      },
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'listbox-multiselect',
      options: [
        {
          value: 'Agender',
          label: 'Agender',
        },
        {
          value: 'Cis Male/Man',
          label: 'Cis Male/Man',
        },
        {
          value: 'Cis Female/Woman',
          label: 'Cis Female/Woman',
        },
        {
          value: 'Non-Binary/Genderqueer/Gender fluid',
          label: 'Non-Binary/Genderqueer/Gender fluid',
        },
        {
          value: 'Two-Spirit',
          label: 'Two-Spirit',
        },
        {
          value: 'Trans Female/Woman',
          label: 'Trans Female/Woman',
        },
        {
          value: 'Trans Male/Man',
          label: 'Trans Male/Man',
        },
        {
          value: 'Other',
          label: 'Other',
        },
        {
          value: 'Unknown',
          label: 'Unknown/Did not disclose/Did not ask',
        },
      ],
      required: {
        value: true,
        message: 'RequiredFieldError',
      },
    },
    {
      name: 'otherGender',
      label: 'If Other for Gender, please specify: ',
      type: 'input',
    },
  ];
  const prepopulateKeys1 = ['age', 'gender'];

  const values = getValuesFromPreEngagementData(preEngagementData1, tabFormDefinition1, prepopulateKeys1);

  const expectedValues = { age: '11', gender: 'Agender' };

  expect(values).toEqual(expectedValues);
});
