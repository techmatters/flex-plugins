#!/usr/bin/env bash

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
. ${script_dir}/../setup.sh

helplineDir=$1

npm run twilioResources -- import-account-defaults $helplineDir
