# Archive

Archive is a minimal, dependency-free web application for indexing and tracking items locally in the browser.

It provides a simple interface to record items with optional categories and locations, persisting all data via `localStorage`. Archive is designed to be lightweight, transparent, and easy to extend.

The application runs entirely client-side and requires no build step, backend, or external libraries.

---

## Features

- Add items with name, category, and location  
- Persistent storage using browser `localStorage`  
- Clean, minimal UI  
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

- No editing or deletion of items  
- Duplicate entries allowed  
- No sorting, filtering, or search  
- Basic input validation only  
- Flat data model  

These constraints are expected to be addressed in future versions.

---

## Version

**v0.1.0**

- Initial release  
- Basic item indexing  
- Local persistence via client storage  
- Minimal interface  

---

## License

Unlicensed / experimental. Use freely.
