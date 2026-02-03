const form = document.getElementById("item-form");
const list = document.getElementById("item-list");
const searchInput = document.getElementById("search");

const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const locationInput = document.getElementById("location");
const submitButton = form.querySelector("button");

let items = JSON.parse(localStorage.getItem("archive-items")) || [];
let editingId = null;

function ensureIds() {
  let updated = false;
  items = items.map(item => {
    if (item.id) {
      return item;
    }
    updated = true;
    return { ...item, id: crypto.randomUUID() };
  });
  if (updated) {
    save();
  }
}

function save() {
  localStorage.setItem("archive-items", JSON.stringify(items));
}

function render() {
  list.innerHTML = "";
  const query = searchInput.value.trim().toLowerCase();

  const filteredItems = items.filter(item => {
    if (!query) return true;
    return [item.name, item.category, item.location]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(query));
  });

  filteredItems.forEach(item => {
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
    });

    actions.append(editButton, deleteButton);
    li.append(details, actions);
    list.appendChild(li);
  });

  if (!filteredItems.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = query ? "No items match your search." : "No items yet.";
    list.appendChild(li);
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const location = locationInput.value.trim();

  if (!name) return;

  if (editingId) {
    items = items.map(item =>
      item.id === editingId ? { ...item, name, category, location } : item
    );
    editingId = null;
    submitButton.textContent = "Add";
  } else {
    items.push({ id: crypto.randomUUID(), name, category, location });
  }
  save();
  render();
  form.reset();
});

searchInput.addEventListener("input", render);

ensureIds();
render();
