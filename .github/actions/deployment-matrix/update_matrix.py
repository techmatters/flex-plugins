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

import os
import json
import sys
import gspread
from google.oauth2.service_account import Credentials
from google.auth.exceptions import GoogleAuthError
from datetime import datetime

def main():
  try:
    # Load credentials from the environment variable
    credentials_json = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
    sheet_id = os.getenv('GOOGLE_SHEET_ID')

    if not credentials_json:
      raise ValueError("Credentials JSON not found in environment variable.")
    if not sheet_id:
      raise ValueError("Sheet ID not found in environment variable.")

    credentials_data = json.loads(credentials_json)
    print("Credentials loaded successfully.")

    # Define the scope and credentials
    scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
    credentials = Credentials.from_service_account_info(credentials_data, scopes=scopes)
    print("Credentials initialized successfully.")

    client = gspread.authorize(credentials)
    print("Google Sheets client authorized successfully.")

    sheet = client.open_by_key(sheet_id).worksheet("Deploys")
    print("Google Sheet opened successfully.")

    current_date = datetime.now().strftime("%m/%d/%Y")
    current_time = datetime.now().strftime("%H:%M:%S")

    service_repo = os.getenv('SERVICE_REPO')
    identifier = os.getenv('IDENTIFIER') 
    environment = os.getenv('ENVIRONMENT')
    version_tag = os.getenv('VERSION_TAG')

    print("Environment variables loaded successfully.")

    new_row = [current_date, current_time, service_repo, identifier, environment, version_tag]
    append_row = sheet.append_row(new_row)
    print("Row added to Deploys sheet.")

    if not append_row:
      raise RuntimeError("Failed to add row to Deploys sheet.")

    print("Google Sheet updated successfully.")

  except (GoogleAuthError, ValueError, RuntimeError, json.JSONDecodeError) as e:
    print(f"Error: {e}")
    sys.exit(1)

if __name__ == '__main__':
  main()
