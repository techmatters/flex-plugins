import { saveToHrm } from '../components/HrmFormController';

const HANDLE_CHANGE = 'HANDLE_CHANGE';
// const HANDLE_CALLTYPE_BUTTON_CLICK = 'HANDLE_CALLTYPE_BUTTON_CLICK';
const INITIALIZE_CONTACT_STATE = 'INITIALIZE_CONTACT_STATE';
const SAVE_CONTACT_STATE = 'SAVE_CONTACT_STATE';
const REMOVE_CONTACT_STATE = 'REMOVE_CONTACT_STATE';

const initialState = {
  tasks: { }
};

const taskInitialStateFactory = () => {
    return {
      callType: '',
      internal: {
        tab: 0
      },
      callerInformation: {
        name: {
          firstName: '',
          lastName: ''
        },
        relationshipToChild: '',
        gender: '',
        age: '',
        language:'',
        nationality: '',
        ethnicity: '',
        location: {
          streetAddress: '',
          city: '',
          stateOrCounty: '',
          postalCode: '',
          phone1: '',
          phone2: ''
        }
      },
      childInformation: {
        name: {
          firstName: '',
          lastName: ''
        },
        gender: '',
        age: '',
        language:'',
        nationality: '',
        ethnicity: '',
        school: {
          name: '',
          gradeLevel: ''
        },
        location: {
          streetAddress: '',
          city: '',
          stateOrCounty: '',
          postalCode: '',
          phone1: '',
          phone2: ''
        },
        refugee: false,
        disabledOrSpecialNeeds: false,
        hiv: false
      },
      caseInformation: {
        categories: {
          category1: {
            sub1: false,
            sub2: false,
            sub3: false,
            sub4: false,
            sub5: false,
            sub6: false,
          },
          category2: {
            sub1: false,
            sub2: false,
            sub3: false,
            sub4: false,
            sub5: false,
            sub6: false,
          },
          category3: {
            sub1: false,
            sub2: false,
            sub3: false,
            sub4: false,
            sub5: false,
            sub6: false,
          },
          category4: {
            sub1: false,
            sub2: false,
            sub3: false,
            sub4: false,
            sub5: false,
            sub6: false,
          },
          category5: {
            sub1: false,
            sub2: false,
            sub3: false,
            sub4: false,
            sub5: false,
            sub6: false,
          },
          category6: {
            sub1: false,
            sub2: false,
            sub3: false,
            sub4: false,
            sub5: false,
            sub6: false,
          }
        },
        callSummary: '',
        referredTo: '',
        status: 'In Progress',
        keepConfidential: true,
        okForCaseWorkerToCall: false,
        howDidTheChildHearAboutUs: '',
        didYouDiscussRightsWithTheChild: false,
        didTheChildFeelWeSolvedTheirProblem: false,
        wouldTheChildRecommendUsToAFriend: false
      }
    };
};

export class Actions {
  // static handleChange = (taskId, parents, e) => ({type: HANDLE_CHANGE, name: e.currentTarget.name, value: e.currentTarget.value, taskId: taskId, parents: parents});
  static handleChange = function(taskId, parents, e) {
    console.log(e);
    return {type: HANDLE_CHANGE, name: e.target.name || e.currentTarget.name, value: e.target.value || e.currentTarget.value, taskId: taskId, parents: parents};
  };
  // This makes me so sad too
  static handleCheckbox = (taskId, parents, name, value) => ({type: HANDLE_CHANGE, name: name, taskId: taskId, value: value, parents: parents});
  // There has to be a better way to do this rather than a one-off, but MUI does not make it easy
  // static handleCallTypeButtonClick = (taskId, value, e) => ({type: HANDLE_CALLTYPE_BUTTON_CLICK, taskId: taskId, value: value});
  static handleCallTypeButtonClick = (taskId, value, e) => ({type: HANDLE_CHANGE, name: 'callType', taskId: taskId, value: value, parents: []});
  static initializeContactState = (taskId) => ({type: INITIALIZE_CONTACT_STATE, taskId: taskId});
  // I'm really not sure if this should live here, but it seems like we need to come through the store
  static saveContactState = (taskId, abortFunction) => ({type: SAVE_CONTACT_STATE, taskId: taskId, abortFunction: abortFunction});
  static removeContactState = (taskId) => ({type: REMOVE_CONTACT_STATE, taskId: taskId});
}

function editNestedField(original, parents, name, value) {
  if (parents.length === 0) {
    return { 
      ...original,
      [name] : value
    };
  }
  return {
    ...original,
    [parents[0]]: editNestedField(original[parents[0]], parents.slice(1), name, value)
  }
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case HANDLE_CHANGE: {
      console.log("!!!!!!!!!!!HANDLE CHANGE: action.name = " + action.name + ", action.value = " + action.value + ", task = " + action.taskId + ", parents: " + action.parents);
      // let updatedContactForm = state.tasks[action.taskId];
      // updatedContactForm = {
      //   ...updatedContactForm,
      //   [action.name]: action.value
      // };
      // we could probably replace the below if/else by having the first argument to editNestedField be
      //  state.tasks[action.taskId] || taskInitialStateFactory()
      // but I want to be more explicit and log it.  Redux gets purged if there's a refresh and that's messy
      var currentForm;
      if (state.tasks[action.taskId]) {
        currentForm = state.tasks[action.taskId];
      } else {
        currentForm = taskInitialStateFactory();
        console.log("Had to recreate state for taskId " + action.taskId);
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: editNestedField(currentForm,
                                           action.parents,
                                           action.name,
                                           action.value)
        }
      };
    }

    case INITIALIZE_CONTACT_STATE: {
      console.log("!!!!!!!!!CREATING NEW ENTRY FOR " + action.taskId);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskInitialStateFactory()
        }
      }
    }

    case SAVE_CONTACT_STATE: {
      // TODO(nick): Make this a Promise instead?
      saveToHrm(state.tasks[action.taskId], action.abortFunction);
      return state;
    }

    case REMOVE_CONTACT_STATE: {
      console.log("!!!!!!!!!DELETING ENTRY FOR " + action.taskId);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: undefined
        }
      }
    }

    default:
      return state;
  }
}
