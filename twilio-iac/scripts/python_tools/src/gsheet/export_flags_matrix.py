from google.oauth2.service_account import Credentials
import gspread
import json
from datetime import datetime

def export_flags_matrix(matrix:dict, google_parameters:dict):
  if not matrix:
    raise ValueError("Matrix is empty.")
  
  google_sheets_credentials = google_parameters['google_sheets_credentials']
  google_sheet_id = google_parameters['google_sheet_id']
  
  if not google_sheets_credentials or not google_sheet_id:
    raise ValueError("Google Sheets credentials or ID are missing.")

  try:
    
    credentials_data = json.loads(google_sheets_credentials)
    
    # Google Sheets setup
    scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]

    credentials = Credentials.from_service_account_info(credentials_data, scopes=scopes)
    if not credentials:
      raise ValueError("Failed to load Google Sheets json credentials.")

    client = gspread.authorize(credentials)
    if not client:
      raise ValueError("Failed to authorize Google Sheets client.")
    print("Google Sheets client authorized successfully.")

    staging_sheet = client.open_by_key(google_sheet_id).worksheet("STG Flags Matrix")
    production_sheet = client.open_by_key(google_sheet_id).worksheet("PROD Flags Matrix")
    if not staging_sheet or not production_sheet:
      raise ValueError(f'Failed to open {staging_sheet} or {production_sheet} worksheet.')

    current_date = datetime.now().strftime("%m/%d/%Y")
    current_time = datetime.now().strftime("%H:%M:%S")
    
    def process_sheet(sheet, accounts):
      all_data = sheet.get_all_values()
      headers = all_data[0]
      flags_list = [row[0] for row in all_data[1:]]  # Exclude header row

      updates = []
      for account, flags in accounts.items():
        try:
          column = headers.index(account.lower()) + 1
        except ValueError:
          print(f"Account {account} not found in {sheet.title}")
          continue

        for flag, value in flags.items():
          try:
            row = flags_list.index(flag) + 2 # Include header row
            updates.append({
              'range': gspread.utils.rowcol_to_a1(row, column),
              'values': [[str(value)]]
            })
          except ValueError:
            print(f"Flag {flag} not found in {sheet.title}")

      if updates:
        sheet.batch_update(updates)
        time_added = sheet.update_cell(1, 1, f"Last Updated: {current_date} {current_time} UTC")
        if not time_added:
          raise ValueError(f"Failed to add date to {sheet.title}")
        print(f"Batch update successful for {len(accounts)} accounts in {sheet.title}")
      else:
        print(f"No updates to make in {sheet.title}")

    staging_accounts = {k: v for k, v in matrix.items() if k.endswith(('_staging', '_development'))}
    production_accounts = {k: v for k, v in matrix.items() if k.endswith('_production')}

    process_sheet(staging_sheet, staging_accounts)
    process_sheet(production_sheet, production_accounts)
  except Exception as e:
    raise Exception(f"Error while exporting data to Google Sheets: {e}")
  
