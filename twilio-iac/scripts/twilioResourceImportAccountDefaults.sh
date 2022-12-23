#!/usr/bin/env bash

helplineDir=$1

cd ../../scripts/

# npm i

npm run twilioResources -- import-account-defaults $helplineDir -d
