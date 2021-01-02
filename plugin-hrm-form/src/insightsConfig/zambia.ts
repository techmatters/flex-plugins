import { FieldType, InsightsConfigSpec, InsightsObject } from './types';

export const zambiaInsightsConfig: InsightsConfigSpec = {
  contactForm: {
    callerInformation: [
      {
        name: 'relationshipToChild',
        insights: [InsightsObject.Conversations, 'initiated_by'],
      },
      {
        name: 'gender',
        insights: [InsightsObject.Conversations, 'conversation_attribute_4'],
      },
      {
        name: 'age',
        insights: [InsightsObject.Conversations, 'conversation_attribute_3'],
      },
    ],
    childInformation: [
      {
        name: 'village',
        insights: [InsightsObject.Customers, 'city'],
      },
      /*
       * province/district => customers.area is hard-coded
       * Postal code TBD
       * phone #1 TBD
       */
      {
        name: 'gender',
        insights: [InsightsObject.Customers, 'gender'],
      },
      {
        name: 'age',
        insights: [InsightsObject.Customers, 'year_of_birth'],
      },
      {
        name: 'language',
        insights: [InsightsObject.Conversations, 'language'],
      },
      {
        name: 'ethnicity',
        insights: [InsightsObject.Customers, 'customer_attribute_2'],
      },
      {
        name: 'gradeLevel',
        insights: [InsightsObject.Customers, 'acquisition_date'],
      },
      {
        name: 'livingSituation',
        insights: [InsightsObject.Customers, 'customer_attribute_1'],
      },
      {
        name: 'hivPositive',
        insights: [InsightsObject.Customers, 'category'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'inConflictWithTheLaw',
        insights: [InsightsObject.Conversations, 'conversation_measure_1'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'livingInConflictZone',
        insights: [InsightsObject.Conversations, 'conversation_measure_2'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'livingInPoverty',
        insights: [InsightsObject.Conversations, 'conversation_measure_3'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'memberOfAnEthnic',
        insights: [InsightsObject.Conversations, 'conversation_measure_4'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'childOnTheMove',
        insights: [InsightsObject.Customers, 'email'],
      },
      {
        name: 'childWithDisability',
        insights: [InsightsObject.Customers, 'customer_attribute_3'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'LGBTQI+',
        insights: [InsightsObject.Conversations, 'conversation_measure_5'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'region',
        insights: [InsightsObject.Customers, 'region'],
      },
    ],
  },
};
