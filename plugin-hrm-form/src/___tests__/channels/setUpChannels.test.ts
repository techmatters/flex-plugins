/**
 * Copyright (C) 2021-2023 Technology Matters
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

import * as Flex from '@twilio/flex-ui';
import each from 'jest-each';

import { setUpIncomingTransferMessage } from '../../channels/setUpChannels';
import { transferModes } from '../../states/DomainConstants';
import { getConfig } from '../../HrmFormPlugin';

jest.mock('@twilio/flex-ui', () => {
  const mockChannels = ['Call', 'Chat', 'ChatLine', 'ChatMessenger', 'ChatSms', 'ChatWhatsApp'];

  const mockGenerateDefaultTaskChannel = (taskChannelName: string) => ({
    templates: {
      TaskListItem: {
        secondLine: `${taskChannelName}-second-line`,
      },
    },
    colors: {
      main: 'blue',
    },
  });

  return {
    DefaultTaskChannels: Object.fromEntries(mockChannels.map(c => [c, mockGenerateDefaultTaskChannel(c)])),
    TaskChannelHelper: {
      getTemplateForStatus: jest.fn(),
    },
    ReservationStatuses: {
      Accepted: 'Accepted',
    },
  };
});

jest.mock('../../HrmFormPlugin', () => ({
  getConfig: jest.fn(),
}));

const channelsAndStrings = ['Call', 'Chat', 'ChatMessenger', 'ChatSms', 'ChatWhatsApp'].map(channel => ({
  channel,
  string: `Transfer-TaskLine${channel}Reserved`,
}));

describe('setUpIncomingTransferMessage', () => {
  beforeEach(() => {
    channelsAndStrings.forEach(({ channel }) => {
      Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine = `${channel}-second-line`;
    });
  });
  each(channelsAndStrings).describe("secondLine function for chat channel '%p'", ({ channel, string }) => {
    const funcs: { secondLine: (task: any, componentType: any) => string } = {
      secondLine: () => {
        throw new Error('Function was not set!');
      },
    };
    beforeEach(() => {
      (<jest.Mock>getConfig).mockReturnValue({
        strings: {
          'Transfer-Warm': 'TOASTY',
          'Transfer-Cold': 'CHILLY',
          ...Object.fromEntries(channelsAndStrings.map(({ string }) => [string, `${string} test value`])),
        },
      });
    });

    test("Always sets second line of task list item template as function for chat channel '%p'", () => {
      setUpIncomingTransferMessage();
      expect(Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine).toEqual(expect.any(Function));
    });
    describe('secondLine function', () => {
      beforeEach(() => {
        setUpIncomingTransferMessage();
        funcs.secondLine = Flex.DefaultTaskChannels[channel].templates.TaskListItem.secondLine;
      });
      test('Task not in pending state - will use getTemplateForStatus to generate string', () => {
        (<jest.Mock>Flex.TaskChannelHelper.getTemplateForStatus).mockReturnValue('getTemplateForStatus mock result');
        const task = { status: 'not pending', attributes: { transferMeta: {} } };
        expect(funcs.secondLine(task, 'test componentType')).toEqual('getTemplateForStatus mock result');
        expect(Flex.TaskChannelHelper.getTemplateForStatus).toHaveBeenCalledWith(
          task,
          `${channel}-second-line`,
          'test componentType',
        );
      });
      test('Task has no transferMeta - will use getTemplateForStatus to generate string', () => {
        (<jest.Mock>Flex.TaskChannelHelper.getTemplateForStatus).mockReturnValue('getTemplateForStatus mock result');
        const task = { status: 'pending', attributes: {} };
        expect(funcs.secondLine(task, 'test componentType')).toEqual('getTemplateForStatus mock result');
        expect(Flex.TaskChannelHelper.getTemplateForStatus).toHaveBeenCalledWith(
          task,
          `${channel}-second-line`,
          'test componentType',
        );
      });

      describe('Is pending transfer task', () => {
        let baseTask;
        beforeEach(() => {
          baseTask = {
            status: 'pending',
            attributes: { transferMeta: { originalCounselorName: 'TEST COUNSELOR' } },
            queueName: 'TEST QUEUE',
          };
        });
        test('No transfer mode, targetTransferType set - cold direct transfer', () => {
          expect(funcs.secondLine(baseTask, 'test componentType')).toEqual(
            `CHILLY ${string} test value TEST COUNSELOR`,
          );
        });
        test('No originalCounselorName set - specifies counselor as undefined', () => {
          delete baseTask.attributes.transferMeta.originalCounselorName;
          expect(funcs.secondLine(baseTask, 'test componentType')).toEqual(`CHILLY ${string} test value undefined`);
        });
        test("targetTransferType set to 'worker' - appends 'direct' to message", () => {
          baseTask.attributes.transferTargetType = 'worker';
          expect(funcs.secondLine(baseTask, 'test componentType')).toEqual(
            `CHILLY ${string} test value TEST COUNSELOR (direct)`,
          );
        });
        test("targetTransferType set to 'queue' - appends queue name to message", () => {
          baseTask.attributes.transferTargetType = 'queue';
          expect(funcs.secondLine(baseTask, 'test componentType')).toEqual(
            `CHILLY ${string} test value TEST COUNSELOR (TEST QUEUE)`,
          );
        });
        test('Warm transfer mode - prepends warm transfer description string', () => {
          baseTask.attributes.transferMeta.mode = transferModes.warm;
          baseTask.attributes.transferTargetType = 'queue';
          expect(funcs.secondLine(baseTask, 'test componentType')).toEqual(
            `TOASTY ${string} test value TEST COUNSELOR (TEST QUEUE)`,
          );
        });
        test('Cold transfer mode - prepends warm transfer description string', () => {
          baseTask.attributes.transferMeta.mode = transferModes.cold;
          expect(funcs.secondLine(baseTask, 'test componentType')).toEqual(
            `CHILLY ${string} test value TEST COUNSELOR`,
          );
        });
      });
    });
  });
});
