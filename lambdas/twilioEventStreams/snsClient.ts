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
    MessageAttributeValue,
    PublishCommand,
    SNSClient,
    SNSClientConfig,
} from '@aws-sdk/client-sns';

const convertToEndpoint = (endpointUrl: string) => {
    const url: URL = new URL(endpointUrl);
    return {
        url: url,
    };
};

const getSnsConfig = (): SNSClientConfig => {
    if (process.env.SNS_ENDPOINT) {
        return {
            region: 'us-east-1',
            endpoint: convertToEndpoint(process.env.SNS_ENDPOINT),
        };
    }

    if (process.env.LOCAL_SNS_PORT) {
        return {
            region: 'us-east-1',
            endpoint: convertToEndpoint(`http://localhost:${process.env.LOCAL_SNS_PORT}`),
        };
    }

    return {};
};

export const sns = new SNSClient(getSnsConfig());

export type PublishSnsParams = {
    topicArn: string;
    message: string;
    messageGroupId?: string;
    messageAttributes?: Record<string, string>;
};

export const publishSns = async (params: PublishSnsParams) => {
    const { topicArn, message, messageGroupId, messageAttributes } = params;
    const messageAttributesPayload: Record<string, MessageAttributeValue> = {};
    Object.entries(messageAttributes ?? {}).forEach(
        ([key, value]) =>
            (messageAttributesPayload[key] = { DataType: 'String', StringValue: value }),
    );

    const command = new PublishCommand({
        TopicArn: topicArn,
        Message: message,
        MessageAttributes: messageAttributesPayload,
        ...(messageGroupId ? { MessageGroupId: messageGroupId } : {}),
    });

    return sns.send(command);
};
