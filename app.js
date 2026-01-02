const form = document.getElementById("item-form");
const list = document.getElementById("item-list");

let items = JSON.parse(localStorage.getItem("archive-items")) || [];

function save() {
  localStorage.setItem("archive-items", JSON.stringify(items));
}

function render() {
  list.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");

    const category = item.category || "uncategorized";
    const location = item.location || "unknown";

    li.textContent = `${item.name} — ${category} @ ${location}`;
    list.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim();
  const location = document.getElementById("location").value.trim();

  if (!name) return;

  items.push({ name, category, location });
  save();
  render();
  form.reset();
});

render();
