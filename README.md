# Costume Party Manager

A simple web application to manage costume reservations for your party. This system helps prevent costume duplicates by allowing guests to check and reserve their costume ideas.

## Features

- Check if a costume is already taken
- Reserve a costume
- View all reserved costumes
- Real-time updates
- Mobile-friendly interface

## Setup Instructions

1. Create a new Google Sheet
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it 'Costume Party Manager'
   - Create two columns: 'Name' and 'Costume'

2. Set up Google Apps Script
   - In your Google Sheet, go to Extensions > Apps Script
   - Copy the following code into the script editor:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'checkAndReserve') {
    return checkAndReserveCostume(data.name, data.costume, sheet);
  } else if (data.action === 'getReserved') {
    return getReservedCostumes(sheet);
  }
}

function checkAndReserveCostume(name, costume, sheet) {
  const data = sheet.getDataRange().getValues();
  const costumes = data.map(row => row[1].toLowerCase());
  
  if (costumes.includes(costume.toLowerCase())) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'this costume is already taken!'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  sheet.appendRow([name, costume]);
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Costume reserved successfully!'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getReservedCostumes(sheet) {
  const data = sheet.getDataRange().getValues();
  const reservations = data.slice(1).map(row => ({
    name: row[0],
    costume: row[1]
  }));
  
  return ContentService.createTextOutput(JSON.stringify({
    reservations: reservations
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy the Google Apps Script
   - Click on 'Deploy' > 'New deployment'
   - Choose 'Web app'
   - Set the following:
     - Execute as: 'Me'
     - Who has access: 'Anyone'
   - Click 'Deploy'
   - Copy the deployment URL

4. Update the website configuration
   - Open `js/app.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with your deployment URL

5. Deploy to GitHub Pages
   - Create a new repository on GitHub
   - Push this code to your repository
   - Go to repository Settings > Pages
   - Enable GitHub Pages from the main branch

## Usage

1. Share the GitHub Pages URL with your party guests
2. Guests can enter their name and desired costume
3. The system will check if the costume is available
4. If available, the costume will be reserved
5. All guests can see the list of reserved costumes

## Security Note

This is a simple implementation meant for fun and small gatherings. The system operates on an honor system and doesn't include authentication. 