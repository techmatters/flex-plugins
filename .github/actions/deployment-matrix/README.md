# Deployment Matrix Action

This GitHub Action is designed to automate the update of a deployment matrix in a [Google Sheet](https://docs.google.com/spreadsheets/d/1UccoRr51TiQR6tUsq3SrNsP9FVm0tMfhdWX7VvHXkbQ/edit?gid=1480518226#gid=1480518226), tracking the versions of various repositories deployed across different helplines and environments and repos (hrm ecs and lambdas). It uses a Google Apps Script to populate and maintain the matrix based on deployment data.

## How It Works

The Google Apps Script comprises two main functions, `updateHelplineBasedRepos` and `updateHrm`, which are called by the `updateMatrix` function. A custom menu named "Deployment Matrix" is added to the Google Sheet UI, allowing users to manually trigger the matrix update by selecting the "Update Matrix" option.

## Manual Intervention

1. If new Helplines Are Added: 
New rows need to be added to the "Deployment Matrix" sheet under the staging and production using the short form for helplines

2. If new regions are added in HRM sections: New rows need to added for the necesaary environment. This ensures that new regions are tracked in the matrix.