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

// eslint-disable-next-line import/no-extraneous-dependencies,prettier/prettier
import type { Mockttp } from 'mockttp';

type GetPayload = {
  Name: string;
};

type FindPayload = {
  Path: string;
  MaxResults: number;
  NextToken?: string;
};

type MockParameter = {
  valueGenerator: () => string;
  pathPattern?: RegExp;
} & (
  | {
      name: string;
      pathPattern?: RegExp;
    }
  | {
      name?: string;
      pathPattern: RegExp;
    }
);

export const mockSsmParameters = async (
  mockttp: Mockttp,
  parameters: MockParameter[],
) => {
  await mockttp.forPost(/http:\/\/mock-ssm(.*)/).thenCallback(async req => {
    const requestBody = await req.body.getText();
    const {
      Name: name,
      Path: path,
      MaxResults: maxResults,
      NextToken: nextToken,
    }: GetPayload & FindPayload = JSON.parse(requestBody!);
    if (name) {
      // This is a get request for a single parameter
      for (const parameter of parameters) {
        if (parameter.name === name || parameter.pathPattern?.test(name)) {
          return {
            status: 200,
            body: JSON.stringify({
              Parameter: {
                ARN: 'string',
                DataType: 'text',
                LastModifiedDate: 0,
                Name: name,
                Selector: 'string',
                SourceResult: 'string',
                Type: 'SecureString',
                Value: parameter.valueGenerator(),
                Version: 3,
              },
            }),
          };
        }
      }
    } else if (path) {
      // This is a find request for multiple parameters that we need to filter.
      // Where we also need to handle pagination with NextToken or requests & responses.
      // pathPattern on parameters is ignored in this case, since it doesn't really make sense.
      // Note: doesn't currently support filters, only a path.
      const pathRegex = new RegExp(`${path}/.*`);
      const matchingParameters = parameters.filter(parameter =>
        pathRegex.test(parameter.name ?? ''),
      );
      const windowStart = nextToken ? parseInt(nextToken, 10) : 0;
      const windowedParameters = matchingParameters.slice(
        windowStart,
        windowStart + (maxResults ?? 10),
      );
      const responseNextToken =
        windowedParameters.length === (maxResults ?? 10)
          ? (windowStart + maxResults).toString()
          : undefined;
      const payload: any = {
        Parameters: windowedParameters.map(parameter => ({
          ARN: 'string',
          DataType: 'text',
          LastModifiedDate: 0,
          Name: parameter.name,
          Selector: 'string',
          SourceResult: 'string',
          Type: 'SecureString',
          Value: parameter.valueGenerator(),
          Version: 3,
        })),
      };
      if (responseNextToken) {
        payload.NextToken = responseNextToken;
      }
      return {
        status: 200,
        body: JSON.stringify(payload),
      };
    }
    return { status: 404 };
  });
  console.log('Mocked SSM on mock-ssm: ', parameters);
};
