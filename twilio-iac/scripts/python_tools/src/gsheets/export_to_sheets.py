import os
from google.oauth2.service_account import Credentials
import gspread
import json
# from ..aws import SSMClient
from datetime import datetime

def export_to_sheets(matrix:dict):
  if not matrix:
    raise ValueError("Matrix is empty.")

  try:
    # Fetch SSM parameters
    # credentials_json = SSMClient().get_parameters_by_path('GOOGLE_SHEETS_CREDENTIALS')
    # sheet_id = SSMClient().get_parameter('CD_GOOGLE_SHEET_ID')

    script_dir = os.path.dirname(__file__)
    credentials_path = os.path.join(script_dir, 'credentials.json')
    
    # Read the credentials.json file
    with open(credentials_path, 'r') as file:
        credentials_json = file.read()
    sheet_id = ''

    if not credentials_json:
      raise ValueError("Credentials JSON not found in environment variable.")
    if not sheet_id:
      raise ValueError("Sheet ID not found in environment variable.")
    
    credentials_data = json.loads(credentials_json)
    print("Credentials loaded successfully.")
    
    # Google Sheets setup
    scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
    # Credentials.from_service_account_info
    credentials = Credentials.from_service_account_info(credentials_data, scopes=scopes)
    print("Credentials initialized successfully.")

    client = gspread.authorize(credentials)
    print("Google Sheets client authorized successfully.")

    sheet = client.open_by_key(sheet_id).worksheet("Flags Matrix")
    print("Google Sheet opened successfully.")

    current_date = datetime.now().strftime("%m/%d/%Y")
    current_time = datetime.now().strftime("%H:%M:%S")
    
    time_added = sheet.update_cell(1, 1, f"Last Updated: {current_date} {current_time}")
    if not time_added:
      raise ValueError("Failed to add date to Google Sheet.")
    print("Date updated added successfully.")

    # Fetch all data at once to minimize read requests
    all_data = sheet.get_all_values()
    headers = all_data[0]
    flags_list = [row[0] for row in all_data]

    # Prepare batch updates
    updates = []
    for account, flags in matrix.items():
      try:
        column = headers.index(account.lower()) + 1
      except ValueError:
        continue

      for flag, value in flags.items():
        try:
          row = flags_list.index(flag) + 1
          updates.append({
            'range': gspread.utils.rowcol_to_a1(row, column),
            'values': [[str(value)]]
          })
        except ValueError:
          print(f"Flag {flag} not found in the sheet.")

    # Execute batch update
    if updates:
        sheet.batch_update(updates)
        print(f"Batch update successful for {len(matrix.items())} accounts.")
    else:
        print("No updates to make.")
    if not sheet:
      raise ValueError("Failed to update Google Sheet.")
  except Exception as e:
    raise Exception(f"Error while exporting data to Google Sheets: {e}")
  

