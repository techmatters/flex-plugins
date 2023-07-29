import {
  botStatement,
  callerStatement,
  counselorAutoStatement,
  counselorStatement,
} from './chatModel';
import { getConfigValue } from './config';

export const webchatScripts = {
  default: [
    botStatement(
      'Welcome to the helpline. To help us better serve you, please answer the following three questions.',
    ),
    botStatement('Are you calling about yourself? Please answer Yes or No.'),
    callerStatement('yes'),
    botStatement("Thank you. You can say 'prefer not to answer' (or type X) to any question."),
    botStatement('How old are you?'),
    callerStatement('10'),
    botStatement('What is your gender?'), // Step required in Aselo Dev, not in E2E
    callerStatement('girl'),
    botStatement("We'll transfer you now. Please hold for a counsellor."),
    counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
    callerStatement('CALLER TEST CHAT MESSAGE'),
    counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
  ],
  development: {
    as: [
      botStatement("Sorry, I didn't understand that. Please try again."),
      callerStatement('hi'),
      botStatement('Are you calling about yourself? Please answer Yes or No.'),
      callerStatement('yes'),
      botStatement('How old are you?'),
      callerStatement('10'),
      botStatement('What is your gender?'), // Step required in Aselo Dev, not in E2E
      callerStatement('girl'),
      botStatement("We'll transfer you now. Please hold for a counsellor."),
      counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
      callerStatement('CALLER TEST CHAT MESSAGE'),
      counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
    ],
  },
  staging: {},
  production: {},
};

export const getWebchatScript = (): ChatStatement[] => {
  const helplineShortCode = getConfigValue('helplineShortCode') as string;
  const helplineEnv = getConfigValue('helplineEnv') as string;

  return webchatScripts[helplineEnv][helplineShortCode] || webchatScripts.default;
};
