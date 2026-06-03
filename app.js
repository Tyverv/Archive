const STORAGE_KEY = "archive-items";
const DEFAULT_SORT = "updated-desc";
const DEFAULT_COLLECTION = "Unfiled";

const form = document.getElementById("item-form");
const list = document.getElementById("item-list");
const searchInput = document.getElementById("search");
const itemCount = document.getElementById("item-count");
const collectionCount = document.getElementById("collection-count");
const formFeedback = document.getElementById("form-feedback");

const nameInput = document.getElementById("name");
const collectionInput = document.getElementById("collection");
const categoryInput = document.getElementById("category");
const locationInput = document.getElementById("location");
const tagsInput = document.getElementById("tags");
const descriptionInput = document.getElementById("description");
const submitButton = form.querySelector("button[type='submit']");
const cancelEditButton = document.getElementById("cancel-edit");

const sortBySelect = document.getElementById("sort-by");
const collectionFilterSelect = document.getElementById("collection-filter");
const uncategorizedOnlyInput = document.getElementById("filter-uncategorized");
const unknownLocationOnlyInput = document.getElementById("filter-unknown-location");
const untaggedOnlyInput = document.getElementById("filter-untagged");

const exportButton = document.getElementById("export-btn");
const importFileInput = document.getElementById("import-file");
const clearSearchButton = document.getElementById("clear-search");
const resetControlsButton = document.getElementById("reset-controls");

const detailDialog = document.getElementById("detail-dialog");
const closeDetailButton = document.getElementById("close-detail");
const detailCollection = document.getElementById("detail-collection");
const detailTitle = document.getElementById("detail-title");
const detailDescription = document.getElementById("detail-description");
const detailCategory = document.getElementById("detail-category");
const detailLocation = document.getElementById("detail-location");
const detailCreated = document.getElementById("detail-created");
const detailUpdated = document.getElementById("detail-updated");
const detailTags = document.getElementById("detail-tags");

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeLongText(value) {
  return (value || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeTags(value) {
  const rawTags = Array.isArray(value) ? value : String(value || "").split(",");
  const seen = new Set();

  return rawTags
    .map(tag => normalizeText(tag).replace(/^#/, ""))
    .filter(Boolean)
    .filter(tag => {
      const key = tag.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function timestamp(value) {
  return Number.isFinite(Number(value)) ? Number(value) : Date.now();
}

function normalizeItem(raw) {
  const createdAt = timestamp(raw.createdAt);
  return {
    id: raw.id || crypto.randomUUID(),
    name: normalizeText(raw.name),
    collection: normalizeText(raw.collection),
    category: normalizeText(raw.category),
    location: normalizeText(raw.location),
    description: normalizeLongText(raw.description),
    tags: normalizeTags(raw.tags),
    createdAt,
    updatedAt: timestamp(raw.updatedAt || raw.createdAt || createdAt)
  };
}

function ensureSchema() {
  let updated = false;
  items = items
    .map(item => {
      const normalized = normalizeItem(item);
      if (JSON.stringify(normalized) !== JSON.stringify(item)) {
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

function getCollectionName(item) {
  return item.collection || DEFAULT_COLLECTION;
}

function getCollectionOptions() {
  return [...new Set(items.map(getCollectionName))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

function syncCollectionFilter() {
  const currentValue = collectionFilterSelect.value;
  const collections = getCollectionOptions();

  collectionFilterSelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All collections";
  collectionFilterSelect.appendChild(allOption);

  collections.forEach(collection => {
    const option = document.createElement("option");
    option.value = collection;
    option.textContent = collection;
    collectionFilterSelect.appendChild(option);
  });

  collectionFilterSelect.value = collections.includes(currentValue) ? currentValue : "";
}

function getItemSignature({ name, collection, category, location }) {
  return [name, collection, category, location]
    .map(value => normalizeText(value).toLowerCase())
    .join("|");
}

function setFeedback(message, tone = "muted") {
  formFeedback.textContent = message;
  formFeedback.className = `feedback ${tone}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function sortItems(entries, sortBy) {
  const sorted = [...entries];
  const stringCompare = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" });

  sorted.sort((a, b) => {
    const aCategory = a.category || "uncategorized";
    const bCategory = b.category || "uncategorized";
    const aLocation = a.location || "unknown";
    const bLocation = b.location || "unknown";
    const aCollection = getCollectionName(a);
    const bCollection = getCollectionName(b);

    switch (sortBy) {
      case "updated-asc":
        return a.updatedAt - b.updatedAt;
      case "created-asc":
        return a.createdAt - b.createdAt;
      case "created-desc":
        return b.createdAt - a.createdAt;
      case "name-asc":
        return stringCompare(a.name, b.name);
      case "name-desc":
        return stringCompare(b.name, a.name);
      case "collection-asc":
        return stringCompare(aCollection, bCollection) || stringCompare(a.name, b.name);
      case "collection-desc":
        return stringCompare(bCollection, aCollection) || stringCompare(a.name, b.name);
      case "category-asc":
        return stringCompare(aCategory, bCategory);
      case "category-desc":
        return stringCompare(bCategory, aCategory);
      case "location-asc":
        return stringCompare(aLocation, bLocation);
      case "location-desc":
        return stringCompare(bLocation, aLocation);
      case "updated-desc":
      default:
        return b.updatedAt - a.updatedAt;
    }
  });

  return sorted;
}

function createTagList(tags) {
  const wrapper = document.createElement("div");
  wrapper.className = "tag-list";

  if (!tags.length) {
    const emptyTag = document.createElement("span");
    emptyTag.className = "tag muted-tag";
    emptyTag.textContent = "No tags";
    wrapper.appendChild(emptyTag);
    return wrapper;
  }

  tags.forEach(tag => {
    const pill = document.createElement("span");
    pill.className = "tag";
    pill.textContent = `#${tag}`;
    wrapper.appendChild(pill);
  });

  return wrapper;
}

function createMetaRow(label, value) {
  const row = document.createElement("span");
  row.textContent = `${label}: ${value}`;
  return row;
}

function getVisibleItems() {
  const query = normalizeText(searchInput.value).toLowerCase();
  const collectionFilter = collectionFilterSelect.value;
  const uncategorizedOnly = uncategorizedOnlyInput.checked;
  const unknownLocationOnly = unknownLocationOnlyInput.checked;
  const untaggedOnly = untaggedOnlyInput.checked;

  return items.filter(item => {
    if (collectionFilter && getCollectionName(item) !== collectionFilter) {
      return false;
    }

    if (uncategorizedOnly && item.category) {
      return false;
    }

    if (unknownLocationOnly && item.location) {
      return false;
    }

    if (untaggedOnly && item.tags.length) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      item.name,
      getCollectionName(item),
      item.category,
      item.location,
      item.description,
      ...item.tags
    ]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(query));
  });
}

function startEditing(item) {
  editingId = item.id;
  nameInput.value = item.name;
  collectionInput.value = item.collection;
  categoryInput.value = item.category;
  locationInput.value = item.location;
  tagsInput.value = item.tags.join(", ");
  descriptionInput.value = item.description;
  submitButton.textContent = "Update record";
  cancelEditButton.classList.remove("hidden");
  setFeedback("Editing record…", "muted");
  nameInput.focus();
}

function stopEditing() {
  editingId = null;
  form.reset();
  submitButton.textContent = "Add record";
  cancelEditButton.classList.add("hidden");
}

function showDetails(item) {
  detailCollection.textContent = getCollectionName(item);
  detailTitle.textContent = item.name;
  detailDescription.textContent = item.description || "No description yet.";
  detailCategory.textContent = item.category || "Uncategorized";
  detailLocation.textContent = item.location || "Unknown";
  detailCreated.textContent = formatDate(item.createdAt);
  detailUpdated.textContent = formatDate(item.updatedAt);
  detailTags.innerHTML = "";
  detailTags.append(...Array.from(createTagList(item.tags).children));
  detailDialog.showModal();
}

function render() {
  syncCollectionFilter();
  list.innerHTML = "";

  const query = normalizeText(searchInput.value);
  const visibleItems = sortItems(getVisibleItems(), sortBySelect.value);
  const collectionTotal = getCollectionOptions().filter(collection => collection !== DEFAULT_COLLECTION).length;

  itemCount.textContent = `Showing ${visibleItems.length} of ${items.length}`;
  collectionCount.textContent = `${collectionTotal} collection${collectionTotal === 1 ? "" : "s"}`;

  visibleItems.forEach(item => {
    const li = document.createElement("li");
    const details = document.createElement("div");
    const titleRow = document.createElement("div");
    const title = document.createElement("strong");
    const collectionBadge = document.createElement("span");
    const description = document.createElement("p");
    const meta = document.createElement("div");
    const actions = document.createElement("div");
    const viewButton = document.createElement("button");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    li.className = "record-item";
    details.className = "record-details";
    titleRow.className = "record-title-row";
    collectionBadge.className = "collection-badge";
    title.textContent = item.name;
    collectionBadge.textContent = getCollectionName(item);
    titleRow.append(title, collectionBadge);

    description.className = "record-description";
    description.textContent = item.description || "No description added yet.";

    meta.className = "item-meta";
    meta.append(
      createMetaRow("Category", item.category || "Uncategorized"),
      createMetaRow("Location", item.location || "Unknown"),
      createMetaRow("Updated", formatDate(item.updatedAt))
    );

    details.append(titleRow, description, createTagList(item.tags), meta);
    actions.className = "item-actions";

    viewButton.type = "button";
    viewButton.textContent = "Details";
    viewButton.className = "secondary";
    viewButton.addEventListener("click", () => showDetails(item));

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "secondary";
    editButton.addEventListener("click", () => startEditing(item));

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "danger";
    deleteButton.addEventListener("click", () => {
      items = items.filter(entry => entry.id !== item.id);
      if (editingId === item.id) {
        stopEditing();
      }
      save();
      render();
      setFeedback("Record deleted.", "muted");
    });

    actions.append(viewButton, editButton, deleteButton);
    li.append(details, actions);
    list.appendChild(li);
  });

  if (!visibleItems.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = query ? "No records match your search or filters." : "No records yet.";
    list.appendChild(li);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const now = Date.now();
  const name = normalizeText(nameInput.value);
  const collection = normalizeText(collectionInput.value);
  const category = normalizeText(categoryInput.value);
  const location = normalizeText(locationInput.value);
  const tags = normalizeTags(tagsInput.value);
  const description = normalizeLongText(descriptionInput.value);

  if (name.length < 2) {
    setFeedback("Name must be at least 2 characters.", "danger");
    return;
  }

  const incomingSignature = getItemSignature({ name, collection, category, location });
  const duplicateExists = items.some(item => {
    if (editingId && item.id === editingId) {
      return false;
    }
    return getItemSignature(item) === incomingSignature;
  });

  if (editingId) {
    items = items.map(item =>
      item.id === editingId
        ? { ...item, name, collection, category, location, tags, description, updatedAt: now }
        : item
    );
    stopEditing();
    setFeedback("Record updated.", duplicateExists ? "warning" : "success");
  } else {
    items.push({
      id: crypto.randomUUID(),
      name,
      collection,
      category,
      location,
      description,
      tags,
      createdAt: now,
      updatedAt: now
    });
    form.reset();
    setFeedback("Record added.", duplicateExists ? "warning" : "success");
  }

  if (duplicateExists) {
    setFeedback("Saved, but this looks like a duplicate record.", "warning");
  }

  save();
  render();
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
    version: "0.4.0-beta",
    exportedAt: new Date().toISOString(),
    collections: getCollectionOptions(),
    items
  };

  downloadJson(`archive-export-${Date.now()}.json`, JSON.stringify(payload, null, 2));
  setFeedback("Exported structured records JSON backup.", "success");
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

    const normalized = importedItems.map(normalizeItem).filter(item => item.name);

    items = normalized;
    stopEditing();
    save();
    render();
    setFeedback(`Imported ${normalized.length} structured record(s).`, "success");
  } catch {
    setFeedback("Import failed: invalid JSON.", "danger");
  } finally {
    importFileInput.value = "";
  }
});

sortBySelect.value = DEFAULT_SORT;

searchInput.addEventListener("input", render);
sortBySelect.addEventListener("change", render);
collectionFilterSelect.addEventListener("change", render);
uncategorizedOnlyInput.addEventListener("change", render);
unknownLocationOnlyInput.addEventListener("change", render);
untaggedOnlyInput.addEventListener("change", render);

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  render();
  searchInput.focus();
});

resetControlsButton.addEventListener("click", () => {
  searchInput.value = "";
  sortBySelect.value = DEFAULT_SORT;
  collectionFilterSelect.value = "";
  uncategorizedOnlyInput.checked = false;
  unknownLocationOnlyInput.checked = false;
  untaggedOnlyInput.checked = false;
  render();
  setFeedback("Filters reset.", "muted");
});

cancelEditButton.addEventListener("click", () => {
  stopEditing();
  setFeedback("Edit canceled.", "muted");
});

closeDetailButton.addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", event => {
  if (event.target === detailDialog) {
    detailDialog.close();
  }
});

ensureSchema();
setFeedback("Ready for structured records.", "muted");
render();
