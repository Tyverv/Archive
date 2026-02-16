const STORAGE_KEY = "archive-items";
const DEFAULT_SORT = "created-desc";

const form = document.getElementById("item-form");
const list = document.getElementById("item-list");
const searchInput = document.getElementById("search");
const itemCount = document.getElementById("item-count");
const formFeedback = document.getElementById("form-feedback");

const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const locationInput = document.getElementById("location");
const submitButton = form.querySelector("button");

const sortBySelect = document.getElementById("sort-by");
const uncategorizedOnlyInput = document.getElementById("filter-uncategorized");
const unknownLocationOnlyInput = document.getElementById("filter-unknown-location");

const exportButton = document.getElementById("export-btn");
const importFileInput = document.getElementById("import-file");

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeItem(raw) {
  return {
    id: raw.id || crypto.randomUUID(),
    name: normalizeText(raw.name),
    category: normalizeText(raw.category),
    location: normalizeText(raw.location),
    createdAt: raw.createdAt || Date.now()
  };
}

function ensureSchema() {
  let updated = false;
  items = items
    .map(item => {
      const normalized = normalizeItem(item);
      if (
        normalized.id !== item.id ||
        normalized.name !== item.name ||
        normalized.category !== item.category ||
        normalized.location !== item.location ||
        normalized.createdAt !== item.createdAt
      ) {
        updated = true;
      }
      return normalized;
    })
    .filter(item => item.name);

  if (updated) {
    save();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getItemSignature({ name, category, location }) {
  return [name, category, location].map(value => normalizeText(value).toLowerCase()).join("|");
}

function setFeedback(message, tone = "muted") {
  formFeedback.textContent = message;
  formFeedback.className = `feedback ${tone}`;
}

function sortItems(entries, sortBy) {
  const sorted = [...entries];

  const stringCompare = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" });

  sorted.sort((a, b) => {
    const aCategory = a.category || "uncategorized";
    const bCategory = b.category || "uncategorized";
    const aLocation = a.location || "unknown";
    const bLocation = b.location || "unknown";

    switch (sortBy) {
      case "created-asc":
        return a.createdAt - b.createdAt;
      case "name-asc":
        return stringCompare(a.name, b.name);
      case "name-desc":
        return stringCompare(b.name, a.name);
      case "category-asc":
        return stringCompare(aCategory, bCategory);
      case "category-desc":
        return stringCompare(bCategory, aCategory);
      case "location-asc":
        return stringCompare(aLocation, bLocation);
      case "location-desc":
        return stringCompare(bLocation, aLocation);
      case "created-desc":
      default:
        return b.createdAt - a.createdAt;
    }
  });

  return sorted;
}

function render() {
  list.innerHTML = "";

  const query = normalizeText(searchInput.value).toLowerCase();
  const uncategorizedOnly = uncategorizedOnlyInput.checked;
  const unknownLocationOnly = unknownLocationOnlyInput.checked;
  const sortBy = sortBySelect.value;

  const filteredItems = items.filter(item => {
    if (uncategorizedOnly && item.category) {
      return false;
    }

    if (unknownLocationOnly && item.location) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [item.name, item.category, item.location]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(query));
  });

  const visibleItems = sortItems(filteredItems, sortBy);

  itemCount.textContent = `Showing ${visibleItems.length} of ${items.length}`;

  visibleItems.forEach(item => {
    const li = document.createElement("li");
    const details = document.createElement("div");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    const category = item.category || "uncategorized";
    const location = item.location || "unknown";

    details.textContent = `${item.name} — ${category} @ ${location}`;
    actions.className = "item-actions";

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "secondary";
    editButton.addEventListener("click", () => {
      editingId = item.id;
      nameInput.value = item.name;
      categoryInput.value = item.category;
      locationInput.value = item.location;
      submitButton.textContent = "Update";
      setFeedback("Editing item…", "muted");
      nameInput.focus();
    });

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "danger";
    deleteButton.addEventListener("click", () => {
      items = items.filter(entry => entry.id !== item.id);
      if (editingId === item.id) {
        editingId = null;
        form.reset();
        submitButton.textContent = "Add";
      }
      save();
      render();
      setFeedback("Item deleted.", "muted");
    });

    actions.append(editButton, deleteButton);
    li.append(details, actions);
    list.appendChild(li);
  });

  if (!visibleItems.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = query ? "No items match your search." : "No items yet.";
    list.appendChild(li);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = normalizeText(nameInput.value);
  const category = normalizeText(categoryInput.value);
  const location = normalizeText(locationInput.value);

  if (name.length < 2) {
    setFeedback("Name must be at least 2 characters.", "danger");
    return;
  }

  const incomingSignature = getItemSignature({ name, category, location });
  const duplicateExists = items.some(item => {
    if (editingId && item.id === editingId) {
      return false;
    }
    return getItemSignature(item) === incomingSignature;
  });

  if (editingId) {
    items = items.map(item =>
      item.id === editingId ? { ...item, name, category, location } : item
    );
    editingId = null;
    submitButton.textContent = "Add";
    setFeedback("Item updated.", duplicateExists ? "warning" : "success");
  } else {
    items.push({
      id: crypto.randomUUID(),
      name,
      category,
      location,
      createdAt: Date.now()
    });
    setFeedback("Item added.", duplicateExists ? "warning" : "success");
  }

  if (duplicateExists) {
    setFeedback("Saved, but this looks like a duplicate entry.", "warning");
  }

  save();
  render();
  form.reset();
});

function downloadJson(filename, jsonText) {
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

exportButton.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    items
  };

  downloadJson(`archive-export-${Date.now()}.json`, JSON.stringify(payload, null, 2));
  setFeedback("Exported JSON backup.", "success");
});

importFileInput.addEventListener("change", async event => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const importedItems = Array.isArray(parsed) ? parsed : parsed.items;

    if (!Array.isArray(importedItems)) {
      setFeedback("Import failed: expected an array or { items: [] }.", "danger");
      return;
    }

    const normalized = importedItems
      .map(normalizeItem)
      .filter(item => item.name);

    items = normalized;
    editingId = null;
    form.reset();
    submitButton.textContent = "Add";
    save();
    render();
    setFeedback(`Imported ${normalized.length} item(s).`, "success");
  } catch {
    setFeedback("Import failed: invalid JSON.", "danger");
  } finally {
    importFileInput.value = "";
  }
});

sortBySelect.value = DEFAULT_SORT;

searchInput.addEventListener("input", render);
sortBySelect.addEventListener("change", render);
uncategorizedOnlyInput.addEventListener("change", render);
unknownLocationOnlyInput.addEventListener("change", render);

ensureSchema();
setFeedback("Ready.", "muted");
render();
