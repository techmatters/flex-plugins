/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/**
 * What each step does, in plain words for helpline staff new to Aselo: shown when hovering a step
 * in the left menu, and from the (i) on a step on the board.
 */
import type { FlowObject, FlowObjectType } from '@tech-matters/form-builder-shared/flows/model';
import { exitsOf } from '@tech-matters/form-builder-shared/flows/model';

export type StepHelp = {
  // What it does, in a sentence or two
  summary: string;
  // Where the contact goes next, by way out
  paths?: { exit: string; text: string }[];
  // A way out added on the board that isn't one of the above (a Decision's answer, a flag...)
  otherPath?: string;
  tip?: string;
};

const FAILED =
  'Something went wrong with the check. You decide what happens; usually the contact carries on as normal, so nobody is turned away by mistake.';

export const STEP_HELP: Record<FlowObjectType, StepHelp> = {
  incoming: {
    summary:
      'Where every contact starts: the moment someone calls, sends a text or starts a chat. Everything connected after it is what happens to that person, step by step.',
    tip: 'Each flow has one start.',
  },
  end: {
    summary: 'The contact’s journey in this flow finishes here. Nothing else happens after it.',
  },
  systemDown: {
    summary:
      'A safety step for outages. If the Aselo team has switched your helpline to “system down” (during a technical problem, for example), the contact is told about the technical issues instead of waiting for a counselor who can’t receive them. Otherwise nothing happens and the contact carries on.',
    tip: 'Usually the first step after the start.',
  },
  subflow: {
    summary: 'Runs a smaller, separate flow, then comes back here. Useful for steps several flows share.',
    paths: [
      { exit: 'completed', text: 'The smaller flow finished.' },
      { exit: 'failed', text: 'It couldn’t be run.' },
    ],
  },
  checkOperatingHours: {
    summary:
      'Decides what the contact gets depending on whether the helpline is open. It compares the time with your helpline’s opening hours and the holidays you’ve told us about.',
    paths: [
      { exit: 'open', text: 'Open: the contact carries on as normal, usually to the queue.' },
      {
        exit: 'closed',
        text: 'Closed: usually your “we’re closed” message, with your hours and where to get help meanwhile.',
      },
      { exit: 'holiday', text: 'A holiday: your holiday message, which can differ from the closed one.' },
      { exit: 'failed', text: FAILED },
    ],
    tip: 'The hours aren’t set here: to change them or add a holiday, ask the Aselo team.',
  },
  checkClientProfile: {
    summary:
      'Looks at what your team already knows about the person, from their phone number or contact details. Counselors can put flags on a client’s profile (labels like “blocked”), and each flag can send the contact a different way.',
    paths: [
      { exit: 'blocked', text: 'Blocked by your team: usually a short message, then the conversation closes.' },
      { exit: 'not blocked', text: 'None of the flags listed: most contacts. They carry on as normal.' },
      { exit: 'failed', text: FAILED },
    ],
    otherPath: 'Contacts whose profile has this flag (e.g. “case management” going to a clinical team).',
    tip: 'Flags are checked in the order listed and the first one the profile has wins, so keep “blocked” first. Flags are added to profiles by counselors, not here.',
  },
  checkQueueAvailability: {
    summary:
      'Checks whether a counselor with the right skills (Spanish-speaking, youth line...) is free to take this contact right now: not on another call, and with room for another chat.',
    paths: [
      { exit: 'available', text: 'Someone is free.' },
      { exit: 'not available', text: 'Nobody with those skills is free right now.' },
      { exit: 'failed', text: FAILED },
    ],
    tip: 'Useful to offer another queue, a callback or a message when nobody is free.',
  },
  checkWorkerLoggedIn: {
    summary:
      'Checks whether any counselor with the right skills is on shift right now, even if they’re busy with someone else.',
    paths: [
      { exit: 'logged in', text: 'At least one is on shift.' },
      { exit: 'not logged in', text: 'Nobody with those skills is on shift.' },
      { exit: 'failed', text: FAILED },
    ],
  },
  checkCountry: {
    summary: 'Sends contacts a different way depending on the country of their phone number.',
    paths: [{ exit: 'noMatch', text: 'Any other country.' }],
    otherPath: 'Contacts from this country.',
  },
  function: {
    summary:
      'Connects to another system to save or look something up, e.g. saving a survey answer. The Aselo team sets up the details.',
    paths: [
      { exit: 'success', text: 'It worked.' },
      { exit: 'failed', text: 'It didn’t: choose what the contact gets then.' },
    ],
    tip: 'Describe what it should do in its text; the Aselo team fills in the rest.',
  },
  decision: {
    summary:
      'A fork in the road: the contact goes one way or another depending on something they answered or something already known, like the language they chose or a menu option.',
    paths: [{ exit: 'noMatch', text: 'Anything that doesn’t match the other paths, e.g. an unexpected answer.' }],
    otherPath: 'When the answer is this.',
    tip: 'Name each path after the answer it’s for (several answers: separate them with commas).',
  },
  playMessage: {
    summary:
      'Plays a recorded message to a caller. Until the recording is uploaded, a computer voice reads its script instead.',
  },
  sendMessage: {
    summary: 'Sends a message to the person (text, chat, WhatsApp...). It doesn’t wait for a reply.',
  },
  menuVoice: {
    summary:
      'Plays a message to a caller and waits for them to press a key or say something, like “Press 1 for English, 2 for Spanish”.',
    paths: [
      { exit: 'keypress', text: 'They pressed a key: a Decision after it tells the options apart.' },
      { exit: 'speech', text: 'They said something.' },
      { exit: 'timeout', text: 'They didn’t answer in time: often the menu is repeated.' },
    ],
    otherPath: 'When they chose this option.',
  },
  questionMessaging: {
    summary: 'Sends a message and waits for the person to reply, e.g. “How old are you?”.',
    paths: [
      { exit: 'reply', text: 'They replied: a Decision after it can look at the answer.' },
      { exit: 'timeout', text: 'No reply in time.' },
    ],
  },
  sendMessageAndClose: {
    summary:
      'Sends a last message and closes the conversation, e.g. for blocked contacts or when the helpline is closed.',
    paths: [
      { exit: 'success', text: 'Sent and closed.' },
      { exit: 'failed', text: 'It couldn’t be sent or closed.' },
    ],
  },
  recordVoicemail: {
    summary: 'Lets the caller leave a voicemail, which your team can listen to later.',
  },
  chatbot: {
    summary:
      'Hands the conversation to an automated chatbot that asks a set of questions, like a pre-survey about age and what the person needs help with. When it finishes, the flow carries on with their answers.',
    paths: [
      { exit: 'success', text: 'The chatbot has started talking to the person.' },
      { exit: 'failed', text: 'It couldn’t start: the contact should carry on without it.' },
    ],
  },
  chatbotCleanup: {
    summary:
      'Takes the conversation back from a chatbot, e.g. when the chatbot couldn’t start properly, so the person isn’t left talking to it.',
    paths: [
      { exit: 'success', text: 'Taken back.' },
      { exit: 'failed', text: 'It couldn’t be taken back.' },
    ],
  },
  preSurvey: {
    summary:
      'The questions asked before a counselor picks up, e.g. age or reason for contacting. It’s built separately, as a chatbot or the webchat form; here it shows where it happens.',
  },
  sendToQueue: {
    summary:
      'Puts the contact in line for a counselor. They wait (callers hear music or a message) until a counselor accepts them.',
    paths: [
      { exit: 'callComplete', text: 'The contact was handled, or left.' },
      { exit: 'failedToEnqueue', text: 'They couldn’t be put in line: worth a message or an alert to the Aselo team.' },
      { exit: 'callFailure', text: 'Something went wrong with the call.' },
    ],
    tip: 'Which counselors see it depends on the queue and your helpline’s routing.',
  },
  forwardCall: {
    summary: 'Transfers the caller to another phone number, e.g. an emergency line or a partner organisation.',
    paths: [
      { exit: 'call completed', text: 'The forwarded call ended.' },
      { exit: 'hung up', text: 'The caller hung up.' },
    ],
  },
  notifyError: {
    summary:
      'Alerts the Aselo team when something goes wrong in the flow, so they can look into it. The person doesn’t see it.',
  },
  setVariable: {
    summary:
      'Remembers something for later in this flow, like the language chosen or how many times a menu has played. The person doesn’t see it.',
  },
  setFlowMemory: {
    summary:
      'Remembers something on the conversation itself, so it’s still known later, e.g. after a chatbot hands the conversation back.',
    paths: [
      { exit: 'success', text: 'Remembered.' },
      { exit: 'failed', text: 'It couldn’t be saved.' },
    ],
  },
  repeat: {
    summary:
      'Lets a step happen again a few times, e.g. playing a menu again when the caller didn’t press anything, then moving on.',
    paths: [
      { exit: 'repeat', text: 'Go back round once more.' },
      { exit: 'max reached', text: 'It has repeated enough: move on.' },
    ],
  },
  goToFrame: {
    summary: 'Continues the journey in another part of the board (another frame), so long flows stay easy to read.',
  },
  text: {
    summary: 'A label or title on the board, for people reading the design. It doesn’t do anything.',
  },
  other: {
    summary: 'A step from your current setup that the builder doesn’t have a name for yet. It’s kept exactly as it is.',
  },
};

export const BOARD_HELP = {
  frame: 'An area holding one flow, e.g. “SMS” or “Voice, after hours”. Steps placed inside it belong to that flow.',
  sticky: 'A note for whoever reads or builds the design: questions, ideas, decisions. It doesn’t change the flow.',
};

// A step's paths as on the board: the ones described, then those added on it (a Decision's answers, flags)
export const pathsOf = (object: Pick<FlowObject, 'type' | 'exits' | 'studio'>) => {
  const help = STEP_HELP[object.type];
  const described = new Map((help.paths ?? []).map(path => [path.exit, path.text]));
  return exitsOf(object)
    .filter(Boolean)
    .map(exit => ({ exit, text: described.get(exit) ?? help.otherPath }))
    .filter((path): path is { exit: string; text: string } => Boolean(path.text));
};
