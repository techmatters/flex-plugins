# Deployment Matrix Action

This GitHub Action is automates the update of a deployment matrix in a [Google Sheet](https://docs.google.com/spreadsheets/d/1UccoRr51TiQR6tUsq3SrNsP9FVm0tMfhdWX7VvHXkbQ/edit?gid=1480518226#gid=1480518226), tracking the versions of various repositories deployed across different helplines and environments and repos (hrm ecs and lambdas). The python script populates an ongoing Deploys sheet with deployment details. The Deployment Matrix sheet uses a Google Apps script (see script below) to update with the latest tag or branch

## How It Works

The Google Apps Script comprises two main functions, `updateHelplineBasedRepos` and `updateHrm`, which are called by the `updateMatrix` function. A custom menu named "Deployment Matrix" is added to the Google Sheet UI, allowing users to manually trigger the matrix update by selecting the "Update Matrix" option.

## Manual Intervention for the Sheet - owned by Product team or Developers

1. If new Helplines Are Added: 
New rows need to be added to the "Deployment Matrix" sheet under the staging and production using the short form for helplines

2. If new regions are added in HRM sections: New rows need to added for the necesaary environment. This ensures that new regions are tracked in the matrix.


## Manual Intervention for updating or changing the credentials- owned by Developers

Two SSM parameters are saved in Parameter Store of `us-east-1`. 
1. "GOOGLE_SHEETS_CREDENTIALS" - This can be changed by configuring a new or updated Service Account in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 
2. ""CD_GOOGLE_SHEET_ID" - This is the sheet id found in the url of the Google Sheet


## Here is the script deployed in the Google sheet: 

```
function updateHelplineBasedRepos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var deploysSheet = ss.getSheetByName('Deploys');
  var matrixSheet = ss.getSheetByName('Deployment Matrix');
  
  var deploysData = deploysSheet.getDataRange().getValues();
  var matrixData = matrixSheet.getDataRange().getValues();
  
  var envIndexes = {
    'development': { startRow: 2, startCol: 12 },
    'staging': { startRow: 2, startCol: 2 },
    'production': { startRow: 2, startCol: 6 }
  };

  var repoUrls = {
    'flex-plugins': 'https://github.com/techmatters/flex-plugins',
    'webchat': 'https://github.com/techmatters/flex-plugins',
    'serverless': 'https://github.com/techmatters/serverless',
  };

  var helplineIndex = {};
  for (var i = 2; i < matrixData.length; i++) {
    var helpline = matrixData[i][0];
    if (helpline) {
      helplineIndex[helpline] = i;
    }
  }
  

  for (var k = 1; k < deploysData.length; k++) {
    var deploy = deploysData[k];
    var deployEnv = deploy[3];
    var deployHelpline = deploy[2];
    var deployRepo = deploy[4];
    var deployTag = deploy[5];

    if (envIndexes[deployEnv]) {
      var envStartRow = envIndexes[deployEnv].startRow;
      var envStartCol = envIndexes[deployEnv].startCol;

      var rowIndex = helplineIndex[deployHelpline];
      var colIndex;
      for (var j = envStartCol; j < envStartCol + 3; j++) {
        if (matrixData[envStartRow - 1][j - 1] === deployRepo) {
          colIndex = j;
          break;
        }
      }

      if (rowIndex !== undefined && colIndex !== undefined) {
        var repoUrl = repoUrls[deployRepo];
        var linkUrl;
        var tagRegex = /^v\d+\.\d+\.\d+-qa\.\d+$/;
        if (tagRegex.test(deployTag)) {
          linkUrl = repoUrl + '/releases/tag/' + deployTag;
        } else {
          linkUrl = repoUrl + '/tree/' + deployTag;
        }
        var linkFormula = '=HYPERLINK("' + linkUrl + '", "' + deployTag + '")';
        Logger.log('Setting formula: ' + linkFormula + ' at row: ' + (rowIndex + 1) + ', col: ' + colIndex);
        matrixSheet.getRange(rowIndex + 1, colIndex).setFormula(linkFormula);
      }
    }
  }
}

function updateHrm() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var deploysSheet = spreadsheet.getSheetByName("Deploys");
  var matrixSheet = spreadsheet.getSheetByName("Deployment Matrix");

  // Get the data from the Deploys sheet
  var deploysData = deploysSheet.getDataRange().getValues();

  // Create a structure to hold latest tags by repository and environment
  var latestTags = {};

  // Populate latestTags with the most recent identifiers by environment and repo
  for (var i = 1; i < deploysData.length; i++) { // Skip the header row
    var row = deploysData[i];
    var timestamp = new Date(row[0]);
    var region = row[2];
    var environment = row[3];
    var repo = row[4];
    var identifier = row[5]; // Deployment identifier/tag

    // Create a unique key for each environment-repo combination
    var key = environment + '_' + repo;

    // Check if this is the latest timestamp for this key
    if (!latestTags[key] || timestamp > latestTags[key].timestamp) {
      latestTags[key] = {
        region: region,
        identifier: identifier,
        timestamp: timestamp
      };
    }
  }

  // Prepare to update the Deployment Matrix
  var matrixData = matrixSheet.getRange("K6:Z" + matrixSheet.getLastRow()).getValues(); // Get all relevant matrix data

  // Loop through each row in the matrix, filling in the identifiers
  for (var rowIndex = 0; rowIndex < matrixData.length; rowIndex++) {
    var matrixRow = matrixData[rowIndex];

    var env = matrixRow[0]; // The first column in matrix is the environment

    // Fill the matrix with the latest identifiers and hyperlinks
    for (var colIndex = 2; colIndex < matrixRow.length; colIndex++) { // Start filling from column L (index 1)
      var repo = matrixSheet.getRange(6, colIndex + 11).getValue(); // Adjust for row headers (service_repos)
      var key = env + '_' + repo; // Create matching key

      if (latestTags[key]) {
        var deployTag = latestTags[key].identifier; 
        matrixData[rowIndex][colIndex] = deployTag;  // Set the identifier

        // Construct the hyperlink URL
        var repoUrl = 'https://github.com/techmatters/hrm'; // Assuming 'repo' is the repo name
        var linkUrl;
        var tagRegex = /^v\d+\.\d+\.\d+-qa\.\d+$/;

        // Create link depending on the tag format
        if (tagRegex.test(deployTag)) {
          linkUrl = repoUrl + '/releases/tag/' + deployTag;
        } else {
          linkUrl = repoUrl + '/tree/' + deployTag;
        }

        // Construct the hyperlink formula
        var linkFormula = '=HYPERLINK("' + linkUrl + '", "' + deployTag + '")';
        Logger.log('Setting formula: ' + linkFormula + ' at row: ' + (rowIndex + 6) + ', col: ' + (colIndex + 12)); // Adjust indices for correct cell

        // Set hyperlink formula in the matrix; adjust the row and column indices correctly
        matrixSheet.getRange(rowIndex + 6, colIndex + 11).setFormula(linkFormula);
      }
    }
  }

}

function addTimestampUTC() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Deployment Matrix');
  
  if (sheet) { // Check if the sheet exists
    var cell = sheet.getRange('Q1'); 
    var currentDate = new Date(); 
    var utcString = currentDate.toISOString().slice(0, 19).replace('T', ' '); 
    var readableTimestamp = utcString + ' UTC'; 
    cell.setValue(readableTimestamp); 
  } else {
    Logger.log("Sheet 'Deployment Matrix' not found.");
    SpreadsheetApp.getUi().alert("Sheet 'Deployment Matrix' not found.")
  }
}

function updateMatrix(){
  SpreadsheetApp.getUi().alert("Updating the matrix . . .")
  updateHelplineBasedRepos()
  updateHrm()
  addTimestampUTC()
  SpreadsheetApp.getUi().alert("Updated!")
}

// Function to create a custom menu
function onOpen() {
  updateMatrix()
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Deployment Matrix')
    .addItem('Update Matrix', 'updateMatrix')
    .addToUi();
}

function onEdit(e) {
  // Check if the active sheet is named "Deploys"
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() === "Deploys") {
    updateMatrix();
  }
}
````