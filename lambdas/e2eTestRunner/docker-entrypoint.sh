#!/usr/bin/env sh
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

# Nothing is writable on a lambda except /tmp. We need to copy the browser there and set it as our home directory
# so that chromium can write to it.
cp -r /ms-playwright/* /tmp/

# Some chromeium startup writes to ~/some/directory. We need to set the home directory to /tmp so that it can write
export HOME=/tmp

if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /usr/local/bin/aws-lambda-rie /usr/bin/aws-lambda-ric $@
else
  exec /usr/bin/aws-lambda-ric $@
fi
