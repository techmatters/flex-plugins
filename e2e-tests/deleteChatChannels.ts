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

/**
 * This script is used to delete all chat channels for a given user. It is very slow because there
 * are so many anonymous users in the system. We run it on a schedule instead of as part of the
 * normal test suite to avoid slowing down the test suite.
 *
 * If we don't cleanup chat channels, we will eventually hit the 1000 channel limit and be unable
 * send new messages from the e2e test user.
 */

import { deleteChatChannels } from './twilio/channels';
import { initConfig } from './config';

const main = async () => {
  await initConfig();
  await deleteChatChannels();
};

main();
