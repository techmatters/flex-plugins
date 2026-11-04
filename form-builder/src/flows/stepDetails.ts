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
 * A step's "More info", from the (i) on the board: a fuller explanation than its short help
 * (stepHelp.ts), in plain words, with an example of how a helpline uses it.
 */
import type { FlowObjectType } from './model';

export type StepDetails = { details: string[]; example?: string };

export const STEP_DETAILS: Record<FlowObjectType, StepDetails> = {
  incoming: {
    details: [
      'Each channel (calls, SMS, webchat, WhatsApp...) usually has its own flow, and each flow begins here.',
      'Connect it to the first thing that should happen, usually the system down check.',
    ],
    example: 'Someone texts your helpline number: the SMS flow starts here.',
  },
  end: {
    details: [
      'Use it where a path is finished on purpose, e.g. after a goodbye message. A path left unconnected also ends, but the builder flags it so nobody is dropped by mistake.',
    ],
  },
  systemDown: {
    details: [
      'The Aselo team can switch a helpline to “system down” when a problem stops counselors from receiving contacts. While it’s on, every contact gets your technical issues message, often with another number or service to try.',
      'When it’s off, which is almost always, contacts don’t notice this step at all.',
    ],
    example: 'During an outage, a texter gets: “We’re having technical problems. If you need help now, call 988.”',
  },
  subflow: {
    details: [
      'A subflow is a small flow of its own that other flows can use, so shared steps are designed once. When it finishes, the contact comes back and carries on from here.',
    ],
  },
  checkOperatingHours: {
    details: [
      'When someone contacts you, Aselo checks the time against your helpline’s schedule: your opening hours and the holidays you’ve told us about. The contact then follows the open, closed or holiday path.',
      'The schedule isn’t set in this step: it comes from the hours and holidays on file for your helpline, and can differ by channel or language. To change your hours or add a holiday, ask the Aselo team.',
      'If the check can’t be completed (a brief technical problem), the contact takes the failed path. Most helplines let them through to the queue, so nobody is turned away by mistake.',
    ],
    example:
      'You’re open 10:00 to 22:00. A message at 23:15 takes “closed” and gets: “We’re closed right now. We open at 10:00. If you’re in danger, call 911.”',
  },
  checkClientProfile: {
    details: [
      'Counselors can add flags to a client’s profile in Aselo. A flag is a label that tells the system to treat that person differently. When someone contacts you, Aselo looks up their profile from their phone number or contact details and follows the path of the flag it finds.',
      'Blocked is the usual one: someone your team blocked, e.g. after abusive contacts. They usually get a short message and the conversation closes, so it never reaches a counselor.',
      'Your helpline can add its own flags, each with its own path: add a way out named exactly as the flag. If someone has more than one, they’re checked in the order listed and the first one wins, which is why “blocked” normally comes first.',
      'Flags are added to and removed from profiles by your counselors or supervisors, not in this step. This step only decides what each flag does.',
    ],
    example:
      'A helpline sends everyone flagged “case management” straight to its clinical team, instead of the general queue.',
  },
  checkQueueAvailability: {
    details: [
      'Skills are what counselors are set up to handle, e.g. a language or a service. A counselor is free for a call when they’re on no call or chat, and free for a chat when they’re on no call and have room for another chat.',
      'It only looks: it doesn’t send the contact anywhere. A queue step after it does.',
    ],
    example:
      'If no Spanish-speaking counselor is free, offer the English queue, or tell the person they might wait a little longer.',
  },
  checkWorkerLoggedIn: {
    details: [
      'Unlike “Skilled worker available?”, busy counselors count too: it answers “is anyone with these skills working right now?”.',
    ],
    example:
      'If no counselor for the youth line is on shift, send the contact to the general queue instead of letting them wait.',
  },
  checkCountry: {
    details: [
      'It reads the country code of the phone number (+1, +52...). Add a path for each country you treat differently; everyone else takes “noMatch”.',
    ],
    example: 'Numbers from Mexico get the Spanish welcome; everyone else gets the English one.',
  },
  function: {
    details: [
      'For anything the other steps don’t cover: Aselo’s systems or another service do something and answer back. Write in its text what it should do, and the Aselo team fills in the technical details.',
    ],
    example: 'Save the answers of a post-chat survey so they show in your reports.',
  },
  decision: {
    details: [
      'It looks at one thing, usually the answer to the step right before it, and each path is a value it could be. Several values for one path are separated by commas (“yes,Yes,y”).',
      '“noMatch” catches everything else: an answer nobody expected, a typo. Always connect it somewhere sensible, e.g. back to the question.',
    ],
    example:
      'After “Reply 1 for English, 2 for Spanish”: path “1” goes to the English flow, “2” to the Spanish one, and noMatch asks again.',
  },
  playMessage: {
    details: [
      'Write the script here so it can be reviewed and approved. Once a recording is uploaded it’s played; until then a computer voice reads the script, so the flow can be tested early.',
    ],
    example: '“Thank you for calling. This call may be recorded for quality purposes.”',
  },
  sendMessage: {
    details: [
      'Use it for information: a welcome, a privacy notice, a “you’re in line” message. To ask something and wait for the answer, use a Question instead.',
      'Its text is reviewed and approved before it goes live.',
    ],
    example: '“Welcome to the helpline. A counselor will be with you shortly.”',
  },
  menuVoice: {
    details: [
      'The caller hears the message and can answer with a key or by speaking. A Decision after it tells the options apart (1, 2...).',
      'If they don’t answer in time it takes “timeout”, usually leading to a Repeat that plays the menu again a couple of times before moving on.',
    ],
    example: '“For English, press 1. Para español, oprima 2.”',
  },
  questionMessaging: {
    details: [
      'The person’s reply can be checked by a Decision after it. If they don’t reply in time (the timeout can be set), it takes “timeout”.',
    ],
    example: '“Are you in a safe place to talk? Reply YES or NO.”',
  },
  sendMessageAndClose: {
    details: [
      'Used where the conversation shouldn’t go any further: the person gets the message and the conversation closes, so it doesn’t reach a counselor.',
    ],
    example: 'Outside opening hours: “We’re closed now. We open at 9:00. In an emergency, call 911.”',
  },
  recordVoicemail: {
    details: ['The caller hears a message, then records theirs. Your team listens to it later and can call back.'],
    example: 'After hours: “Leave your name and number after the tone and we’ll call you back tomorrow.”',
  },
  chatbot: {
    details: [
      'While the chatbot is talking to the person, the flow waits. When it finishes, the flow continues with what the person answered, e.g. to send them to the right queue, and the answers can show up for the counselor.',
      'The chatbot’s questions are designed in the Chatbots section.',
    ],
    example: 'Before reaching a counselor: “How old are you?” and “What would you like to talk about today?”.',
  },
  chatbotCleanup: {
    details: [
      'Normally the chatbot hands the conversation back by itself. This step is for when something went wrong, so the person can still reach a counselor.',
    ],
  },
  preSurvey: {
    details: [
      'On the board it marks where the pre-survey happens. The questions themselves are built as a chatbot (Chatbots section) or as the webchat form people fill in before chatting.',
    ],
    example: 'Age, gender and reason for contacting, asked before the counselor picks up.',
  },
  sendToQueue: {
    details: [
      'A queue is a waiting line for a group of counselors, e.g. general, Spanish or clinical. Which queue the contact joins, and which counselors see it, depends on your helpline’s routing (the Routing section).',
      'Callers hear music or a message while they wait; people chatting see your waiting message.',
    ],
    example: 'A contact who chose Spanish waits in the Spanish queue until a Spanish-speaking counselor accepts.',
  },
  forwardCall: {
    details: ['The caller leaves your helpline and is connected to the number set here.'],
    example: 'Callers who press 9 are forwarded to the local emergency line.',
  },
  notifyError: {
    details: [
      'Put it on paths where something failed (a contact couldn’t join the queue, a message couldn’t be sent). The Aselo team gets an alert saying where it happened.',
    ],
    example: 'If a contact can’t be put in line, the Aselo team is alerted straight away.',
  },
  setVariable: {
    details: ['Useful for things later steps need to know. What it remembers only lasts for this run of the flow.'],
    example: 'Remember “language = Spanish” after the menu, so later messages are in Spanish.',
  },
  setFlowMemory: {
    details: [
      'Like “Set variable”, but it lasts: when a chatbot finishes, the flow starts again from the beginning and only what’s kept here is still known.',
    ],
    example: 'Remember which entry point the person came from, before handing them to the pre-survey chatbot.',
  },
  repeat: {
    details: [
      'It counts how many times the contact has been through it. Until the limit (2 unless set), it takes “repeat” back round; after that, “max reached”.',
    ],
    example: 'A caller doesn’t press anything: the menu plays twice more, then they go to the general queue.',
  },
  goToFrame: {
    details: ['Instead of drawing long lines across the board, end a path here and pick the frame it continues in.'],
    example: '“Continues in SMS after hours.”',
  },
  text: {
    details: [
      'Use it for titles, explanations or reminders on the board. Notes for the team are better as sticky notes.',
    ],
  },
  other: {
    details: ['It came from your live setup and works as it does today. Changes to it are made by the Aselo team.'],
  },
};
