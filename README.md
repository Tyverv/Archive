# Archive

Archive is a dependency-free, local-first web app for cataloging things you want to remember. It runs entirely in the browser, stores data in `localStorage`, and keeps the interface intentionally lightweight so records are easy to create, search, export, and restore.

## v0.4.0-beta: Structured Records

Archive has moved from a simple item index into a beta-stage structured record system. Records now include richer context, organization metadata, and a dedicated detail view while preserving the zero-build, offline-friendly workflow that defined the early alpha releases.

This beta is intended to feel more like a real personal archive: not just a list of names, but a set of searchable records with descriptions, tags, collections, locations, timestamps, and portable JSON backups.

---

## Highlights

- **Rich item details**: records can now include descriptions, tags, collections, categories, locations, created timestamps, and updated timestamps.
- **Descriptions**: add longer notes for condition, provenance, reminders, serial numbers, project context, or anything else worth preserving.
- **Tags**: attach comma-separated tags and search across them.
- **Updated timestamps**: every record tracks when it was created and when it was last changed.
- **Item detail modal**: open a dedicated detail view for the full record, metadata, and tags.
- **Collections**: group records into named collections and filter the archive by collection.
- **Beta UI refresh**: wider layout, beta release language, stronger visual hierarchy, richer record cards, and improved controls.
- **Import/export support**: export structured records as JSON and import older or current Archive backups.

---

## Features

- Add, edit, and delete structured item records
- Record name, collection, category, location, tags, and description
- View complete item details in a modal
- Track `createdAt` and `updatedAt` timestamps
- Search across names, descriptions, tags, collections, categories, and locations
- Sort by updated time, created time, name, collection, category, or location
- Filter by collection, uncategorized items, unknown-location items, or untagged items
- Export and import JSON backups
- Automatic schema normalization for older saved items
- Persistent storage using browser `localStorage`
- No backend, build step, package manager, or external dependency
- Offline-capable after the files are available locally

---

## Getting Started

Clone or download the repository and open `index.html` in a modern web browser.

```text
archive/
├── index.html
├── style.css
└── app.js
```

No setup is required. Archive is plain HTML, CSS, and JavaScript.

---

## Data Model

Archive stores records as JSON in browser `localStorage` under the `archive-items` key. A v0.4.0-beta record uses the following shape:

```json
{
  "id": "record-id",
  "name": "Vintage camera",
  "collection": "Studio gear",
  "category": "Electronics",
  "location": "Shelf A-3",
  "description": "Condition notes and context.",
  "tags": ["analog", "repair", "favorite"],
  "createdAt": 1710000000000,
  "updatedAt": 1710000000000
}
```

Older records are normalized automatically when the app loads. Missing structured fields are filled with safe defaults so previous data can continue to work in the beta.

---

## Backups

Use **Export JSON** to download a portable backup containing the current beta version, export time, collections, and item records.

Use **Import JSON** to restore either:

- a raw array of records, or
- an object with an `items` array.

Importing replaces the current local archive, so export first if you want a fallback copy.

---

## Current Limitations

This is still a browser-local beta. Keep these constraints in mind:

- Data is stored only in the current browser profile unless exported.
- There is no multi-device sync or backend storage.
- Collections are derived from item records rather than managed as separate entities.
- Detail views are modal-based rather than routed pages.
- Large archives may eventually need pagination or indexed search.

These are reasonable next targets as Archive moves beyond beta.

---

## Version History

### v0.4.0-beta

- Introduced structured records with descriptions, tags, collections, and updated timestamps
- Added item detail modal for complete record review
- Added collection filtering and collection-aware sorting
- Expanded search to descriptions, tags, and collections
- Added untagged filtering
- Updated export payloads for structured records
- Refreshed README and interface language for beta transition

### v0.3.1-alpha

- Complete UI/UX refresh with card-based sections and improved visual hierarchy
- Streamlined add/update flow with clearer labels and contextual hints
- Added quick actions for clearing search and resetting active filters
- Preserved all v0.3.0 data and management features

### v0.3.0

- Added sort controls for date, name, category, and location
- Added advanced filters for uncategorized and unknown-location entries
- Added duplicate-entry warning
- Added JSON export/import for local backup and restore
- Improved input normalization and validation

### v0.2.1

- Fixed edit form defaults
- Added visible match counts for search results
- Polished search bar alignment

### v0.2.0

- Added item editing and deletion controls
- Added search filtering for stored items
- Displayed an empty state when no items match

### v0.1.1

- Fixed form layout overflow on smaller screens
- Improved input wrapping and spacing
- Cleaned up item rendering logic
- Prevented empty or invalid entries
- Added minor internal stability improvements

### v0.1.0

- Initial release
- Basic item indexing
- Local persistence via client storage
- Minimal interface

---

## License

Unlicensed / experimental. Use freely.
