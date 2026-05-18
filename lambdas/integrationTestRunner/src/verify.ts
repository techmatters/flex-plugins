/**
 * Copyright (C) 2021-2025 Technology Matters
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

type ExpectedMessage = {
  sender: 'flex' | 'service-user';
  text: string;
};

export const verifyMessageExchange =
  (
    send: (text: string) => Promise<void>,
    expectToRecieve: (text: string) => Promise<void>,
  ) =>
  async (expectedExchange: ExpectedMessage[]) => {
    for (const { sender, text } of expectedExchange) {
      if (sender === 'service-user') {
        await send(text);
      } else {
        await expectToRecieve(text);
      }
    }
  };
