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
ENV lambda_dir lambdas
ENV lambda_name e2eTestRunner

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y \
        rsync \
        nodejs \
        autoconf \
        g++ \
        libtool \
        make \
        cmake \
        unzip \
        xz-utils \
        ca-certificates \
        libcurl4-openssl-dev && \
    npm install aws-lambda-ric -g && \
    npm install typescript -g && \
    if [ "$TARGETARCH" = "arm64" ]; then export REI_FILE="aws-lambda-rie-arm64"; else export REI_FILE="aws-lambda-rie"; fi && \
    curl -Lo /usr/local/bin/aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/${REI_FILE} && \
    chmod +x /usr/local/bin/aws-lambda-rie

# This is a bit complicated by the need for access to the packages.
# We must have the full repo context for our docker build so we can
# copy the hrm-lib package and labmdas folders so that the file: based
# dependency in package.json can be resolved
COPY ${lambda_dir}/${lambda_name} /tmp/build/${lambda_name}
COPY ${lambda_dir}/packages /tmp/build/packages
COPY ${lambda_dir}/package.json ${lambda_dir}/package-lock.json ${lambda_dir}/tsconfig.json ${lambda_dir}/tsconfig.base.json ${lambda_dir}/${lambda_name}/tsconfig.build.json /tmp/build/

RUN cd /tmp/build && npm ci --verbose \

RUN cd /tmp/build  \
    && mkdir -p /var/task \
    && npx tsc -b tsconfig.build.json --verbose \
    && cp -r ${lambda_name}/dist/. /var/task/ \
    && cp ${lambda_name}/package.json /var/task/ \
    && cp -r packages /var/task/ \
    && cp -r node_modules /var/task/

# Ignore errors if node_modules is not present
RUN rsync -a ${lambda_name}/node_modules/ /var/task/node_modules; exit 0

# Install e2e-tests dependencies (includes Playwright and all test dependencies)
COPY lambdas/packages/hrm-form-definitions/package*.json /app/hrm-form-definitions/
COPY e2e-tests/package*.json /app/e2e-tests/

RUN cd hrm-form-definitions && \
    npm ci && \
    cd ../e2e-tests && \
    npm ci && \
    rm -rf /ms-playwright/* && \
    npm run postinstall

# After initial build, we switch to a smaller base image and only copy the necessary files to reduce the final image size.
FROM ubuntu:jammy

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl wget gpg && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm config set cache /tmp --global && \
    rm -rf /root/.npm/* && \
    apt-get install -y --no-install-recommends git openssh-client && \
    npm install -g yarn && \
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

# Copy the compiled lambda handler and its dependencies
COPY --from=build /var/task /var/task

COPY --chmod=0755 lambdas/e2eTestRunner/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENV TEST_IN_LAMBDA=true
ENV XDG_CONFIG_HOME=/tmp/.config
ENV PLAYWRIGHT_BROWSERS_PATH=/tmp

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["index.handler"]
