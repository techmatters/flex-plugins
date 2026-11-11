# Studio-callable routes (account-scoped lambda)

Catalog of the `account-scoped` lambda routes that Twilio Studio flows call through an
**HTTP Request** (`make-http-request`) widget. Use it when building or editing a flow in
`twilio-iac/helplines/**/templates/studio-flows/*.tftpl`.

Routes that only Twilio itself calls (TaskRouter, conference, Conversations event and
custom-channel callbacks) are intentionally not listed here.

| Route | What it answers / does |
|---|---|
| [`getProfileFlagsForIdentifier`](#getprofileflagsforidentifier) | Which HRM profile flags (e.g. `blocked`) does this contact have? |
| [`operatingHours`](#operatinghours) | Is the helpline open, closed or on holiday right now? |
| [`voice/filterCountryOrVoIP`](#voicefiltercountryorvoip) | Should this number be blocked (non-US, VoIP, hidden, carrier)? |
| [`worker/isSkilledWorkerAvailable`](#workerisskilledworkeravailable) | Can a worker with these skills take this contact **right now**? |
| [`worker/isSkilledWorkerLoggedIn`](#workerisskilledworkerloggedin) | Is a worker with these skills **logged in**, busy or not? |
| [`channelCapture/captureChannelWithBot`](#channelcapturecapturechannelwithbot) | Hand the conversation to a Lex bot |
| [`channelCapture/chatbotCallbackCleanup`](#channelcapturechatbotcallbackcleanup) | Force-release a conversation captured by a bot |
| [`channelCapture/startPostSurveyChatbot`](#channelcapturestartpostsurveychatbot) | Start the post-survey Lex bot on a conversation |
| [`hrm/savePostSurvey`](#hrmsavepostsurvey) | Save voice (IVR) post-survey answers to HRM and Insights |
| [`conversation/sendMessageAndRunJanitor`](#conversationsendmessageandrunjanitor) | Send a final message and close the conversation |
| [`conversation/sendStudioMessage`](#conversationsendstudiomessage) | Detach Studio and send a system message (system-down flow) |
| [`conversation/setFlowMemory`](#conversationsetflowmemory) | Keep values on the conversation for later executions (e.g. after a chatbot) |
| [`voicemail/recordingCompleteCallback`](#voicemailrecordingcompletecallback) | Create a voicemail task after a recording |

---

## Calling a route from Studio

**URL** — always build it from the interpolation, never hard-code a host or account SID:

```text
${lambda_twilio_account_scoped_url}/<route>
```

which resolves to
`https://hrm-<environment>[-eu].tl.techmatters.org/lambda/twilio/account-scoped/<AccountSid>`.

**Widget template** — every example below fills in this shape:

```json
{
  "name": "f_<routeName>[_<suffix>]",
  "type": "make-http-request",
  "transitions": [
    { "next": "<on success>", "event": "success" },
    { "next": "<on failure>", "event": "failed" }
  ],
  "properties": {
    "method": "POST",
    "content_type": "application/json;charset=utf-8",
    "add_twilio_auth": false,
    "body": "{\"param\": \"value\"}",
    "url": "${lambda_twilio_account_scoped_url}/<route>"
  }
}
```

Rules that apply to every route:

- **Method is `POST`.** Other methods return `405`.
- **Requests must come from Twilio.** Routes check the `X-Twilio-Signature` header, which
  Studio adds automatically. Calling them from Postman or curl returns `400 Missing Twilio signature`
  or `403 Request validation failed`. `operatingHours` is the only exception.
- **Prefer a JSON body.** The `body` property is a JSON-escaped string inside the
  `.tftpl` (`\"` for quotes, `\n` for newlines). Form-encoded `parameters` also work, but every
  value arrives as a string, so nested objects (`routingAttributes`, `postSurveyAnswers`) and
  numbers need JSON.
- **Read the response** with `{{widgets.<widget name>.parsed.<key>}}`.
- **Errors** return a non-2xx status, which fires the widget's `failed` transition. The body is
  `{ "message": "...", "cause": { ... } }`. A missing required parameter returns
  `400 "<param> missing"`.
- **Never leave `failed` disconnected.** Decide deliberately whether a failure lets the contact
  through or not, and notify through `webhook_url_studio_errors` where it matters.
- **Name widgets after the route:** `f_<routeName>`, with a suffix when it is called more
  than once (`f_isSkilledWorkerAvailable_tya_calls`). Add the `postqueue_` prefix for widgets
  that run after Send to Flex.

> Not every flow uses this lambda yet. Some older templates call a Twilio Serverless function
> with the same name (`${serverless_url}/sendMessageAndRunJanitor`, `/operatingHours`,
> `/channelCapture/...`), and `getProfileFlagsForIdentifier` is often called via
> `${get_profile_flags_for_identifier_base_url}`, which points at this lambda only when the
> helpline sets that variable. Check the URL before assuming a widget uses this lambda.

---

## getProfileFlagsForIdentifier

Returns the HRM profile flags for the contact's identifier: the phone number, social handle or
webchat `contactIdentifier`, worked out from the Studio trigger. Use it for blocking and
flag-based routing. **Read-only.**

**URL:** `${lambda_twilio_account_scoped_url}/getProfileFlagsForIdentifier`

| Param | Required | Example | Notes |
|---|---|---|---|
| `trigger` | yes | `{{trigger \| to_json}}` | The whole Studio trigger, **unquoted** JSON |
| `channelType` | for messaging (Conversations) triggers | `sms` | One of `voice`, `voicemail`, `sms`, `whatsapp`, `modica`, `messenger`, `instagram`, `line`, `telegram`, `web`, `external`. Ignored for voice triggers. |

**Example body** (SMS):

```json
{
  "trigger": {{trigger | to_json}},
  "channelType": "sms"
}
```

In the `.tftpl`:

```json
"body": "{ \"trigger\": {{trigger | to_json}}, \"channelType\": \"sms\" }",
"url": "${lambda_twilio_account_scoped_url}/getProfileFlagsForIdentifier"
```

For a flow shared across messaging channels, derive the channel type from the trigger:

```json
"body": "{ \"trigger\": {{trigger | to_json}}, \"channelType\": \"{% if trigger.conversation.ChannelAttributes.channel_type %}{{trigger.conversation.ChannelAttributes.channel_type}}{% else %}{{trigger.conversation.Source | downcase}}{% endif %}\"}"
```

**Response:**

```json
{ "flags": ["blocked"] }
```

**Use the result:** split on `{{widgets.f_getProfileFlagsForIdentifier.parsed.flags}}` with
`contains` `blocked`. Use `regex` when matching a specific flag name, as in usnm `sms.tftpl`.

**Errors:** `400 Unsupported Trigger` (a Conversations trigger without `channelType`),
`400 Channel type <x> is not supported`, `500` if HRM fails.

---

## operatingHours

Returns whether the helpline is open, closed or on a holiday for a channel, based on the
helpline's operating-info JSON in `src/operatingInfo/<key>.json`. **Read-only.** This route
has **no Twilio signature check**.

**URL:** `${lambda_twilio_account_scoped_url}/operatingHours`

| Param | Required | Example | Notes |
|---|---|---|---|
| `channel` | yes | `sms` | Must exist in the operating-info `operatingHours` |
| `office` | no | `preClosing` | Uses that office's schedule, falling back to the root schedule |
| `language` | no | `en-US` | Locale for the closed or holiday message. Default `en-US`. |
| `from` | no | `{{trigger.conversation.From}}` | Used to decide whether hours are enforced for this contact |

**Example body:**

```json
{
  "channel": "sms",
  "language": "en-US",
  "office": "preClosing",
  "from": "{{trigger.conversation.From}}"
}
```

**Response:**

```json
{ "status": "closed", "message": "The helpline is out of shift, please reach us later." }
```

`status` is `open`, `closed` or `holiday`, and `message` is omitted when open. The message comes
from the helpline's `ClosedOutOfShift` or `ClosedHolidays` custom strings.

**Use the result:** split on `{{widgets.f_operatingHours.parsed.status}}`, and send
`{{widgets.f_operatingHours.parsed.message}}` when it is not `open`.

**Good to know:** if hours aren't enforced for the account, or no operating-info file exists,
the route returns `open`. A missing channel in the file returns `500`.

---

## voice/filterCountryOrVoIP

Decides whether to block an inbound number. It blocks hidden or non-E.164 caller IDs, non-US
numbers, VoIP lines and specific carriers, using Twilio Lookup. It works for **SMS as well as
voice**, despite the path. Each call makes a billable Lookup request.

**URL:** `${lambda_twilio_account_scoped_url}/voice/filterCountryOrVoIP`

| Param | Required | Example | Notes |
|---|---|---|---|
| `from` | yes | `{{trigger.call.From}}` | E.164 number |

**Example body:**

```json
{ "from": "{{trigger.conversation.From}}" }
```

In the `.tftpl`:

```json
"body": "{\"from\":\"{{trigger.conversation.From}}\"}",
"url": "${lambda_twilio_account_scoped_url}/voice/filterCountryOrVoIP"
```

Use `{{trigger.call.From}}` in voice flows.

**Response:**

```json
{ "blockIncoming": true, "blockReason": "voip" }
```

`blockReason` is one of `hidden_caller_id`, `non_us_country`, `voip` or `blocked_carrier`. An
allowed number returns `{ "blockIncoming": false }`.

**Use the result:** split on `{{widgets.f_countryVoipFilter.parsed.blockReason}}`, with
`noMatch` continuing the normal flow. In usnm both `success` and `failed` go to the split, so
a lookup failure lets the contact through.

---

## worker/isSkilledWorkerAvailable

Counts workers who are in the **Available** activity, have **all** the requested skills, and
have **free capacity right now** on the target channel. Use it to decide whether to offer a
specialised service or skip to a fallback. **Read-only.**

**URL:** `${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerAvailable`

| Param | Required | Example | Notes |
|---|---|---|---|
| `targetSkills` | yes | `TYA,Calls` | Comma-separated. The worker must have every skill (`routing.skills`). |
| `targetChannel` | yes | `voice` | `voice` or `chat` |

What counts as free:

- **`voice`:** no tasks on the worker's voice channel **and** none on its chat channel.
- **`chat`:** no voice task **and** fewer chat tasks than the worker's `maxMessageCapacity`
  attribute. A worker without `maxMessageCapacity` is never chat-available.

**Example body:**

```json
{
  "targetChannel": "voice",
  "targetSkills": "TYA,Calls"
}
```

In the `.tftpl`:

```json
"body": "{\n  \"targetChannel\": \"voice\",\n  \"targetSkills\": \"TYA,Calls\"\n}",
"url": "${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerAvailable"
```

**Response:**

```json
{
  "totalAvailableWorkers": 1,
  "availableWorkerSids": ["WKxxxxxxxx"],
  "availableSkilledWorkers": [
    {
      "sid": "WKxxxxxxxx",
      "friendlyName": "Jane",
      "maxMessageCapacity": 2,
      "workerChannelTasks": [{ "taskChannelUniqueName": "voice", "assignedTasks": 0 }]
    }
  ]
}
```

**Use the result:** split on
`{{widgets.f_isSkilledWorkerAvailable_tya_calls.parsed.totalAvailableWorkers}}`, using
`greater_than` `0` for the specialist path and `equal_to` `0` for the fallback.

**See also:** [`worker/isSkilledWorkerLoggedIn`](#workerisskilledworkerloggedin) when you only need
to know whether someone is logged in, not whether they are free.

---

## worker/isSkilledWorkerLoggedIn

Counts workers who are **logged in**, meaning any activity except `Offline` (Available, Break,
Unavailable, ...), and have **all** the requested skills, **regardless of how busy they are**.
Use it to answer "is anyone with this skill on shift?", for example to decide whether to queue
for a specialist or offer a callback. **Read-only.**

**URL:** `${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerLoggedIn`

| Param | Required | Example | Notes |
|---|---|---|---|
| `targetSkills` | yes | `Spanish,SMS` | Comma-separated. The worker must have every skill. |
| `excludedActivities` | no | `Break,Unavailable` | Comma-separated, case-insensitive. Added to `Offline`, which is **always** excluded. |

**Example body:** everyone logged in with the skills.

```json
{
  "targetSkills": "Spanish,SMS"
}
```

**Example body:** logged in, excluding workers on a break or unavailable.

```json
{
  "targetSkills": "Spanish,SMS",
  "excludedActivities": "Break,Unavailable"
}
```

In the `.tftpl`:

```json
{
  "name": "f_isSkilledWorkerLoggedIn_es_sms",
  "type": "make-http-request",
  "transitions": [
    { "next": "split_specialist_logged_in_es_sms", "event": "success" },
    { "next": "split_specialist_logged_in_es_sms", "event": "failed" }
  ],
  "properties": {
    "method": "POST",
    "content_type": "application/json;charset=utf-8",
    "add_twilio_auth": false,
    "body": "{\n  \"targetSkills\": \"Spanish,SMS\",\n  \"excludedActivities\": \"Break,Unavailable\"\n}",
    "url": "${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerLoggedIn"
  }
}
```

**Response:**

```json
{
  "totalLoggedInWorkers": 2,
  "loggedInWorkerSids": ["WKxxxxxxxx", "WKyyyyyyyy"]
}
```

**Use the result:** split on
`{{widgets.f_isSkilledWorkerLoggedIn_es_sms.parsed.totalLoggedInWorkers}}`, using `greater_than`
`0` for "someone is on shift". When `failed` also goes to the split, the value is empty and
falls to `noMatch`, so point `noMatch` at the path you want on failure.

**Good to know:**

- "Logged in" means the worker's TaskRouter activity. A worker who closes the browser without
  logging out stays counted until Flex moves them to `Offline`.
- If a helpline renamed its logged-out activity, pass the new name in `excludedActivities`.

**See also:** [`worker/isSkilledWorkerAvailable`](#workerisskilledworkeravailable) to check
whether someone is also free to take the contact now.

---

## channelCapture/captureChannelWithBot

Hands a conversation to an Amazon Lex V2 bot. The route detaches Studio, creates a
`survey`-channel control task so the conversation doesn't go stale, adds a webhook so the bot
receives messages, and starts the bot. When the bot finishes, it releases the conversation
according to `releaseType`.

**URL:** `${lambda_twilio_account_scoped_url}/channelCapture/captureChannelWithBot`

| Param | Required | Example | Notes |
|---|---|---|---|
| `channelSid` | yes | `{{flow.channel.address}}` | Conversation SID. `conversationSid` in the body is ignored. |
| `isConversation` | yes for Conversations | `"true"` | Leave it out or set it to `"false"` only for legacy Programmable Chat |
| `message` | yes | `trigger_pre_survey` | Text sent to the bot, or to the user with `withNextMessage` |
| `triggerType` | yes | `withUserMessage` | `withUserMessage` (bot replies straight away) or `withNextMessage` (send `message`, wait for the user) |
| `releaseType` | yes | `triggerStudioFlow` | `triggerStudioFlow` (hand back to Studio) or `postSurveyComplete` |
| `studioFlowSid` | when `releaseType` is `triggerStudioFlow` | `{{flow.flow_sid}}` | Flow that gets the conversation back |
| `botSuffix` | yes | `pre_survey` | Bot is `<helplineCode>_<language>_<botSuffix>` |
| `language` | yes | `${flow_vars.bot_language}` | e.g. `en-US` |
| `channelType` | yes | `sms` | Stored on the conversation attributes |
| `releaseFlag` | no | `preSurveyComplete` | Attribute set to `true` on release. Check it when the flow re-triggers. |
| `memoryAttribute` | no | `languageMemory` | Attribute that stores the bot answers. Default `memory`. |
| `additionControlTaskAttributes` | no | `"{\"foo\":1}"` | JSON string merged into the control task |
| `controlTaskTTL` | no | `45600` | Control task timeout in seconds. Default `45600`. |

**Example body:**

```json
{
  "channelSid": "{{flow.channel.address}}",
  "isConversation": "true",
  "message": "trigger_pre_survey",
  "studioFlowSid": "{{flow.flow_sid}}",
  "language": "${flow_vars.bot_language}",
  "botSuffix": "pre_survey",
  "triggerType": "withUserMessage",
  "releaseType": "triggerStudioFlow",
  "releaseFlag": "preSurveyComplete",
  "channelType": "{% if trigger.conversation.ChannelAttributes.channel_type %}{{trigger.conversation.ChannelAttributes.channel_type | downcase}}{% else %}{{trigger.conversation.Source | downcase}}{% endif %}"
}
```

**Response:** `{}`. Nothing to read.

**Use the result:** usually `success` ends the execution. The flow fires again when the bot
releases the conversation, so branch on
`{{trigger.conversation.ChannelAttributes.preSurveyComplete}}` (your `releaseFlag`) at the top of
the flow. Send `failed` to an error notification and then
[`chatbotCallbackCleanup`](#channelcapturechatbotcallbackcleanup).

---

## channelCapture/chatbotCallbackCleanup

Force-releases a conversation that a bot captured. It ends the Lex session, clears the capture
attributes, removes the bot webhook and runs the release: back to Studio, or saving the post
survey. Use it on error paths after `captureChannelWithBot`.

**URL:** `${lambda_twilio_account_scoped_url}/channelCapture/chatbotCallbackCleanup`

| Param | Required | Example | Notes |
|---|---|---|---|
| `channelSid` | yes | `{{flow.channel.address}}` | Conversation SID |

**Example body:**

```json
{ "channelSid": "{{flow.channel.address}}" }
```

**Response:** `{}`.

**Use the result:** in the shared lex templates, `success` goes to `send_to_queue` so the contact
still reaches a counsellor, and `failed` goes to an end-chat message.

---

## channelCapture/startPostSurveyChatbot

Starts the `post_survey` Lex bot on a Conversation. It sends the bot's trigger message and, when
the user finishes, saves the answers to HRM and Insights against the original contact. It is
used by the usnm post-call SMS survey flows, after a `start-conversation` widget.

**URL:** `${lambda_twilio_account_scoped_url}/channelCapture/startPostSurveyChatbot`

| Param | Required | Example | Notes |
|---|---|---|---|
| `conversationSid` | yes | `{{flow.channel.sid}}` | |
| `taskSid` | yes | `{{flow.data.contactTaskSid}}` | Original contact's task |
| `contactId` | yes | `{{flow.data.contactId}}` | HRM contact ID |
| `channelType` | yes | `sms` | |
| `language` | no | `en` | If empty, taken from the task's `language`, then the helpline default |

**Example body:**

```json
{
  "conversationSid": "{{flow.channel.sid}}",
  "contactId": "{{flow.data.contactId}}",
  "taskSid": "{{flow.data.contactTaskSid}}",
  "channelType": "sms",
  "language": "{{flow.data.taskLanguage}}"
}
```

**Response:** `{}`.

**Good to know:** this route returns `200` even when starting the bot fails, because those
errors are only logged, so `failed` won't catch them. Check the lambda logs if surveys don't
start.

---

## hrm/savePostSurvey

Saves the answers from a **voice** (IVR) post-call survey to HRM and to Flex Insights. It does
this through a short-lived `survey` task, which it creates and cancels itself.

**URL:** `${lambda_twilio_account_scoped_url}/hrm/savePostSurvey`

| Param | Required | Example | Notes |
|---|---|---|---|
| `contactId` | yes | `{{trigger.call.contactId}}` | HRM contact ID |
| `contactTaskSid` | yes | `{{trigger.call.taskSid}}` | Original contact's task |
| `postSurveyAnswers` | yes | see below | Object. Keys must match the questions in the helpline's form definitions `insights/postSurvey` spec. Send it as JSON, not form parameters. |

**Example body:**

```json
{
  "contactId": "{{trigger.call.contactId}}",
  "contactTaskSid": "{{trigger.call.taskSid}}",
  "postSurveyAnswers": {
    "feel_supported": "{{flow.variables.feel_supported}}",
    "beginning_interaction": "{{flow.variables.beginning_interaction}}",
    "end_interaction": "{{flow.variables.end_interaction}}"
  }
}
```

**Response:**

```json
{ "message": "[Post Survey Studio Flow - AC.../WT...]: Saved post survey to contact 123 with contact task SID WT...." }
```

**Good to know:** HRM or Insights save errors are only logged, and the route still returns `200`.

---

## conversation/sendMessageAndRunJanitor

Sends a final system message and then **closes the conversation**: it removes the Studio
webhooks and sets the state to `closed`. Use it to end a contact without reaching a counsellor,
for example when blocked, closed, on a holiday or after max retries.

**URL:** `${lambda_twilio_account_scoped_url}/conversation/sendMessageAndRunJanitor`

| Param | Required | Example | Notes |
|---|---|---|---|
| `conversationSid` | yes | `{{flow.channel.address}}` | Send **only** this for Conversations (see below) |
| `message` | yes | `${flow_vars.send_message_sms_closed}` | Text sent before closing |
| `from` | no | `NAMI` | Message author |

**Example body:**

```json
{
  "conversationSid": "{{flow.channel.address}}",
  "message": "${flow_vars.send_message_sms_closed}",
  "from": "${helpline}"
}
```

usnm sends the same values as form-encoded `parameters`, which also works:

```json
"content_type": "application/x-www-form-urlencoded;charset=utf-8",
"parameters": [
  { "key": "conversationSid", "value": "{{flow.channel.address}}" },
  { "key": "message", "value": "${flow_vars.send_message_sms_voip_blocked}" },
  { "key": "from", "value": "NAMI" }
]
```

**Response:** the Twilio message that was sent. Nothing to read.

**Good to know:**

- Use `channelSid` instead of `conversationSid` only for legacy Programmable Chat. If both are
  sent, the conversation is closed but the message goes out through the legacy Chat API.
- Most helplines still call the Serverless version (`${serverless_url}/sendMessageAndRunJanitor`).

---

## conversation/sendStudioMessage

Detaches the Studio webhook from the channel, so the reply doesn't re-trigger the flow, and
sends a system message. It is used by the shared `system-down.tftpl`.

**URL:** `${lambda_twilio_account_scoped_url}/conversation/sendStudioMessage`

| Param | Required | Example | Notes |
|---|---|---|---|
| `channelSid` | yes | `{{flow.channel.address}}` | Required: the webhook removal always uses it |
| `conversationSid` | no | `{{flow.channel.address}}` | |
| `message` | yes | `${system_down_flow_vars.message}` | |
| `from` | no | `${helpline}` | Message author |

**Example body:**

```json
{
  "conversationSid": "{{flow.channel.address}}",
  "channelSid": "{{flow.channel.address}}",
  "message": "${system_down_flow_vars.message}",
  "from": "${helpline}"
}
```

**Response:** the Twilio message that was sent. Nothing to read.

---

## conversation/setFlowMemory

Keeps values for the rest of the conversation's Studio executions. Studio variables
(`flow.variables`) end with the execution, and a chatbot handing the conversation back
(`captureChannelWithBot` with `releaseType: triggerStudioFlow`) starts a new one. The
conversation's attributes outlive both: this route merges the values into its `flowMemory`
attribute. **Conversations only.**

**URL:** `${lambda_twilio_account_scoped_url}/conversation/setFlowMemory`

| Param | Required | Example | Notes |
|---|---|---|---|
| `conversationSid` | yes | `{{flow.channel.address}}` | A Conversations SID (`CH...`) |
| `flowMemory` | yes | `{"entryPoint": "sms_redirect"}` | **Object** of the values to keep (a JSON string also works, e.g. in form parameters). Keys: letters, numbers and underscores, not starting with a number. |

**Example body:**

```json
{
  "conversationSid": "{{flow.channel.address}}",
  "flowMemory": {
    "entryPoint": "sms_redirect",
    "menuChoice": "{{widgets.send_wait_sms_en_menu.inbound.Body}}"
  }
}
```

**Response:** the whole flow memory after the change:

```json
{ "flowMemory": { "entryPoint": "sms_redirect", "menuChoice": "2" } }
```

**Use the result:** later executions read the values from the trigger,
`{{trigger.conversation.ChannelAttributes.flowMemory.entryPoint}}` (e.g. in a split at the top of
the flow, after a chatbot hands the conversation back). The same execution can read
`{{widgets.f_setFlowMemory.parsed.flowMemory.entryPoint}}`. Send `failed` to an error notification.

**Good to know:**

- Each call adds to what's kept: a key set again takes the new value, the others stay. Values
  are set as Studio has them when the widget runs (`{{...}}` filled in), and stay strings.
- Only `flowMemory` is written. The bots' memories (`memory`, or their `memoryAttribute`), release
  flags and the capture's own attributes aren't touched; don't use `flowMemory` as a bot's
  `memoryAttribute`, or the bot's answers replace it when it hands the conversation back.
- Conversation attributes are limited in size by Twilio (16 KB in all): keep short values, not
  whole messages or JSON documents.

---

## voicemail/recordingCompleteCallback

Creates a TaskRouter **voicemail task** after a Studio `record-voicemail` widget, so a counsellor
can call back. The task lives for 7 days.

**URL:** `${lambda_twilio_account_scoped_url}/voicemail/recordingCompleteCallback`

| Param | Required | Example | Notes |
|---|---|---|---|
| `callSid` | yes | `{{widgets.record_voicemail_x.CallSid}}` | |
| `from` | yes | `{{trigger.call.From}}` | Caller number, used as the task name |
| `voicemailWorkflowSid` | yes | `${workflow_sids.master}` | Not validated, but task creation fails without it |
| `recordingSid` | no | `{{widgets.record_voicemail_x.RecordingSid}}` | Used to set the received time. Falls back to the call start time. |
| `routingAttributes` | no | `{"service": "std"}` | **Object**, stored on the task for routing. Default `{}`. |
| `maxCallbackAttempts` | no | `2` | **Number**. Default `3`. |

**Example body:**

```json
{
  "callSid": "{{widgets.record_voicemail_es_std.CallSid}}",
  "recordingSid": "{{widgets.record_voicemail_es_std.RecordingSid}}",
  "from": "{{trigger.call.From}}",
  "voicemailWorkflowSid": "${workflow_sids.master}",
  "maxCallbackAttempts": 2,
  "routingAttributes": { "service": "std", "serviceLanguage": "spanish", "language": "es" }
}
```

**Response:**

```json
{ "createdVoicemailTask": { "sid": "WT...", "...": "..." } }
```

**Use the result:** nothing to parse. Play a "voicemail saved" message on `success`, and send
`failed` to the `webhook_url_studio_errors` notification. If this fails, the caller's voicemail
won't reach anyone.

---

## Adding a new Studio-callable route

1. Add the handler in `src/<area>/<name>.ts`, with a header comment saying what it does.
2. Register it in `src/router.ts` with `[validateRequestMethod('POST'), validateWebhookRequest]`.
3. Add unit tests in `tests/unit/<area>/`.
4. Add a section to this file: purpose, URL, params table, example body, response, how to use
   the result. Add a row to the index table at the top.
