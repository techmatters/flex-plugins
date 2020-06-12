/* eslint-disable import/no-unused-modules */
import { getConfig } from '../HrmFormPlugin';

export type SetupObject = ReturnType<typeof getConfig> & {
  translateUI: (language: string) => Promise<void>;
  getGoodbyeMsg: (language: string) => Promise<string>;
};
