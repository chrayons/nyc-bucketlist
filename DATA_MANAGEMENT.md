# Data Management Guide

## Overview
All entries (activities, museums, sightseeing, workspots) are now stored in JSON files and automatically rendered by JavaScript. This makes it much easier to manage your entries!

## File Structure
```
data/
  ├── activities.json    # All activity entries
  ├── museums.json       # All museum entries
  ├── sightseeing.json   # All sightseeing entries
  └── workspots.json     # All workspot entries
```

## How to Add/Edit Entries

### For Activities, Museums, and Sightseeing (Card-based pages):
1. Open the appropriate JSON file in `data/` folder
2. Each entry has this structure:
```json
{
  "title": "Entry Name",
  "url": "https://example.com",
  "status": "to-try" or "loved",
  "tags": ["manhattan", "to-try"],
  "image": "img/filename.webp",
  "imageAlt": "Description of image",
  "imageCredit": "Credit Name",
  "imageCreditUrl": "https://credit-url.com",
  "description": "Your description here. You can include <a href='...'>HTML links</a> in descriptions!"
}
```

### For Workspots (Table-based page):
1. Open `data/workspots.json`
2. Each entry has this structure:
```json
{
  "name": "Place Name",
  "url": "https://example.com",
  "status": "to-try" or "loved",
  "borough": "Manhattan",
  "location": "123 Main St, New York, NY 10001",
  "locationUrl": "https://maps.google.com/...",
  "hours": "Mon-Fri: 9:00a - 5:00p <br> Sat: 10:00a - 2:00p",
  "wifi": "Yes",
  "type": "Public library"
}
```

## Tips
- **Tags**: For card pages, tags should include the location (e.g., "manhattan", "brooklyn", "queens", "lic", "greenpoint", "outskirts", "the bronx") and the status ("to-try" or "loved")
- **HTML in descriptions**: You can include HTML links in descriptions - they'll be rendered properly!
- **Hours**: For workspots, you can use `<br>` tags for line breaks in hours
- **No need to edit HTML**: Just edit the JSON files and refresh your browser!

## What Changed
- All hardcoded HTML entries have been moved to JSON
- JavaScript automatically renders entries when pages load
- Filtering still works exactly the same way
- All existing entries have been preserved in JSON format

