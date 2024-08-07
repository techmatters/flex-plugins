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

    sheet = client.open_by_key(google_sheet_id).worksheet("Flags Matrix")
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
  
