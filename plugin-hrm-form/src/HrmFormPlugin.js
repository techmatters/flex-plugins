import * as Flex from '@twilio/flex-ui';
import { FlexPlugin, loadCSS } from 'flex-plugin';
import SyncClient from 'twilio-sync';

import './styles/GlobalOverrides';
import reducers, { namespace, configurationBase } from './states';
import HrmTheme from './styles/HrmTheme';
import { transferModes } from './states/DomainConstants';
import { initLocalization } from './utils/pluginHelpers';
import * as ActionFunctions from './utils/setUpActions';
import * as Components from './utils/setUpComponents';
import setUpMonitoring from './utils/setUpMonitoring';
import * as TransferHelpers from './utils/transfer';
import { changeLanguage } from './states/configuration/actions';
import { issueSyncToken } from './services/ServerlessService';

const PLUGIN_NAME = 'HrmFormPlugin';

export const DEFAULT_TRANSFER_MODE = transferModes.cold;

/**
 * Sync Client used to store and share documents across counselors
 * @type {SyncClient}
 */
let sharedStateClient;

export const getConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = `${manager.serviceConfiguration.attributes.hrm_base_url}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}`;
  const serverlessBaseUrl = manager.serviceConfiguration.attributes.serverless_base_url;
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
  const chatServiceSid = manager.serviceConfiguration.chat_service_instance_sid;
  const workerSid = manager.workerClient.sid;
  const { helpline, counselorLanguage } = manager.workerClient.attributes;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;
  const counselorName = manager.workerClient.attributes.full_name;
  const isSupervisor = manager.workerClient.attributes.roles.includes('supervisor');
  const {
    helplineLanguage,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
  } = manager.serviceConfiguration.attributes;
  const featureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  /**
   *  @type {{ strings: { [key: string]: string } }}
   */
  const { strings } = manager;
  // console.log(
  //   '------getConfig------',
  //   '\n\nmanager.worder',manager.workerClient,
  //   '\n\nhrmBaseUrl',hrmBaseUrl,
  //   '\n\nserverlessBaseUrl',serverlessBaseUrl,
  //   '\n\nlogoUrl',logoUrl,
  //   '\n\nchatServiceSid',chatServiceSid,
  //   '\n\nworkerSid',workerSid,
  //   '\n\nhelpline',helpline,
  //   '\n\ncurrentWorkspace',currentWorkspace,
  //   '\n\ncounselorLanguage',counselorLanguage,
  //   '\n\nhelplineLanguage',helplineLanguage,
  //   '\n\nidentity',identity,
  //   '\n\ntoken',token,
  //   '\n\ncounselorName',counselorName,
  //   '\n\nisSupervisor',isSupervisor,
  //   '\n\nfeatureFlags',featureFlags,
  //   '\n\nsharedStateClient',sharedStateClient,
  //   '\n\nstrings',strings,
  //   '\n\ndefinitionVersion',definitionVersion,
  //   '\n\npdfImagesSource',pdfImagesSource,
  //   '\n\nmultipleOfficeSupport',multipleOfficeSupport,
  //   '\n\npermissionConfig',permissionConfig
  // )
  return {
    hrmBaseUrl,
    serverlessBaseUrl,
    logoUrl,
    chatServiceSid,
    workerSid,
    helpline,
    currentWorkspace,
    counselorLanguage,
    helplineLanguage,
    identity,
    token,
    counselorName,
    isSupervisor,
    featureFlags,
    sharedStateClient,
    strings,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
  };
};
// console.log(getConfig())


/**
 * Helper to expose the forms definitions without the need of calling Manager
 * @returns {{currentDefinitionVersion: import('./states/configuration/reducer').ConfigurationState['currentDefinitionVersion'], definitionVersions: import('./states/configuration/reducer').ConfigurationState['definitionVersions']}}
 */
export const getDefinitionVersions = () => {
  const { currentDefinitionVersion, definitionVersions } = Flex.Manager.getInstance().store.getState()[namespace][
    configurationBase
  ];
  return { currentDefinitionVersion, definitionVersions };
};

export const reRenderAgentDesktop = async () => {
  await Flex.Actions.invokeAction('NavigateToView', { viewName: 'empty-view' });
  await Flex.Actions.invokeAction('NavigateToView', { viewName: 'agent-desktop' });
};

const setUpSharedStateClient = () => {
  const updateSharedStateToken = async () => {
    try {
      const syncToken = await issueSyncToken();
      await sharedStateClient.updateToken(syncToken);
    } catch (err) {
      console.error('SYNC TOKEN ERROR', err);
    }
  };

  // initializes sync client for shared state
  const initSharedStateClient = async () => {
    try {
      const syncToken = await issueSyncToken();
      sharedStateClient = new SyncClient(syncToken);
      sharedStateClient.on('tokenAboutToExpire', () => updateSharedStateToken());
    } catch (err) {
      console.error('SYNC CLIENT INIT ERROR', err);
    }
  };

  initSharedStateClient();
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpTransferredTaskJanitor = async setupObject => {
  const { workerSid } = setupObject;
  const query = 'data.attributes.transferStarted == "true"';
  const reservationQuery = await Flex.Manager.getInstance().insightsClient.liveQuery('tr-reservation', query);
  reservationQuery.on('itemUpdated', args => {
    if (TransferHelpers.shouldInvokeCompleteTask(args.value, workerSid)) {
      Flex.Actions.invokeAction('CompleteTask', { sid: args.value.reservation_sid });
      return;
    }

    if (TransferHelpers.shouldTakeControlBack(args.value, workerSid)) {
      const task = Flex.TaskHelper.getTaskByTaskSid(args.value.attributes.transferMeta.originalReservation);
      TransferHelpers.takeTaskControl(task).then(async () => {
        await TransferHelpers.clearTransferMeta(task);
      });
    }
  });
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpTransfers = setupObject => {
  setUpSharedStateClient();
  setUpTransferredTaskJanitor(setupObject);
};

/**
 * @param {ReturnType<typeof getConfig>} config
 */
const setUpLocalization = config => {
  const manager = Flex.Manager.getInstance();

  const { counselorLanguage, helplineLanguage } = config;

  const twilioStrings = { ...manager.strings }; // save the originals
  const setNewStrings = newStrings => (manager.strings = { ...manager.strings, ...newStrings });
  const afterNewStrings = language => {
    manager.store.dispatch(changeLanguage(language));
    Flex.Actions.invokeAction('NavigateToView', { viewName: manager.store.getState().flex.view.activeView }); // force a re-render
  };
  const localizationConfig = { twilioStrings, setNewStrings, afterNewStrings };
  const initialLanguage = counselorLanguage || helplineLanguage;

  return initLocalization(localizationConfig, initialLanguage);
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpComponents = setupObject => {
  const { helpline, featureFlags } = setupObject;

  // setUp (add) dynamic components
  Components.setUpQueuesStatusWriter(setupObject);
  Components.setUpQueuesStatus();
  Components.setUpAddButtons(setupObject);
  Components.setUpNoTasksUI(setupObject);
  Components.setUpCustomCRMContainer();
  Components.setupTwitterChatChannel();
  if (featureFlags.enable_transfers) {
    Components.setUpTransferComponents();
    Components.setUpIncomingTransferMessage();
  }

  if (featureFlags.enable_case_management) Components.setUpCaseList();

  if (!Boolean(helpline)) Components.setUpDeveloperComponents(setupObject); // utilities for developers only

  // remove dynamic components
  Components.removeTaskCanvasHeaderActions(setupObject);
  Components.setLogo(setupObject.logoUrl);
  if (featureFlags.enable_transfers) {
    Components.removeDirectoryButton();
    Components.removeActionsIfTransferring();
  }

  Components.setUpStandaloneSearch();

  if (featureFlags.enable_canned_responses) Components.setupCannedResponses();
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
const setUpActions = setupObject => {
  const { featureFlags } = setupObject;

  // Is this the correct place for this call?
  ActionFunctions.loadCurrentDefinitionVersion();

  ActionFunctions.setUpPostSurvey(setupObject);

  // bind setupObject to the functions that requires some initializaton
  const transferOverride = ActionFunctions.customTransferTask(setupObject);
  const wrapupOverride = ActionFunctions.wrapupTask(setupObject);
  const beforeCompleteAction = ActionFunctions.beforeCompleteTask(setupObject);
  const afterCompleteAction = ActionFunctions.afterCompleteTask(setupObject);

  Flex.Actions.addListener('beforeAcceptTask', ActionFunctions.initializeContactForm);

  Flex.Actions.addListener('afterAcceptTask', ActionFunctions.afterAcceptTask(setupObject));

  if (featureFlags.enable_transfers) Flex.Actions.replaceAction('TransferTask', transferOverride);

  if (featureFlags.enable_transfers)
    Flex.Actions.addListener('afterCancelTransfer', ActionFunctions.afterCancelTransfer);

  Flex.Actions.replaceAction('HangupCall', ActionFunctions.hangupCall);

  Flex.Actions.replaceAction('WrapupTask', wrapupOverride);

  Flex.Actions.addListener('beforeCompleteTask', beforeCompleteAction);

  Flex.Actions.addListener('afterCompleteTask', afterCompleteAction);
};

export default class HrmFormPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    loadCSS('https://use.fontawesome.com/releases/v5.15.1/css/solid.css');

    if (process.env.NODE_ENV !== 'development')
      setUpMonitoring(this, manager.workerClient, manager.serviceConfiguration);

    console.log(`Welcome to ${PLUGIN_NAME}`);
    this.registerReducers(manager);

    const config = getConfig();

    /*
     * localization setup (translates the UI if necessary)
     * WARNING: the way this is done right now is "hacky". More info in initLocalization declaration
     */
    const { translateUI, getMessage } = setUpLocalization(config);

    const setupObject = { ...config, translateUI, getMessage };

    if (config.featureFlags.enable_transfers) setUpTransfers(setupObject);
    setUpComponents(setupObject);
    setUpActions(setupObject);

    const managerConfiguration = {
      colorTheme: HrmTheme,
    };
    manager.updateConfig(managerConfiguration);

    // TODO(nick): Eventually remove this log line or set to debug.  Should we fail hard here?
    const { hrmBaseUrl } = config;
    console.log(`HRM URL: ${hrmBaseUrl}`);
    if (hrmBaseUrl === undefined) {
      console.error('HRM base URL not defined, you must provide this to save program data');
    }
  }

  /**
   * Registers the plugin reducers
   *
   * @param {import('@twilio/flex-ui').Manager} manager
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${Flex.VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
/**
 * ------getConfig------ 

manager 
Proxy { <target>: {…}, <handler>: {…} }
 

hrmBaseUrl https://hrm-development.tl.techmatters.org/v0/accounts/ACd8a2e89748318adf6ddff7df6948deaf 

serverlessBaseUrl https://serverless-9971-production.twil.io 

logoUrl https://aselo-logo.s3.amazonaws.com/145+transparent+background+no+TM.png 

chatServiceSid IS43c487114db441beaad322a360117882 

workerSid WKc2cff659f36dcc9daac0663b88922a87 

helpline <empty string> 

currentWorkspace WSc92e431ee05a5d0ac322f6c886c4aee2 

counselorLanguage undefined 

helplineLanguage undefined 

identity mythily@techmatters.org 

token eyJ6aXAiOiJERUYiLCJjdHkiOiJ0d2lsaW8tZnBhO3Y9MSIsImVuYyI6IkEyNTZHQ00iLCJhbGciOiJkaXIiLCJ0d3IiOiJ1czEiLCJraWQiOiJTQVNfUzNfX19LTVNfdjEifQ..HPLkcEK5a9IRW_eo.vEjGdAxIHmxuMl2y9E1QOfI7duE-286rdfJUQoIFBO8yvRfk7j3f01j6Nn7QIebj-pyPdiqr6IDyR_e39aD8NXi5DkS3h8k4RIx06e8dVkHvXvxWG0-Eaj-16JZGgMl3KuHc2UnclHoV8iPCWVErSsCEesqQC4vCh518nWX6nM7AbPO_easKu7nHZuTfA5bq62js7O3Ba2XMoAp0kSVyd73-IyvJqTuwyHv-wQHiJ72xZABu3tbNYvw8VLsRU9lJnX9fDkakjLJp_XkrqmFsJxkFtty1FwFB8y6ZtBp338Se-LJJHXOIKW1vlyTXeji7_hawELfRmW6l5zlU4P-mAfPGy0eLuBEU4YnpW0wzFN0X52b9P8OESgescgUiWC_z1CcCZCTLsWUlQuA3sJCi64tqVgQoG2rkMjR6fjA-KBx-YUHBu88zYv2jFVKB9WjwzkdgEG2vn_9N52IclYvYTkCF0S-OARP9W4pRzVyZJ2AIHXRBrbGf7IDLF9OPaQtCitggPu1VgJ9hokZOiOjSEvtlEugl_qmnRIo7CG4miPpWhAaP1TqfqK0X-dxMuXXolFX10Gf9qAT_caw7MlsiX0SxwxJiWrZuDTuH0ib3c6fmnN6_nlBqxO5RN4WHV2fHyGCqeTya81FY7Erah9xguXd_eBVZpZg-QdGJD4vrYyiyqRH5sNUnjSrnF9fwymKGEEHdOc1I5vgFbtdfDweyZELIWPGj0lRYRlbyrp8KTRU-4y6FdEdX0Z637Dk0pu2cQjjXjrPJ3urkCR5_zGl4a2xuo9E9dONcawlY23GthKQa4D3FeFlcPR7jLFFZB-2HeEHCUSrD2bYjb9WdDyQV6VoMp_ThwINA2qCEJz0vmlWW8C-ioXtaD5PUG1Rp6x_6DsKVqQyBQ5hWrN-sANYT5IK741L23wwWt_oCFlYOH41x7bsvsxpfq8a6PJDD5t8qCXKMIBFuD_Zm5o179bRsVnMH2IdxCy57mgat5C0SrTkBNSjHFiTKrHtFWKuwNgU-C0IktNOL8lzr9jtWwvIVbmDqY1jE9Lwgqbmd1Bbnz6aThk_K6iUrjonPWMs1u_Kr_m1LVZO3j8D8er8aY9wR1kJahM1_1nTL9C2YICyTpiAsi9ZhxuNFSijho5nWBn_2Nzg7w-DhGtOsNpOE8TvFimUcVVZR8ZJUGvM8gzEkb3wcwcj9GP1lmWksCy9gswuR-rOWouJI83G-kA3YZKkqcdjp6lDRlPdI_9433o4aHedMOm-BklYHoM0WO4aZqZTn5CDgT8wUKUqCggRWqLYFW8V6NXzoM0LHjWi_eFEMoKit8n9w85sGZOHUrrvPxJXs15BQiD_uVpqCps68_nB8Rw8-rGFMtuhz5VErjsB0YYPVWQXR2XotlV8EdpLyhs9FsHwup_GDKtIkVX_X8lCF7-siK7O4OgBAe9NhNQPWsbl09FxKXeWeLN2XqauUhP5NLM8prNb3R_wjRdMEhwKIfbQDpU6Vy_YN89AXdV073q74VbHN24Hyj4YoLiZkR9kq7ikGxd_hELwMLf-7Y7QKvSqKPcCN_y4L7AAhH6_o7HWALyqDfh0prm4RetKP7Hy2fNuytZfOinUEJSkqUuWECMYlZnVus87VJer4K2f9L3L5u3Wtlm3pESetu9RnUM1O4UbYBtlWqXsPbFNJ3mvCKJwNGgWYqoE8ZVfsnJlnqP0GCFfshvDGqL-w5uF8cd3JFZCS_6Bp3tTWAhipm7NUxRvWcHM7VoHynpIwKS6v2rc4D7Uz6aXK-slyGG8z4ZVETEdRBsYMTZABMXvqSP14BlkDFHg8JF72vGubNtziA-dWzL_UBxwPjZNtlngc9-1eLkATmHkZrR3c1wL_F5aRZqwlRHDtkPyWzfGhV9Dvrmw1uq8QHoqxQXCta_WuotaCM_VS0hFzzPfUEDxV19dATTACBxHB__zDz8sR3AGqyP-6YhovcXhk_y3Rn3dYhbxgYfPaDnv1OaQHAixdd9FbzqopCxwAZw1rePcIWCe0TFRiZZAmmJsG-ZhtksM4UY3VTGbCmSS6oIxcUuh_z4LYuxu8XDmVSXNmkZLZWSl0peomML4U7iN7PgGk9ExSI35N2z4H0_BzSXWbJasH.dEDIpmdpN2wl4Y2aJIuzFw 

counselorName Mythily Mudunuru 

isSupervisor false 

featureFlags 
Object { enable_fullstory_monitoring: true, enable_upload_documents: true, enable_previous_contacts: true, enable_case_management: true, enable_offline_contact: true, enable_transfers: true, enable_manual_pulling: true, enable_csam_report: true, enable_canned_responses: true, enable_dual_write: false, … }
 

sharedStateClient undefined 

strings 
Object { InputPlaceHolder: "Type message", TypingIndicator: "{{name}} is typing … ", TypingIndicatorMultiple: "{{count}} people are typing … ", Connecting: "Connecting …", Disconnected: "Connection lost", Read: "Read", MessageSendingDisabled: "Message sending has been disabled", Today: "TODAY", Yesterday: "YESTERDAY", MessageCanvasTrayContent: "\n        <h6>Complete</h6>\n        <p>This chat is no longer active.</p>", … }
 

definitionVersion v1 

pdfImagesSource https://tl-public-chat-zm-staging.s3.amazonaws.com 

multipleOfficeSupport true 

permissionConfig zm twilio-flex.unbundled-react.min.js:1476:254950


 */