#!/bin/bash
while read p; do
    node downloadInsights.js --username "$1" --password "$2" --workspaceID fkg14xmswsy78us3gotb67cucw2e8s58 --objectID "$p"
done