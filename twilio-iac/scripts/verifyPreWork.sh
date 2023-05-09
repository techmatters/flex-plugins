#!/usr/bin/env bash

printf "\n\n"
read -p "Have you checked/updated the terraform spreadsheet (https://techmatters.app.box.com/file/1109527438079)? (y/N)" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

exit 1