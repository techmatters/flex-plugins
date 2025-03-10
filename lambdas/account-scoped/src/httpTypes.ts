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

import { Result } from './Result';
import { AccountSID } from './twilioTypes';

export type HttpError = {
  statusCode: number;
  cause?: Error;
};

export type HttpRequest = {
  method: string;
  headers: Record<string, string | undefined>;
  path: string;
  query: Record<string, string | undefined>;
  body: any;
};

export type AccountScopedHandler = (
  event: HttpRequest,
  accountSid: AccountSID,
) => Promise<Result<HttpError, any>>;

type PipelineStep<Input, Context = undefined, Output = Input> = (
  item: Input,
  context: Context,
) => Promise<Result<HttpError, Output>>;

export type HttpRequestPipelineStep = PipelineStep<HttpRequest, AccountScopedRoute>;

export type FunctionRoute = {
  requestPipeline: HttpRequestPipelineStep[];
  handler: AccountScopedHandler;
};
export type AccountScopedRoute = FunctionRoute & {
  accountSid: AccountSID;
};
