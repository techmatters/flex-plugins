/* eslint-disable no-console */
import { URLSearchParams } from 'url';
import type { ALBEvent, ALBResult } from 'aws-lambda';

const productionAccountMap = {
  ZA_PRODUCTION: 'AC988e78b713be4a04246b39835de37ad4',
  ZM_PRODUCTION: 'ACf0b04d307d8f20074dc09cdb3b4f0a83',
  MW_PRODUCTION: 'AC926d9077405d7f5b4c7129d3087d7814',
  ET_PRODUCTION: 'AC16aa1fb9123860efd3bdde74de556e21',
  BR_PRODUCTION: 'AC98b66f5541f81de7050c7254cf5c96c9',
  IN_PRODUCTION: 'AC64efffad72dccd812ca0c156355217ed',
  JM_PRODUCTION: 'AC9fd261078d40fcfa06f0e374921af7a5',
  PH_PRODUCTION: 'ACd9d59ab87f24d9086b25a7e3c67b2231',
  CO_PRODUCTION: 'AC520ec62dcfa4ab4105c2f5850caf52b0',
  HU_PRODUCTION: 'AC378f491732fc29691b4126a2287cea9a',
  TH_PRODUCTION: 'AC77e853192a62159196decc2468243518',
  CA_PRODUCTION: 'AC9f951863c83dc61cf94bdc12a12270a5',
  ZW_PRODUCTION: 'ACd0db81cffec7eb658f6ee176a06dc902',
  CL_PRODUCTION: 'AC13e88b6577da29a0b35c0ea7939c3c22',
  AS_PRODUCTION: 'AC4858840776b1f98a1367c9c6a401bd2c',
  NZ_PRODUCTION: 'AC2825ea172ea83c2e422a9772a27beb29',
  USCR_PRODUCTION: 'AC34800d0cf642c95ce1f17785d239333c',
};

const productionAccounts = Object.values(productionAccountMap);

const stagingAccountMap = {
  ASELO_BETA: 'AC6b99858a6faf7af1b572c83988b50eb1',
  ZA_STAGING: 'AC16dd71c6fd135ee250bd213ad1efa2e8',
  ZM_STAGING: 'ACc59300c7ca018e8652e4d6d86c2d50e6',
  MW_STAGING: 'AC874af45ec4a696d5d4dca07b0036e2bf',
  ET_STAGING: 'ACfd932bd76669f9cc2145e67e6c3e03ea',
  BR_STAGING: 'AC4a92fba4d8040b1d6dbe2bbceee87cbf',
  IN_STAGING: 'AC3ee345e8fe8213010ff81fbe54b1414e',
  JM_STAGING: 'ACbc27263c18e621f3deb57cf1998a4e04',
  CA_STAGING: 'ACeb335f4685aa874fddf00cdd7c2946bd',
  PH_STAGING: 'ACa10989d583df770649051aee1430fce9',
  RO_STAGING: 'ACbeffd85714fecd060d38aa4d84c3fc03',
  HU_STAGING: 'ACbdbee34ef7d099e71cf095d540ff3270',
  CO_STAGING: 'AC76b8bd2798b01b067a1be7f17d36c894',
  TH_STAGING: 'AC58ec02594f3ca5225db71913b1cda612',
  CL_STAGING: 'AC6ca34b61e7bf2d7cf8b8ca24e7efe65f',
  ZW_STAGING: 'AC48d146ce2460184b8944cc7fdf8c5d25',
  PL_STAGING: 'ACb3da2ab24338c616db45ba3b4afce61a',
  MT_STAGING: 'ACfb0ccf10880289d67f5c4e85ae26402b',
  USCR_STAGING: 'AC3edc359b6a45de1a2f6078c7091c8fef',
  NZ_STAGING: 'AC3ee873a0431086e5b1166db5f5e29860',
  USCH_STAGING: 'AC147e360e21386797593c3893bf4def12',
  TZ_STAGING: 'AC94cb43c61dbc082094fb34cb147896eb',
  UKMH_STAGING: 'AC9eb11b6c714d785db648b6ea6a85c13f',
};

const stagingAccounts = Object.values(stagingAccountMap);

const developmentAccountMap = {
  ASELO_DEVELOPMENT: 'ACd8a2e89748318adf6ddff7df6948deaf',
};

const developmentAccounts = Object.values(developmentAccountMap);

type DebuggerEvent = {
  Sid: string; //	Unique identifier of this Debugger event.
  AccountSid: string; //	Unique identifier of the account that generated the Debugger event.
  ParentAccountSid: string; //	Unique identifier of the parent account. This parameter only exists if the above account is a subaccount.
  Timestamp: string; //	Time of occurrence of the Debugger event.
  Level: string; //	Severity of the Debugger event. Possible values are Error and Warning.
  PayloadType: string; //	application/json
  Payload: string; //	JSON data specific to the Debugger Event.
};

type DebuggerPayload = Partial<{
  resource_sid: string; // The ID of this Twilio Platform Resource that this error is associated with
  service_sid: string; // The ID of the Twilio Platform Service that this error is associated with
  error_code: string; // The unique error code for this debugging event
  more_info: {
    // A subdocument containing more information about this debugging event
    Msg?: string;
    EmailNotification?: string;
    contentType?: string;
    LogLevel?: string;
    url?: string;
  };
  webhook: {
    response?: {
      status_code: number;
      body?: string;
      headers?: { [k: string]: string };
    };
  }; // A subdocument containing Information about the request and response of the webhook associated with this debugging event.
}>;

const paramsToObject = (params: URLSearchParams) =>
  Array.from(params).reduce<{ [key: string]: string }>((acc, [k, v]) => {
    acc[k] = v;
    return acc;
  }, {});

// Twilio errors that may be omitted
const TWILIO_INVALID_TOKEN = '20104'; // Access Token has expired or expiration date is invalid
const TWILIO_FLOW_REVISION = '81021'; // Flow revision must be an integer or enum(LatestPublished, LatestRevision): Autopilot
const TWILIO_FUNCTION_ERROR_LOG = '82005'; // Function execution resulted in an error log
const TWILIO_INVALID_CONTENT_TYPE = '12300'; // Attempt to retrieve MediaUrl returned an unsupported Content-Type.
const TWILIO_FLEX_UI_ERROR = '45600'; // Flex UI Error, since September 5th(-ish) Twilio is throwing a lot of "Flex UI error"

const MEDIAURL_MSG = 'Attempt to retrieve MediaUrl returned an unsupported Content-Type.';

const shouldOmitLoggingEvent = (AccountSid: string, payload: DebuggerPayload) => {
  if (
    AccountSid === stagingAccountMap.ASELO_BETA &&
    payload.error_code === TWILIO_INVALID_TOKEN
  )
    return true;

  // As of Sep 8 2021, occurring when people include images in messages, breaking autopilot
  // This filter should be removed once our autopilot bot handles this correctly
  if (
    AccountSid === productionAccountMap.ZM_PRODUCTION &&
    payload.error_code === TWILIO_FLOW_REVISION
  )
    return true;

  // As of Oct 30 2021, counselors can cause pages by clicking repeatedly on 'Add Another Task'
  // Once we have prevented this in the UI, we can consider removing this filter
  //
  // As of Nov 14 2022, we want to suppress duplicates for custom channel send message fieldErrors
  // See https://bugs.benetech.org/browse/CHI-1495
  if (
    productionAccounts.includes(AccountSid) &&
    payload.error_code === TWILIO_FUNCTION_ERROR_LOG
  )
    return true;

  // As of May 25 2022, URLs sent via Facebook Messenger cannot be handled by Twilio
  // See Nick's Twilio support ticket on Aselo Dev:
  //   https://console.twilio.com/us1/support/tickets?frameUrl=%2Fconsole%2Fsupport%2Ftickets%2F8709011
  // Also see Jira issue: https://bugs.benetech.org/browse/CHI-1214
  // Once that is resolved, this filter can be removed
  if (
    productionAccounts.includes(AccountSid) &&
    payload.error_code === TWILIO_INVALID_CONTENT_TYPE &&
    payload.more_info?.Msg?.includes(MEDIAURL_MSG)
  )
    return true;

  // As of Sep 5th 2022, Twilio is throwing a lot of randoms "Flex UI error", especially "Flex UI error: Voice SDK device error intercepted"
  // This is happaning to all helplines
  if (
    productionAccounts.includes(AccountSid) &&
    payload.error_code === TWILIO_FLEX_UI_ERROR
  )
    return true;

  return false;
};

function findCodeBySid(
  map: Record<string, string>,
  accountSid: string,
): string | undefined {
  return (Object.entries(map).find(([, sid]) => accountSid === sid) ?? [])[0];
}

const loggingBaseFunction =
  (logInfo: string) => (accountSid: string, payload: DebuggerPayload) => {
    const accountCode: string =
      findCodeBySid(productionAccountMap, accountSid) ??
      findCodeBySid(stagingAccountMap, accountSid) ??
      findCodeBySid(developmentAccountMap, accountSid) ??
      'UNRECOGNISED_ACCOUNT';
    console.log(logInfo, `${accountCode} (${accountSid})`, payload);
  };

type LogFun = (level: string) => ReturnType<typeof loggingBaseFunction>;
const logProductionEvent: LogFun = level =>
  loggingBaseFunction(`[PRODUCTION ${level}]: `);
const logStagingEvent: LogFun = level => loggingBaseFunction(`[STAGING ${level}]: `);
const logDevelopmentEvent: LogFun = level =>
  loggingBaseFunction(`[DEVELOPMENT ${level}]: `);
const logUnknownEvent: LogFun = level => loggingBaseFunction(`[UNKNOWN ${level}]: `);
const logOmittedEvent: LogFun = level => loggingBaseFunction(`[OMITTED ${level}]: `);

/**
 * AccountSid: The account triggering this event
 * Level: Severity of the event (ERROR/WARNING)
 * payload: Webhook payload https://www.twilio.com/docs/usage/troubleshooting/debugging-event-webhooks#payload
 */
function log(AccountSid: string, Level: string, payload: DebuggerPayload) {
  const invokeWithEvent = (logFun: LogFun) => {
    logFun(Level)(AccountSid, payload);
  };

  if (shouldOmitLoggingEvent(AccountSid, payload)) {
    invokeWithEvent(logOmittedEvent);
  } else if (productionAccounts.includes(AccountSid)) {
    invokeWithEvent(logProductionEvent);
  } else if (stagingAccounts.includes(AccountSid)) {
    invokeWithEvent(logStagingEvent);
  } else if (developmentAccounts.includes(AccountSid)) {
    invokeWithEvent(logDevelopmentEvent);
  } else {
    invokeWithEvent(logUnknownEvent);
  }
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  const decoded = Buffer.from(event.body!, 'base64').toString('ascii');
  const params = new URLSearchParams(decoded);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { AccountSid, Level, Timestamp, Sid, Payload } = paramsToObject(
    params,
  ) as DebuggerEvent;

  if (!AccountSid || !Level || !Payload) {
    console.error('Missing required parameters', { AccountSid, Level, Payload });
    return {
      statusCode: 400,
      body: JSON.stringify('Missing required parameters'),
    };
  }

  const payloadObject: DebuggerPayload = JSON.parse(Payload);

  log(AccountSid, Level, payloadObject);

  return {
    statusCode: 200,
    body: JSON.stringify('Event received'),
  };
};
