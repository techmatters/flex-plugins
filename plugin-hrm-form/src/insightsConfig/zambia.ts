import { FieldType, InsightsConfigSpec, InsightsObject } from './types';

// Should we remove this file? This information is now part of definition version
const zambiaInsightsConfig: InsightsConfigSpec = {
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
       * province;district => customers.area is hard-coded elsewhere
       */
      {
        name: 'postalCode',
        insights: [InsightsObject.Customers, 'zip'],
      },
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
    // Note: the Contact Summary tab is called caseInformation for legacy reasons
    caseInformation: [
      {
        name: 'repeatCaller',
        insights: [InsightsObject.Conversations, 'conversation_attribute_7'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'actionTaken',
        insights: [InsightsObject.Conversations, 'initiative'],
      },
      {
        name: 'howDidYouKnowAboutOurLine',
        insights: [InsightsObject.Conversations, 'conversation_attribute_5'],
      },
      {
        name: 'didTheChildFeelWeSolvedTheirProblem',
        insights: [InsightsObject.Conversations, 'productive'],
        type: FieldType.MixedCheckbox,
      },
      {
        name: 'wouldTheChildRecommendUsToAFriend',
        insights: [InsightsObject.Conversations, 'conversation_attribute_6'],
        type: FieldType.MixedCheckbox,
      },
    ],
  },
  caseForm: {
    topLevel: [
      {
        name: 'id',
        insights: [InsightsObject.Conversations, 'case'],
      },
    ],
    perpetrator: [
      {
        name: 'relationshipToChild',
        insights: [InsightsObject.Customers, 'organization'],
      },
      {
        name: 'gender',
        insights: [InsightsObject.Conversations, 'followed_by'],
      },
      {
        name: 'age',
        insights: [InsightsObject.Conversations, 'preceded_by'],
      },
    ],
    incident: [
      {
        name: 'duration',
        insights: [InsightsObject.Conversations, 'in_business_hours'],
      },
      {
        name: 'location',
        insights: [InsightsObject.Customers, 'market_segment'],
      },
    ],
    referral: [
      {
        name: 'referredTo',
        insights: [InsightsObject.Customers, 'customer_manager'],
      },
    ],
  },
};
