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
 * The deployed API: the same routes as locally (api.ts), behind API Gateway, whose JWT authorizer
 * has already checked the Okta access token. Who the person is and what they can do come from the
 * token's claims; the current files come from flex-plugins master (public, read without signing
 * in); drafts live in S3.
 *
 * Apply isn't offered for now: Aselo staff download the changes and open the PR themselves. The
 * GitHub App version (githubApplier.ts) is ready for when the organization has the app.
 *
 * Environment: DRAFTS_BUCKET, APP_URL (https://form-builder.tl.techmatters.org) and SSM_PREFIX
 * (/form-builder), under which the Slack webhook is kept (optional: without it, submissions are
 * only logged).
 */
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { localNotifier } from './localServices';
import { PublicRepoSource } from './publicRepo';
import { RepoSnapshots } from './repoSnapshot';
import { S3DraftStore } from './s3DraftStore';
import { SlackNotifier } from './slackNotifier';

const ASELO_STAFF_GROUP = 'form-builder-aselo-staff';
const HELPLINE_GROUP_PATTERN = /^form-builder-([a-z0-9]+)$/;

// API Gateway passes list claims either as a list or as a string like "[a b]"
const groupsOf = (claim: unknown): string[] => {
  if (Array.isArray(claim)) return claim.map(String);
  if (typeof claim !== 'string') return [];
  return claim.replace(/^\[|\]$/g, '').split(/[\s,]+/).filter(Boolean);
};

export const userFromClaims = (claims: Record<string, unknown>): ApiUser | undefined => {
  const groups = groupsOf(claims.groups);
  const email = typeof claims.email === 'string' ? claims.email : undefined;
  const name = (typeof claims.name === 'string' && claims.name.trim()) || email || String(claims.sub ?? 'Someone');
  if (groups.includes(ASELO_STAFF_GROUP)) return { name, email, role: 'aselo-staff', helplines: 'all' };
  const helplines = groups.flatMap((group) => group.match(HELPLINE_GROUP_PATTERN)?.[1] ?? []);
  return helplines.length > 0 ? { name, email, role: 'helpline-staff', helplines } : undefined;
};

type Services = Omit<ApiContext, 'formDefinitionsDir' | 'helplinesConfigDir' | 'webchatConfigDir'> & {
  snapshots: RepoSnapshots;
};

let services: Promise<Services> | undefined;

const loadServices = async (): Promise<Services> => {
  const prefix = process.env.SSM_PREFIX ?? '/form-builder';
  const { Parameters = [] } = await new SSMClient({}).send(
    new GetParametersCommand({ Names: [`${prefix}/slack_webhook_url`], WithDecryption: true }),
  );
  const slackWebhookUrl = Parameters.find((parameter) => parameter.Name === `${prefix}/slack_webhook_url`)?.Value;

  return {
    snapshots: new RepoSnapshots(new PublicRepoSource(), '/tmp/flex-plugins'),
    drafts: new S3DraftStore(process.env.DRAFTS_BUCKET!),
    // Until the Slack webhook is set up, submissions are only logged
    notifier: slackWebhookUrl
      ? new SlackNotifier(slackWebhookUrl, process.env.APP_URL ?? 'https://form-builder.tl.techmatters.org')
      : localNotifier,
  };
};

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  const user = userFromClaims(event.requestContext.authorizer?.jwt?.claims ?? {});
  if (!user) return json(403, { message: 'You are not in a form builder group. Ask the Aselo team for access.' });

  let body: unknown;
  if (event.body) {
    try {
      body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
    } catch {
      return json(400, { message: 'Invalid JSON' });
    }
  }

  try {
    services ??= loadServices().catch((err) => {
      services = undefined; // try again on the next request
      throw err;
    });
    const { snapshots, ...rest } = await services;
    const snapshot = await snapshots.latest();
    const response = await handleApiRequest(
      {
        ...rest,
        formDefinitionsDir: snapshot.formDefinitionsDir,
        helplinesConfigDir: snapshot.helplinesConfigDir,
        webchatConfigDir: snapshot.webchatConfigDir,
      },
      { method: event.requestContext.http.method, path: event.rawPath, body, user },
    );
    return json(response.status, response.body);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[form-builder]', err);
    return json(500, { message: 'Something went wrong. Please try again, or tell the Aselo team.' });
  }
};
