# Flags Matrix

The Flags Matrix is a tool used by the Aselo product team to easily view feature flags and configuration flags across all helplines. This document outlines how to for generating or updating the Flags Matrix, as well as the responsibilities of different teams in maintaining it.


## How to Generate Flags Matrix

1. Access [Devops instance](https://github.com/techmatters/infrastructure-config/blob/master/terraform/modules/devops-instance/README.md)
2. Run `make service-config-generate-flags-matrix` with or without an option like `HL_ENV=development`
3. After running the generation script, check the corresponding Flags Matrix in [Google Sheets](https://docs.google.com/spreadsheets/d/1UccoRr51TiQR6tUsq3SrNsP9FVm0tMfhdWX7VvHXkbQ/edit?gid=1480518226#gid=285517452). Ensure that the matrix has been updated correctly with the date and cross reference information like the number of accounts mentioned in the logs with the spreadsheet. There is also a command added `make service-config-show-flags` to view configurations by account.

- Note that development and staging accounts are reflected in [STG Flags Matrix](https://docs.google.com/spreadsheets/d/1UccoRr51TiQR6tUsq3SrNsP9FVm0tMfhdWX7VvHXkbQ/edit?gid=285517452#gid=285517452) and production accounts are in [PROD Flags Matrix](https://docs.google.com/spreadsheets/d/1UccoRr51TiQR6tUsq3SrNsP9FVm0tMfhdWX7VvHXkbQ/edit?gid=285517452#gid=97934865)


## Manual Intervention for the Flags Matrix in Google Sheets - owned by Product team or Developers

1. If you're adding new helpline, you'll need to add a new column to the relevant "Flags Matrix" sheets in both the staging and production sections, in the snake case format, like `as_development`. Note that the logs from `make service-config-generate-flags-matrix` will be highlight any missing helplines in the spreadsheet

2. If you're adding new flag, you'll need to add a new row ensuring it is alphabetically sorted. Note that feature flags and config flags are separated. Note that the logs from `make service-config-generate-flags-matrix` will highlight any missing flags in the spreadsheet



## Manual Intervention for updating or changing the credentials- owned by Developers

Two SSM parameters are stored in the Parameter Store of us-east-1. These parameters are needed for working with Google Sheets. Note that the user needs to assume the role of `twilio-iac-service-config-developer` or `twilio-iac-service-config-manager` (for prod)
1. "GOOGLE_SHEETS_CREDENTIALS" - This can be changed by configuring a new or updated Service Account in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 
2. ""CD_GOOGLE_SHEET_ID" - This is the sheet id found in the url of the Google Sheet

- For future iterations of the logic used for updating the Flags Matrix, developers should refer to the [export_flags_matrix.py script](./scripts/python_tools/src/gsheet/export_flags_matrix.py)