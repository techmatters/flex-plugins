import json
from google.oauth2.service_account import Credentials
from google.auth.exceptions import GoogleAuthError
from aws.ssm_client import SSMClient
from datetime import datetime
import gspread

def export_to_sheets(matrix:dict):
  if not matrix:
    raise ValueError("Matrix is empty.")

  try:
    # Fetch SSM parameters
    ssm_client = SSMClient()
    credentials_json = ssm_client.get_parameter('/GOOGLE_SHEETS_CREDENTIALS')
    sheet_id = ssm_client.get_parameter('/CD_GOOGLE_SHEET_ID')

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

    for key in matrix.keys():
      # Get the column name for the account
      account = key
      column = sheet.find(account).col

      # Get the row name for the flag
      for flag, value in matrix[key].items():
        row = sheet.find(flag).row

        # Update the cell with the flag value
        sheet.update_cell(row, column, value)
        # print(f"Updated cell {row}, {column} with value {value}.")
    
    if not sheet:
      raise ValueError("Failed to update Google Sheet.")

  except (GoogleAuthError, gspread.exceptions.GSpreadException) as e:
    raise Exception(f"Error while exporting data to Google Sheets: {e}")
  
# export
