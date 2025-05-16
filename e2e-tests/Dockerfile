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

# We start with a large official playwright base image to build the dependencies.
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
    # aws-lambda-rie provides the scaffolding to run the lambda in a container
    npm install aws-lambda-ric -g && \
    #aws-lambda-rie provides emulation of the aws runtime interface for local development
    if [ "$TARGETARCH" = "arm64" ]; then export REI_FILE="aws-lambda-rie-arm64"; else export REI_FILE="aws-lambda-rie"; fi && \
    curl -Lo /usr/local/bin/aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/${REI_FILE} && \
    chmod +x /usr/local/bin/aws-lambda-rie

COPY lambdas/packages/hrm-form-definitions/package*.json /app/hrm-form-definitions/
COPY e2e-tests/package*.json /app/e2e-tests/

RUN cd hrm-form-definitions && \
    npm ci && \
    cd ../e2e-tests && \
    npm ci && \
    # We clean the base image browsers and only install the one we need to reduce the final image size
    rm -rf /ms-playwright/* && \
    npm run postinstall

# After initial build, we switch to a smaller base image and only copy the necessary files to reduce the final image size.
FROM ubuntu:jammy

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl wget gpg && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    # move npm cache to /tmp for use in lambda
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

COPY lambdas/packages/hrm-form-definitions /app/hrm-form-definitions
COPY e2e-tests /app/e2e-tests
COPY --chmod=0755 e2e-tests/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY e2e-tests/lambda/handler.js /app/e2e-tests/handler.js

ENV TEST_IN_LAMBDA=true
ENV XDG_CONFIG_HOME=/tmp/.config
ENV PLAYWRIGHT_BROWSERS_PATH=/tmp
ENV PLAYWRIGHT_BROWSER_TELEMETRY_DISABLED=true

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["handler.handler"]
