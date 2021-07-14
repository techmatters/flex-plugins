#!/bin/bash
while read p; do
    node downloadInsights.js --username "$1" --password "$2" --workspaceID "$3" --objectID "$p"
done