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
  LexRuntimeServiceClient,
  PostTextCommand,
  DeleteSessionCommand,
  PostTextResponse,
} from '@aws-sdk/client-lex-runtime-service';
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
  DeleteSessionCommand as DeleteSessionCommandV2,
  Slot,
  RecognizeTextResponse,
} from '@aws-sdk/client-lex-runtime-v2';
import { isErr, newErr, newOk } from '../Result';
import { getSsmParameter } from '../ssmCache';

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

const getBotNameV1 = ({
  botLanguage,
  botSuffix,
  environment,
  helplineCode,
}: {
  environment: string;
  helplineCode: string;
  botLanguage: string;
  botSuffix: string;
}) => ({
  botName: `${environment}_${helplineCode}_${botLanguage}_${botSuffix}`,
  botAlias: 'latest', // Assume we always use the latest published version
});

const postTextV1 = async ({
  botLanguageV1: botLanguage,
  botSuffix,
  environment,
  helplineCode,
  inputText,
  sessionId,
}: PostTextParams & { botLanguageV1: string }) => {
  try {
    const { botAlias, botName } = getBotNameV1({
      botLanguage,
      botSuffix,
      environment,
      helplineCode,
    });

    const lexClient = new LexRuntimeServiceClient({});

    const lexResponse = await lexClient.send(
      new PostTextCommand({
        botName,
        botAlias,
        inputText,
        userId: sessionId,
      }),
    );

    return newOk({ lexVersion: 'v1', lexResponse } as const);
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error,
    });
  }
};

const isEndOfDialogV1 = (dialogState: string | undefined) =>
  dialogState === 'Fulfilled' || dialogState === 'Failed';

const deleteSessionV1 = async ({
  botLanguageV1: botLanguage,
  botSuffix,
  environment,
  helplineCode,
  sessionId,
}: DeleteSessionParams & { botLanguageV1: string }) => {
  try {
    const { botAlias, botName } = getBotNameV1({
      botLanguage,
      botSuffix,
      environment,
      helplineCode,
    });

    const lexClient = new LexRuntimeServiceClient({});

    const lexResponse = await lexClient.send(
      new DeleteSessionCommand({
        botName,
        botAlias,
        userId: sessionId,
      }),
    );

    return newOk({ lexVersion: 'v1', lexResponse } as const);
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error,
    });
  }
};

const LexV1 = {
  postText: postTextV1,
  isEndOfDialog: isEndOfDialogV1,
  getBotName: getBotNameV1,
  deleteSession: deleteSessionV1,
};

export type LexV2Memory = {
  [q: string]: {
    originalValue: string | number;
    interpretedValue: string | number;
    resolvedValues: (string | number)[];
  };
};

const getBotNameV2 = async ({
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

const postTextV2 = async ({
  botLanguage,
  botSuffix,
  environment,
  helplineCode,
  inputText,
  sessionId,
}: PostTextParams & { botLanguage: string }) => {
  try {
    const result = await getBotNameV2({
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

const isEndOfDialogV2 = (dialogState: string | undefined) => dialogState === 'Close';

const deleteSessionV2 = async ({
  botLanguage,
  botSuffix,
  environment,
  helplineCode,
  sessionId,
}: DeleteSessionParams & { botLanguage: string }) => {
  try {
    const result = await getBotNameV2({
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

const convertV2ToV1Memory = (
  memory:
    | {
        [key: string]: Slot;
      }
    | undefined,
): LexMemory => {
  if (!memory) {
    return {};
  }

  return Object.entries(memory).reduce(
    (accum, [q, { value }]) => ({ ...accum, [q]: value?.interpretedValue || '' }),
    {} as LexMemory,
  );
};

const LexV2 = {
  postText: postTextV2,
  isEndOfDialog: isEndOfDialogV2,
  deleteSession: deleteSessionV2,
  getBotName: getBotNameV2,
  convertV2ToV1Memory,
};

const postText = async ({
  enableLexV2,
  postTextParams,
}: {
  enableLexV2: boolean;
  postTextParams: PostTextParams & { botLanguage: string; botLanguageV1: string };
}) => {
  try {
    if (enableLexV2) {
      const res = await LexV2.postText(postTextParams);
      return res;
    }

    const res = await LexV1.postText(postTextParams);
    return res;
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
};

const deleteSession = async ({
  enableLexV2,
  deleteSessionParams,
}: {
  enableLexV2: boolean;
  deleteSessionParams: DeleteSessionParams & {
    botLanguage: string;
    botLanguageV1: string;
  };
}) => {
  try {
    if (enableLexV2) {
      return await LexV2.deleteSession(deleteSessionParams);
    }

    return await LexV1.deleteSession(deleteSessionParams);
  } catch (error) {
    return newErr({
      message: error instanceof Error ? error.message : String(error),
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
};

const isEndOfDialog = ({
  enableLexV2,
  lexResponse,
}:
  | {
      enableLexV2: false;
      lexResponse: PostTextResponse;
    }
  | {
      enableLexV2: true;
      lexResponse: RecognizeTextResponse;
    }) => {
  if (enableLexV2) {
    return LexV2.isEndOfDialog(lexResponse.sessionState?.dialogAction?.type);
  }

  return LexV1.isEndOfDialog(lexResponse.dialogState);
};

const getBotMemory = ({
  enableLexV2,
  lexResponse,
}:
  | {
      enableLexV2: false;
      lexResponse: PostTextResponse;
    }
  | {
      enableLexV2: true;
      lexResponse: RecognizeTextResponse;
    }) => {
  if (enableLexV2) {
    return LexV2.convertV2ToV1Memory(lexResponse.sessionState?.intent?.slots);
  }

  return lexResponse.slots || {};
};

const LexClient = {
  postText,
  deleteSession,
  isEndOfDialog,
  getBotMemory,
};

export { LexV1, LexV2, LexClient };
