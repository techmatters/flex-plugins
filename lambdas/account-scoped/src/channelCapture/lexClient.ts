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
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
  DeleteSessionCommand as DeleteSessionCommandV2,
  RecognizeTextResponse,
} from '@aws-sdk/client-lex-runtime-v2';
import { isErr, newErr, newOk } from '../Result';
import { getSsmParameter } from '@tech-matters/ssm-cache';

export type LexMemory = { [q: string]: string | number };

type PostTextParams = {
  environment: string;
  helplineCode: string;
  botSuffix: string;
  sessionId: string;
  inputText: string;
};
type DeleteSessionParams = {
  environment: string;
  helplineCode: string;
  botSuffix: string;
  sessionId: string;
};

const getBotName = async ({
  botLanguage,
  botSuffix,
  environment,
  helplineCode,
}: {
  environment: string;
  helplineCode: string;
  botLanguage: string;
  botSuffix: string;
}) => {
  try {
    const ssmParamName = `/${environment}/serverless/bots/${helplineCode}_${botLanguage}_${botSuffix}`;

    const botDetailsParam = await getSsmParameter(ssmParamName);

    if (!botDetailsParam) {
      return newErr({
        message: `Invalid SSM parameter ${ssmParamName}`,
        error: new Error(`Invalid SSM parameter ${ssmParamName}`),
      });
    }

    const { botAliasId, botId, localeId } = JSON.parse(botDetailsParam);
    return newOk({
      lexVersion: 'v2',
      botDetails: { botAliasId, botId, localeId },
    } as const);
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error,
    });
  }
};

const postText = async ({
  botLanguage,
  botSuffix,
  environment,
  helplineCode,
  inputText,
  sessionId,
}: PostTextParams & { botLanguage: string }) => {
  try {
    const result = await getBotName({
      botLanguage,
      botSuffix,
      environment,
      helplineCode,
    });

    if (isErr(result)) {
      return result;
    }

    const { botAliasId, botId, localeId } = result.data.botDetails;

    const lexClient = new LexRuntimeV2Client({});

    console.debug(
      `Sending message to bot ${environment}_${helplineCode}_${botLanguage}_${botSuffix} bot id: ${botId}, bot alias: ${botAliasId}, localeId: ${localeId}`,
    );

    const lexResponse = await lexClient.send(
      new RecognizeTextCommand({
        botAliasId,
        botId,
        localeId,
        sessionId,
        text: inputText,
      }),
    );

    return newOk({ lexVersion: 'v2', lexResponse } as const);
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error,
    });
  }
};

const isEndOfDialog = (lexResponse: RecognizeTextResponse) =>
  lexResponse.sessionState?.dialogAction?.type === 'Close';

const deleteSession = async ({
  botLanguage,
  botSuffix,
  environment,
  helplineCode,
  sessionId,
}: DeleteSessionParams & { botLanguage: string }) => {
  try {
    const result = await getBotName({
      botLanguage,
      botSuffix,
      environment,
      helplineCode,
    });

    if (isErr(result)) {
      return result;
    }

    const { botAliasId, botId, localeId } = result.data.botDetails;

    const lexClient = new LexRuntimeV2Client({});

    const lexResponse = await lexClient.send(
      new DeleteSessionCommandV2({
        botAliasId,
        botId,
        localeId,
        sessionId,
      }),
    );

    return newOk({ lexVersion: 'v2', lexResponse } as const);
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error,
    });
  }
};

const getBotMemory = ({ lexResponse }: { lexResponse: RecognizeTextResponse }) => {
  const { slots } = lexResponse.sessionState?.intent || {};
  if (!slots) {
    return {};
  }

  return Object.entries(slots).reduce(
    (accum, [q, { value }]) => ({ ...accum, [q]: value?.interpretedValue || '' }),
    {} as LexMemory,
  );
};

export const LexClient = {
  postText,
  deleteSession,
  isEndOfDialog,
  getBotMemory,
};
