export const ValidationType = {
  REQUIRED: 'REQUIRED', // Will not be applied if in the callerInformation tab and callType is not caller.  Will not be applied when callType is standalone.
};
export const FieldType = {
  CALL_TYPE: 'CALL_TYPE',
  CHECKBOX: 'CHECKBOX',
  CHECKBOX_FIELD: 'CHECKBOX_FIELD',
  INTERMEDIATE: 'INTERMEDIATE',
  SELECT_SINGLE: 'SELECT_SINGLE',
  TAB: 'TAB',
  TEXT_BOX: 'TEXT_BOX',
  TEXT_INPUT: 'TEXT_INPUT',
};

export function isNotCategory(value) {
  const notCategory = ['error', 'touched', 'type', 'validation'];
  return notCategory.includes(value);
}

export function isNotSubcategory(value) {
  const notSubcategory = ['type'];
  return notSubcategory.includes(value);
}

// TODO: add tab order?

const defaultFormDefinition = {
  callType: {
    type: FieldType.CALL_TYPE,
  },
  callerInformation: {
    type: FieldType.TAB,
    name: {
      type: FieldType.INTERMEDIATE,
      firstName: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      lastName: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
    },
    relationshipToChild: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    gender: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    age: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    language: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    nationality: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    ethnicity: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    location: {
      type: FieldType.INTERMEDIATE,
      streetAddress: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      city: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      stateOrCounty: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      postalCode: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      phone1: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      phone2: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
    },
  },
  childInformation: {
    type: FieldType.TAB,
    name: {
      type: FieldType.INTERMEDIATE,
      firstName: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      lastName: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
    },
    gender: {
      type: FieldType.SELECT_SINGLE,
      validation: [ValidationType.REQUIRED],
    },
    age: {
      type: FieldType.SELECT_SINGLE,
      validation: [ValidationType.REQUIRED],
    },
    language: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    nationality: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    ethnicity: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    school: {
      type: FieldType.INTERMEDIATE,
      name: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      gradeLevel: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
    },
    location: {
      type: FieldType.INTERMEDIATE,
      streetAddress: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      city: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      stateOrCounty: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      postalCode: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      phone1: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
      phone2: {
        type: FieldType.TEXT_INPUT,
        validation: null,
      },
    },
    refugee: {
      type: FieldType.CHECKBOX,
      value: false,
    },
    disabledOrSpecialNeeds: {
      type: FieldType.CHECKBOX,
      value: false,
    },
    hiv: {
      type: FieldType.CHECKBOX,
      value: false,
    },
  },
  caseInformation: {
    type: FieldType.TAB,
    categories: {
      type: FieldType.CHECKBOX_FIELD,
      validation: [ValidationType.REQUIRED],
      'Missing children': {
        type: FieldType.INTERMEDIATE,
        'Child abduction': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Lost, injured or otherwise missing child': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        Runaway: {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      Violence: {
        type: FieldType.INTERMEDIATE,
        Bullying: {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Child / Early marriage': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Commercial sexual exploitation (offline)': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Economic exploitation': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Female Genital Mutilation (FGM)': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Gender-based harmful traditional practices (other than FGM)': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Harmful or hazardous labour': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Mental / Emotional violence': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Neglect (or negligent treatment)': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Non-Gender-Based harmful traditional practices': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Online sexual abuse': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Online sexual exploitation': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Physical violence': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Sexual violence': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      'Mental Health': {
        type: FieldType.INTERMEDIATE,
        'Addictive behaviours': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Concerns about the self': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Emotional distress – anger problems': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Emotional distress – fear and anxiety problems': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Emotional distress – mood problems': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Problems with eating behaviour': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Self-harming behaviours': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Substance use': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Suicidal thoughts and suicide attempts': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      'Physical Health': {
        type: FieldType.INTERMEDIATE,
        'Medical or lifestyle information about HIV/AIDS': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Medical problems': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Pregnancy and Maternal care': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Sexual and reproductive health': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      Accessibility: {
        type: FieldType.INTERMEDIATE,
        Education: {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Essential needs': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'General healthcare services': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Legal services and advice': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Mental health services': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Sexual health services': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Socio-economical services': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      'Discrimination and Exclusion': {
        type: FieldType.INTERMEDIATE,
        'Ethnicity/nationality': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Financial Situation': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Gender identity and expression/sexual identity': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        Health: {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Philosophical or religious beliefs': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      'Family Relationships': {
        type: FieldType.INTERMEDIATE,
        'Adoption, fostering, and extended family placement': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Relationship to parents': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Relationship with sibling(s)': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      'Peer Relationships': {
        type: FieldType.INTERMEDIATE,
        'Friends and Friendships': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Romantic Relationships': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      School: {
        type: FieldType.INTERMEDIATE,
        'Academic issues': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Teacher and school problems': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      Sexuality: {
        type: FieldType.INTERMEDIATE,
        'Sexuality and gender identity': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Sexual behaviours': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
      'Information & Other Non-Counselling contacts': {
        type: FieldType.INTERMEDIATE,
        'Complaints about the child helpline': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Questions by parents': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Questions about the child helpline': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Questions about other services': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        '"Thank you for your assistance"': {
          type: FieldType.CHECKBOX,
          value: false,
        },
        'Unspecified/Other': {
          type: FieldType.CHECKBOX,
          value: false,
        },
      },
    },
    callSummary: {
      type: FieldType.TEXT_BOX,
      validation: null,
    },
    referredTo: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    status: {
      value: 'In Progress',
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    keepConfidential: {
      type: FieldType.CHECKBOX,
      value: true,
    },
    okForCaseWorkerToCall: {
      type: FieldType.CHECKBOX,
      value: false,
    },
    howDidTheChildHearAboutUs: {
      type: FieldType.SELECT_SINGLE,
      validation: null,
    },
    didYouDiscussRightsWithTheChild: {
      type: FieldType.CHECKBOX,
      value: false,
    },
    didTheChildFeelWeSolvedTheirProblem: {
      type: FieldType.CHECKBOX,
      value: false,
    },
    wouldTheChildRecommendUsToAFriend: {
      type: FieldType.CHECKBOX,
      value: false,
    },
  },
  contactlessTask: {
    type: FieldType.INTERMEDIATE,
    channel: {
      type: FieldType.TEXT_INPUT,
      validation: null,
    },
    date: {
      type: FieldType.TEXT_INPUT,
      validation: null,
    },
    time: {
      type: FieldType.TEXT_INPUT,
      validation: null,
    },
  },
};

const recursivelyCreateBlankForm = formDefinition => {
  const initialState = {};

  Object.keys(formDefinition)
    .filter(key => key !== 'type' && key !== 'validation')
    .forEach(key => {
      switch (formDefinition[key].type) {
        case FieldType.CALL_TYPE:
          initialState[key] = {
            ...formDefinition[key],
            value: '',
          };
          break;
        case FieldType.CHECKBOX:
          initialState[key] = {
            value: false, // set default of false if not overridden
            ...formDefinition[key],
          };
          break;
        case FieldType.CHECKBOX_FIELD:
          initialState[key] = {
            ...recursivelyCreateBlankForm(formDefinition[key]),
            type: formDefinition[key].type,
            touched: false,
            validation: formDefinition[key].validation === null ? null : Array.from(formDefinition[key].validation),
            error: null,
          };
          break;
        case FieldType.INTERMEDIATE:
          initialState[key] = {
            ...recursivelyCreateBlankForm(formDefinition[key]),
            type: formDefinition[key].type,
          };
          break;
        case FieldType.TAB:
          initialState[key] = {
            ...recursivelyCreateBlankForm(formDefinition[key]),
            type: formDefinition[key].type,
          };
          break;
        case FieldType.SELECT_SINGLE:
        case FieldType.TEXT_BOX:
        case FieldType.TEXT_INPUT:
          initialState[key] = {
            value: '', // set default of empty if not overridden
            ...formDefinition[key],
            touched: false,
            error: null,
          };
          break;
        default:
          throw new Error(
            `Unknown FieldType ${formDefinition[key].type} for key ${key} in ${JSON.stringify(formDefinition)}`,
          );
      }
    });

  return initialState;
};

const createCategoriesMetadata = formDef => {
  const expanded = Object.keys(formDef.caseInformation.categories)
    .filter(key => !isNotCategory(key))
    .reduce((result, key) => ({ ...result, [key]: false }), {});

  return {
    gridView: false,
    expanded,
  };
};

/**
 * @param {any} formDef
 * The form definition we want to replicate.
 * @param {Boolean} recreated
 * Determines if we are initializing a form or recreating it
 * @returns {any}
 * A clean form plus metadata about it.
 * If the form was recreated, it won't have a "starting time".
 */
export const createBlankForm = (formDef = defaultFormDefinition, recreated = false) => {
  const initialState = recursivelyCreateBlankForm(formDef);
  const metadata = {
    startMillis: recreated ? null : new Date().getTime(),
    endMillis: null,
    tab: 1,
    recreated,
    categories: createCategoriesMetadata(formDef),
  };

  const generatedForm = { ...initialState, metadata };

  return generatedForm;
};

export const recreateBlankForm = () => {
  const recreatedForm = createBlankForm(defaultFormDefinition, true);

  return recreatedForm;
};
