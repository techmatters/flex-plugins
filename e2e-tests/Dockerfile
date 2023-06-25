# Copyright (C) 2021-2023 Technology Matters
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see https://www.gnu.org/licenses/.

FROM mcr.microsoft.com/playwright:v1.30.0-jammy AS build

WORKDIR /app

ARG TARGETARCH

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y \
        nodejs \
        autoconf \
        g++ \
        libtool \
        make \
        cmake \
        unzip \
        libcurl4-openssl-dev && \
    npm install aws-lambda-ric -g && \
    if [ "$TARGETARCH" = "arm64" ]; then export REI_FILE="aws-lambda-rie-arm64"; else export REI_FILE="aws-lambda-rie"; fi && \
    curl -Lo /usr/local/bin/aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/${REI_FILE} && \
    chmod +x /usr/local/bin/aws-lambda-rie

COPY hrm-form-definitions/package*.json /app/hrm-form-definitions/
COPY e2e-tests/package*.json /app/e2e-tests/

RUN cd hrm-form-definitions && \
    npm ci && \
    cd ../e2e-tests && \
    npm ci && \
    rm -rf /ms-playwright/* && \
    npm run postinstall && \
    ls -al /ms-playwright && \
    du -hs /ms-playwright

FROM ubuntu:jammy

ENV TEST_IN_LAMBDA=true

WORKDIR /app

# Lambdas can only write to /tmp, so we hae to set the npm cache to /tmp
RUN apt-get update && \
    apt-get install -y curl wget gpg && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm config set cache /tmp --global && \
    rm -rf /root/.npm/* && \
    apt-get install -y --no-install-recommends git openssh-client && \
    npm install -g yarn && \
    # clean apt cache
    rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/local/bin/aws-lambda-rie /usr/local/bin/aws-lambda-rie
COPY --from=build /usr/bin /usr/bin
COPY --from=build /usr/lib/node_modules /usr/lib/node_modules
COPY --from=build /app/hrm-form-definitions /app/hrm-form-definitions
COPY --from=build /app/e2e-tests /app/e2e-tests
COPY --from=build /ms-playwright /ms-playwright

WORKDIR /app/e2e-tests

RUN npx playwright install-deps

COPY hrm-form-definitions /app/hrm-form-definitions
COPY e2e-tests /app/e2e-tests
COPY --chmod=0755 e2e-tests/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY e2e-tests/lambda/handler.js /app/e2e-tests/handler.js
COPY e2e-tests/docker/fonts.conf /etc/fonts/fonts.conf

ENV XDG_CONFIG_HOME=/tmp/.config
ENV SKIP_DATA_UPDATE=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_BROWSER_TELEMETRY_DISABLED=true

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["handler.handler"]
