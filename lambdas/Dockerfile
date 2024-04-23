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

FROM public.ecr.aws/lambda/nodejs:18 as build

ARG lambda_dir
ENV lambda_dir ${lambda_dir}
ARG lambda_name
ENV lambda_name ${lambda_name}

# This is a bit complicated by the need for access to the packages.
# We must have the full repo context for our docker build so we can
# copy the hrm-lib package and labmdas folders so that the file: based
# dependency in package.json can be resolved
COPY tsconfig.json /tmp/build/tsconfig.json
COPY ${lambda_dir}/${lambda_name} /tmp/build/${lambda_dir}/${lambda_name}
COPY ${lambda_dir}/../packages /tmp/build/${lambda_dir}/../packages
COPY ${lambda_dir}/../../tsconfig.json /tmp/build/${lambda_dir}/../../tsconfig.json
COPY package.json package-lock.json tsconfig.json tsconfig.base.json ${lambda_dir}/${lambda_name}/tsconfig.build.json /tmp/build/

RUN yum install -y rsync \
    && cd /tmp/build \
    && npm ci -w ${lambda_dir}/${lambda_name} -w ${lambda_dir}/../packages/* --verbose \
    && npx tsc -b tsconfig.build.json --verbose \
    && cp ${lambda_dir}/${lambda_name}/dist/*.js /var/task/ \
    && mkdir -p /var/task/${lambda_dir} \
    && cp -r ${lambda_dir}/../packages /var/task/${lambda_dir}/../packages/ \
    && cp -r node_modules /var/task/

# Ignore errors if node_modules is not present
RUN rsync -a ${lambda_dir}/${lambda_name}/node_modules/ /var/task/node_modules; exit 0

# The added layers from our build increase image size significantly. This flattens the image
# to reduce the size of the final image.
FROM public.ecr.aws/lambda/nodejs:18
COPY --from=build /var/task /var/task

# all of this is a little more fragile than I would like because we have to duplicate the parent repo
# at https://github.com/aws/aws-lambda-base-images/blob/nodejs16.x/Dockerfile.nodejs16.x
ENV LANG=en_US.UTF-8
ENV TZ=:/etc/localtime
ENV PATH=/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin
ENV LD_LIBRARY_PATH=/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib
ENV LAMBDA_TASK_ROOT=/var/task
ENV LAMBDA_RUNTIME_DIR=/var/runtime

WORKDIR /var/task

ENTRYPOINT ["/lambda-entrypoint.sh"]

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "index.handler" ]
