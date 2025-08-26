#!/usr/bin/env bash
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


environment=$1
helpline=$2

environments=(development staging production)

declare -A short_env_map
short_env_map[dev]=development
short_env_map[stg]=staging
short_env_map[prod]=production

# Convert environment to lowercase
environment="${environment,,}"

# If the environment is a short name, convert it to the full name
[ "${short_env_map[${environment}]+yes}" ] && environment=${short_env_map[$environment]}

if [[ ! " ${environments[@]} " =~ " ${environment} " ]]; then
    echo "${environment} is not a valid environment. It must be one of: ${environments[@]}"
    exit 1
fi

# Convert helpline to lowercase
helpline="${helpline,,}"

path="form-definitions/${helpline}"
helpline_dir="./lambdas/packages/hrm-form-definitions/${path}"

if [ ! -d "$helpline_dir" ]; then
  echo "${helpline} is not a valid helpline. It must be one of: $(ls ./lambdas/packages/hrm-form-definitions/form-definitions)"
fi

echo "environment=${environment}" >> $GITHUB_ENV
echo "short_helpline=${helpline}" >> $GITHUB_ENV
echo "s3_bucket=assets-${environment}.tl.techmatters.org" >> $GITHUB_ENV
echo "path=${path}" >> $GITHUB_ENV
echo "helpline_dir=${helpline_dir}" >> $GITHUB_ENV
