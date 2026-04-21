let currentLocation = "";

// ================= GEO =================
function getLocation() {
  const status = document.getElementById("statusGeo");

  if (!navigator.geolocation) {
    status.innerText = "Geolocalização não suportada.";
    return;
  }

  status.innerText = "Localizando...";

  navigator.geolocation.watchPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    currentLocation = `https://www.google.com/maps?q=${lat},${lon}`;

    status.innerText = `Localização: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    document.getElementById("mapFrame").src =
      `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&marker=${lat}%2C${lon}`;

  }, () => {
    status.innerText = "Erro ao obter localização.";
  });
}

// ================= CONTATOS =================
function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(c) {
  localStorage.setItem("contacts", JSON.stringify(c));
}

function renderContacts() {
  const list = document.getElementById("contactList");
  list.innerHTML = "";

  getContacts().forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${c.name} (${c.phone})
      <button onclick="removeContact(${i})">X</button>
    `;
    list.appendChild(li);
  });
}

function addContact(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  const contacts = getContacts();
  contacts.push({ name, phone });

  saveContacts(contacts);
  renderContacts();

  e.target.reset();
}

function removeContact(i) {
  const contacts = getContacts();
  contacts.splice(i, 1);
  saveContacts(contacts);
  renderContacts();
}

// ================= WHATS =================
function sendAlert() {
  if (!currentLocation) {
    alert("Ative a localização primeiro!");
    return;
  }

  const contacts = getContacts();

  if (contacts.length === 0) {
    alert("Adicione um contato!");
    return;
  }

  const msg = encodeURIComponent(
    `🚨 Preciso de ajuda! Minha localização: ${currentLocation}`
  );

  contacts.forEach(c => {
    window.open(`https://wa.me/${c.phone}?text=${msg}`, "_blank");
  });
}

// INIT
window.onload = renderContacts;