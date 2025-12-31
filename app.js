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
    li.textContent = `${item.name} — ${item.category || "uncategorized"} @ ${item.location || "unknown"}`;
    list.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const item = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    location: document.getElementById("location").value
  };

  items.push(item);
  save();
  render();
  form.reset();
});

render();
