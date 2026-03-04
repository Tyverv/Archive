# Archive

Archive is a minimal, dependency-free web application for indexing and tracking items locally in the browser.

It provides a simple interface to record items with optional categories and locations, persisting all data via `localStorage`. Archive is designed to be lightweight, transparent, and easy to extend.

The application runs entirely client-side and requires no build step, backend, or external libraries.

---

## Features

- Add items with name, category, and location
- Edit or delete existing items
- Search across saved items
- Sort items by time, name, category, or location
- Filter to uncategorized and/or unknown-location items
- Export and import items via JSON backup
- Persistent storage using browser `localStorage`
- Clean, minimal UI
- Refined card-based layout and streamlined controls
- Zero dependencies
- Offline-capable

---

## Getting Started

Clone or download the repository and open `index.html` in a modern web browser.

archive/
├── index.html
├── style.css
└── app.js

No setup required.

---

## Current Limitations

This initial release intentionally keeps functionality minimal:

- Flat data model

These constraints are expected to be addressed in future versions.

---

## Version

**v0.1.0**

- Initial release
- Basic item indexing
- Local persistence via client storage
- Minimal interface

**v0.1.1**

- Fixed form layout overflow on smaller screens
- Improved input wrapping and spacing
- Cleaned up item rendering logic
- Prevented empty or invalid entries
- Minor internal stability improvements

**v0.2.0**

- Added item editing and deletion controls
- Added search filtering for stored items
- Displayed an empty state when no items match

**v0.2.1**

- Edited form defaults to fix undefined error
- Added a feature that shows how many items match the current search filter out of all items
- Polished the alignment of the search bar

**v0.3.0**

- Added sort controls (date, name, category, location)
- Added advanced filters for uncategorized and unknown-location entries
- Added duplicate-entry warning (non-blocking)
- Added JSON export/import for local backup and restore
- Improved input normalization and validation

---

**v0.3.1-alpha**

- Complete UI/UX refresh with card-based sections and improved visual hierarchy
- Streamlined add/update flow with clearer labels and contextual hints
- Added quick actions for clearing search and resetting active filters
- Preserved all v0.3.0 data and management features

---

## License

Unlicensed / experimental. Use freely.
