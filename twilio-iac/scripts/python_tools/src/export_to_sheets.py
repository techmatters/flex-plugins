import gspread
import json
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from google.auth.exceptions import GoogleAuthError
from aws.ssm_client import SSMClient

def export_to_sheets(matrix:dict):

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
    
    sheet

    
