let artifactCount = 0;
let currentCharacter = null;
let isTableView = false;
let allCharacters = [];

function addArtifact(data = null) {
  artifactCount++;
  const container = document.getElementById("artifactList");

  const artifactDiv = document.createElement("div");
  artifactDiv.className = "artifact";

  artifactDiv.innerHTML = `
    <h3>Artefatto ${artifactCount}</h3>
    <input type="text" placeholder="Slot" value="${data?.slot || ""}">
    <input type="text" placeholder="Set" value="${data?.set || ""}">
    <input type="text" class="main-stat" placeholder="Main Stat" value="${
      data?.mainStat || ""
    }">
    <input type="text" class="sub-stat" placeholder="Sub Stat 1" value="${
      data?.subStats?.[0] || ""
    }">
    <input type="text" class="sub-stat" placeholder="Sub Stat 2" value="${
      data?.subStats?.[1] || ""
    }">
    <input type="text" class="sub-stat" placeholder="Sub Stat 3" value="${
      data?.subStats?.[2] || ""
    }">
    <input type="text" class="sub-stat" placeholder="Sub Stat 4" value="${
      data?.subStats?.[3] || ""
    }">
    <input type="number" placeholder="Livello (+)" value="${
      data?.livello || ""
    }">
  `;

  container.appendChild(artifactDiv);
  enableAutoSave();
  if (isTableView) {
    updateArtifactTable();
  }
}

function saveData() {
  if (!currentCharacter) {
    showNotification("Nessun personaggio selezionato! ⚠️");
    return;
  }

  const charData = collectFormData();
  saveCharacterData(charData);

  // Mostra i dati nel pre
  document.getElementById("output").textContent = JSON.stringify(
    charData,
    null,
    2
  );
}

function loadSelectedCharacter() {
  currentCharacter = document.getElementById("characterSelect").value;
  loadData();
}

function loadData() {
  if (!currentCharacter) {
    showNotification("Nessun personaggio selezionato! ⚠️");
    return;
  }

  const storageKey = `genshinSchedario_${currentCharacter
    .toLowerCase()
    .replace(/\s+/g, "_")}`;
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    const charData = JSON.parse(savedData);
    populateCharacterForm(charData);
    document.getElementById("output").textContent = JSON.stringify(
      charData,
      null,
      2
    );
    showNotification(`Dati di ${currentCharacter} caricati! 📂`);
  } else {
    showNotification(`Nessun dato trovato per ${currentCharacter}! ⚠️`);
  }

  // Carica anche i team comps salvati
  loadSavedTeams(currentCharacter);
}

function resetData() {
  if (!currentCharacter) {
    showNotification("Nessun personaggio selezionato! ⚠️");
    return;
  }

  resetCharacterData();
}

function addNewCharacter() {
  const name = document.getElementById("newCharacterName").value.trim();
  if (!name) {
    showNotification("Inserisci un nome valido! ⚠️");
    return;
  }

  // Verifica se il personaggio esiste già
  const existingCharacter = allCharacters.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (!existingCharacter) {
    showNotification("Personaggio non trovato nella lista! ⚠️");
    return;
  }

  // Seleziona il personaggio
  selectCharacter(name);

  // Pulisci il campo di input
  document.getElementById("newCharacterName").value = "";

  showNotification(`Personaggio "${name}" aggiunto! 🎉`);
}

function clearForm() {
  document.getElementById("charName").value = "";
  document.getElementById("weapon").value = "";
  document.getElementById("level").value = "";
  document.getElementById("constellation").value = "";
  document.getElementById("normalAttack").value = "";
  document.getElementById("elementalSkill").value = "";
  document.getElementById("burst").value = "";
  document.getElementById("artifactList").innerHTML = "";
  artifactCount = 0;
  document.getElementById("output").textContent = "";
}

// 🧪 Ordinamento artefatti
function sortArtifacts() {
  const criterio = document.getElementById("sortArtifacts").value;
  if (!criterio) return loadData();

  const allData = JSON.parse(localStorage.getItem("genshinSchedario") || "{}");
  const charData = allData[currentCharacter];
  if (!charData) return;

  let sorted = [...charData.artefatti];

  if (criterio === "slot") {
    sorted.sort((a, b) => (a.slot || "").localeCompare(b.slot || ""));
  } else if (criterio === "mainStat") {
    sorted.sort((a, b) => (a.mainStat || "").localeCompare(b.mainStat || ""));
  } else if (criterio === "livello") {
    sorted.sort((a, b) => parseInt(b.livello || 0) - parseInt(a.livello || 0));
  }

  if (isTableView) {
    updateArtifactTable(sorted);
  } else {
    document.getElementById("artifactList").innerHTML = "";
    artifactCount = 0;
    sorted.forEach((art) => addArtifact(art));
  }
}

// 💾 Salvataggio automatico migliorato
function enableAutoSave() {
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.removeEventListener("input", autoSave);
    input.removeEventListener("change", autoSave);
    input.addEventListener("input", autoSave);
    input.addEventListener("change", autoSave);
  });
}

// Funzione di salvataggio automatico
function autoSave() {
  if (!currentCharacter) return;

  const charData = collectFormData();
  saveCharacterData(charData);
}

// 📤 Esportazione JSON
function exportData() {
  const data = localStorage.getItem("genshinSchedario");
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "genshin_schedario.json";
  a.click();

  URL.revokeObjectURL(url);
}

// 📥 Importazione JSON
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      localStorage.setItem("genshinSchedario", JSON.stringify(imported));
      location.reload();
    } catch (err) {
      alert("Errore nel file JSON.");
    }
  };
  reader.readAsText(file);
}

// 👤 Popola selettore personaggi
function populateCharacterList() {
  const saved = JSON.parse(localStorage.getItem("genshinSchedario") || "{}");
  const select = document.getElementById("characterSelect");
  if (!select) return;

  for (let name in saved) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  }
}

// 🔍 Filtra artefatti
function filterArtifacts() {
  if (!currentCharacter) return;

  const allData = JSON.parse(localStorage.getItem("genshinSchedario") || "{}");
  const charData = allData[currentCharacter];
  if (!charData) return;

  const slotFilter = document.getElementById("filterSlot").value;
  const setFilter = document.getElementById("filterSet").value.toLowerCase();

  let filtered = charData.artefatti.filter((artifact) => {
    const slotMatch = !slotFilter || artifact.slot === slotFilter;
    const setMatch =
      !setFilter ||
      (artifact.set && artifact.set.toLowerCase().includes(setFilter));
    return slotMatch && setMatch;
  });

  if (isTableView) {
    updateArtifactTable(filtered);
  } else {
    displayFilteredArtifacts(filtered);
  }
}

// 📊 Aggiorna tabella artefatti
function updateArtifactTable(artifacts = null) {
  if (!currentCharacter) return;

  const allData = JSON.parse(localStorage.getItem("genshinSchedario") || "{}");
  const charData = allData[currentCharacter];
  if (!charData) return;

  const artifactsToShow = artifacts || charData.artefatti;
  const tbody = document.getElementById("artifactTableBody");
  tbody.innerHTML = "";

  artifactsToShow.forEach((artifact, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${artifact.slot || "-"}</td>
      <td>${artifact.set || "-"}</td>
      <td class="main-stat">${artifact.mainStat || "-"}</td>
      <td class="sub-stats">${
        artifact.subStats?.filter((s) => s).join(", ") || "-"
      }</td>
      <td>+${artifact.livello || "0"}</td>
      <td>
        <button onclick="editArtifact(${index})" class="btn-small">Modifica</button>
        <button onclick="deleteArtifact(${index})" class="btn-small btn-danger">Elimina</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// 🔄 Cambia vista artefatti
function toggleArtifactView() {
  isTableView = !isTableView;
  const tableDiv = document.getElementById("artifactTable");
  const formDiv = document.getElementById("artifactForm");
  const toggleBtn = document.getElementById("toggleView");

  if (isTableView) {
    tableDiv.style.display = "block";
    formDiv.style.display = "none";
    toggleBtn.textContent = "Visualizza Form";
    updateArtifactTable();
  } else {
    tableDiv.style.display = "none";
    formDiv.style.display = "block";
    toggleBtn.textContent = "Visualizza Tabella";
  }
}

// ✏️ Modifica artefatto dalla tabella
function editArtifact(index) {
  isTableView = false;
  toggleArtifactView();

  // Trova l'artefatto corrispondente nel form
  const artifactDivs = document.querySelectorAll(".artifact");
  if (artifactDivs[index]) {
    artifactDivs[index].scrollIntoView({ behavior: "smooth" });
  }
}

// 🗑️ Elimina artefatto
function deleteArtifact(index) {
  if (!confirm("Sei sicuro di voler eliminare questo artefatto?")) return;

  const allData = JSON.parse(localStorage.getItem("genshinSchedario") || "{}");
  const charData = allData[currentCharacter];
  if (!charData) return;

  charData.artefatti.splice(index, 1);
  localStorage.setItem("genshinSchedario", JSON.stringify(allData));

  if (isTableView) {
    updateArtifactTable();
  } else {
    loadData();
  }
}

// 📋 Mostra artefatti filtrati nel form
function displayFilteredArtifacts(filtered) {
  document.getElementById("artifactList").innerHTML = "";
  artifactCount = 0;
  filtered.forEach((art) => addArtifact(art));
}

window.onload = function () {
  // Controlla se siamo nella pagina index.html
  if (document.getElementById("characterSelect")) {
    populateCharacterList();
    loadCharacterData();
    showSection("character-gallery"); // Mostra la galleria di default
  }
  // Se siamo in dettaglio.html, loadCharacterData verrà chiamato da dettaglio.html
};

// Carica i dati dei personaggi
async function loadCharacterData() {
  try {
    const response = await fetch("character.json");
    const data = await response.json();
    allCharacters = data.characters;

    // Carica immagini personalizzate da localStorage
    allCharacters.forEach((char) => {
      const imageKey = `character_image_${char.name
        .toLowerCase()
        .replace(/\s+/g, "_")}`;
      const customImage = localStorage.getItem(imageKey);
      if (customImage) {
        char.customImage = customImage;
      }
    });

    // Salva la lista aggiornata
    localStorage.setItem("genshinCharacters", JSON.stringify(allCharacters));

    // Controlla se siamo nella pagina index.html prima di chiamare queste funzioni
    if (document.getElementById("characterGrid")) {
      displayCharacters(allCharacters);
    }
    if (document.getElementById("characterSelect")) {
      populateCharacterDropdown();
    }
  } catch (error) {
    console.error("Errore nel caricamento dei personaggi:", error);
    // Fallback: carica da localStorage se disponibile
    const saved = localStorage.getItem("genshinCharacters");
    if (saved) {
      allCharacters = JSON.parse(saved);
      if (document.getElementById("characterGrid")) {
        displayCharacters(allCharacters);
      }
      if (document.getElementById("characterSelect")) {
        populateCharacterDropdown();
      }
    }
  }
}

// Funzione per gestire il caricamento di immagini personalizzate
function uploadCharacterImage(characterName) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageData = e.target.result;

        // Salva l'immagine in localStorage come base64
        const imageKey = `character_image_${characterName
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        localStorage.setItem(imageKey, imageData);

        // Aggiorna il personaggio nel JSON
        const character = allCharacters.find((c) => c.name === characterName);
        if (character) {
          character.customImage = imageData;
          // Salva la lista aggiornata
          localStorage.setItem(
            "genshinCharacters",
            JSON.stringify(allCharacters)
          );
        }

        // Ricarica la galleria
        displayCharacters(allCharacters);
        showNotification(
          `Immagine per ${characterName} caricata con successo! 🖼️`
        );
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Funzione per rimuovere immagine personalizzata
function removeCharacterImage(characterName) {
  const imageKey = `character_image_${characterName
    .toLowerCase()
    .replace(/\s+/g, "_")}`;
  localStorage.removeItem(imageKey);

  // Rimuovi l'immagine personalizzata dal personaggio
  const character = allCharacters.find((c) => c.name === characterName);
  if (character) {
    delete character.customImage;
    localStorage.setItem("genshinCharacters", JSON.stringify(allCharacters));
  }

  // Ricarica la galleria
  displayCharacters(allCharacters);
  showNotification(`Immagine per ${characterName} rimossa! 🗑️`);
}

// Funzione migliorata per visualizzare i personaggi con gestione immagini
function displayCharacters(characters) {
  const container = document.getElementById("characterGrid");
  if (!container) return;

  container.innerHTML = "";

  characters.forEach((char) => {
    const charCard = document.createElement("div");
    charCard.className = "character-card";
    charCard.onclick = () => selectCharacterFromGallery(char.name);

    // Gestione immagine con fallback migliorato
    let imageElement = "";
    let fallbackDisplay = "inline";

    if (char.customImage) {
      // Usa immagine personalizzata
      imageElement = `<img src="${char.customImage}" alt="${char.name}" class="character-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">`;
      fallbackDisplay = "none";
    } else if (char.image) {
      // Usa immagine predefinita
      imageElement = `<img src="${char.image}" alt="${char.name}" class="character-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">`;
      fallbackDisplay = "none";
    }

    const fallbackEmoji = getElementEmoji(char.element);

    charCard.innerHTML = `
      <div class="character-image-container">
        ${imageElement}
        <span class="character-emoji-fallback" style="display: ${fallbackDisplay}; font-size: 2em;">${fallbackEmoji}</span>
        <div class="image-actions">
          <button class="btn-upload" onclick="event.stopPropagation(); uploadCharacterImage('${
            char.name
          }')" title="Carica immagine">
            📷
          </button>
          ${
            char.customImage
              ? `<button class="btn-remove-image" onclick="event.stopPropagation(); removeCharacterImage('${char.name}')" title="Rimuovi immagine">🗑️</button>`
              : ""
          }
        </div>
      </div>
      <div class="character-info">
        <h3>${char.name}</h3>
        <div class="character-details">
          <span class="element-badge ${char.element.toLowerCase()}">
            ${getElementEmoji(char.element)} ${char.element}
          </span>
          <span class="weapon-badge">
            ${getWeaponEmoji(char.weapon)} ${char.weapon}
          </span>
          <span class="region-badge">
            ${getRegionEmoji(char.region)} ${char.region}
          </span>
          <span class="rarity-badge rarity-${char.rarity}">
            ${"⭐".repeat(char.rarity)}
          </span>
        </div>
      </div>
      <div class="character-actions">
        <button class="btn-select" onclick="event.stopPropagation(); selectCharacterFromGallery('${
          char.name
        }')">
          Seleziona
        </button>
        <button class="btn-details" onclick="event.stopPropagation(); openCharacterDetail('${
          char.name
        }')">
          Dettagli
        </button>
      </div>
    `;

    container.appendChild(charCard);
  });
}

// Funzione per filtrare i personaggi
function filterCharacters() {
  const elementFilter = document.getElementById("elementFilter").value;
  const weaponFilter = document.getElementById("weaponFilter").value;
  const regionFilter = document.getElementById("regionFilter").value;
  const rarityFilter = document.getElementById("rarityFilter").value;
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortBy = document.getElementById("sortCharacters").value;

  let filtered = allCharacters.filter((char) => {
    const elementMatch = !elementFilter || char.element === elementFilter;
    const weaponMatch = !weaponFilter || char.weapon === weaponFilter;
    const regionMatch = !regionFilter || char.region === regionFilter;
    const rarityMatch = !rarityFilter || char.rarity === parseInt(rarityFilter);
    const searchMatch =
      !searchQuery ||
      char.name.toLowerCase().includes(searchQuery) ||
      char.element.toLowerCase().includes(searchQuery) ||
      char.weapon.toLowerCase().includes(searchQuery) ||
      char.region.toLowerCase().includes(searchQuery);

    return (
      elementMatch && weaponMatch && regionMatch && rarityMatch && searchMatch
    );
  });

  // Applica ordinamento
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "rarity-asc":
        return a.rarity - b.rarity;
      case "rarity-desc":
        return b.rarity - a.rarity;
      case "element":
        return a.element.localeCompare(b.element);
      case "weapon":
        return a.weapon.localeCompare(b.weapon);
      case "region":
        return a.region.localeCompare(b.region);
      default:
        return 0;
    }
  });

  displayCharacters(filtered);

  // Mostra suggerimento di ricerca se c'è una query esatta
  if (searchQuery) {
    showSearchSuggestion(searchQuery, filtered);
  } else {
    hideSearchSuggestion();
  }
}

// Funzione per mostrare suggerimento di ricerca
function showSearchSuggestion(query, filtered) {
  const exactMatch = filtered.find(
    (char) => char.name.toLowerCase() === query.toLowerCase()
  );

  if (exactMatch) {
    const suggestion = document.getElementById("searchSuggestion");
    if (suggestion) {
      suggestion.innerHTML = `
        <div class="suggestion-content">
          <span>🎯 Risultato esatto: <strong>${exactMatch.name}</strong></span>
          <div class="suggestion-actions">
            <button onclick="selectCharacterFromGallery('${exactMatch.name}')" class="quick-select-btn">
              Seleziona
            </button>
            <button onclick="openCharacterDetail('${exactMatch.name}')" class="quick-details-btn">
              Dettagli
            </button>
          </div>
        </div>
      `;
      suggestion.style.display = "block";
    }
  } else {
    hideSearchSuggestion();
  }
}

// Funzione per nascondere suggerimento di ricerca
function hideSearchSuggestion() {
  const suggestion = document.getElementById("searchSuggestion");
  if (suggestion) {
    suggestion.style.display = "none";
  }
}

// Funzione per resettare i filtri
function resetFilters() {
  // Controlla se ci sono filtri attivi
  const elementFilter = document.getElementById("elementFilter").value;
  const weaponFilter = document.getElementById("weaponFilter").value;
  const regionFilter = document.getElementById("regionFilter").value;
  const rarityFilter = document.getElementById("rarityFilter").value;
  const searchInput = document.getElementById("searchInput").value;
  const sortCharacters = document.getElementById("sortCharacters").value;

  // Se non ci sono filtri attivi, evidenzia i select
  if (
    !elementFilter &&
    !weaponFilter &&
    !regionFilter &&
    !rarityFilter &&
    !searchInput &&
    sortCharacters === "name-asc"
  ) {
    highlightFilterSelects();
    return;
  }

  // Resetta i filtri
  document.getElementById("elementFilter").value = "";
  document.getElementById("weaponFilter").value = "";
  document.getElementById("regionFilter").value = "";
  document.getElementById("rarityFilter").value = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("sortCharacters").value = "name-asc";

  displayCharacters(allCharacters);
  hideSearchSuggestion();
  showNotification("Filtri resettati! 🔄");
}

// Funzione per mostrare il popup "nessun filtro selezionato"
function showNoFiltersPopup() {
  // Rimuovi popup esistenti
  const existingPopup = document.querySelector(".no-filters-popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Trova l'h2 "Galleria Personaggi" e il container dei filtri
  const galleryTitle = document.querySelector("h2");
  const filtersContainer = document.querySelector(".gallery-filters");
  if (!galleryTitle || !filtersContainer) return;

  const titleRect = galleryTitle.getBoundingClientRect();
  const filtersRect = filtersContainer.getBoundingClientRect();

  // Crea il popup
  const popup = document.createElement("div");
  popup.className = "no-filters-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-message">
        <span class="popup-text">Nessun filtro selezionato</span>
        <div class="arrow-container">
          <div class="arrow">↓</div>
        </div>
      </div>
    </div>
  `;

  // Posiziona il popup tra l'h2 e i filtri
  const popupTop = titleRect.bottom + 20; // 20px sotto l'h2
  const popupBottom = filtersRect.top - 20; // 20px sopra i filtri

  // Se c'è spazio sufficiente, posiziona il popup in mezzo
  if (popupBottom > popupTop + 100) {
    // Almeno 100px di spazio
    popup.style.cssText = `
      position: fixed;
      top: ${popupTop}px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: var(--fantasy-box);
      border: 3px solid var(--fantasy-border);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: popupFadeIn 0.5s ease-out;
    `;
  } else {
    // Se non c'è spazio, posiziona sopra i filtri
    popup.style.cssText = `
      position: fixed;
      top: ${filtersRect.top - 120}px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: var(--fantasy-box);
      border: 3px solid var(--fantasy-border);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: popupFadeIn 0.5s ease-out;
    `;
  }

  const popupContent = popup.querySelector(".popup-content");
  popupContent.style.cssText = `
    text-align: center;
  `;

  const popupMessage = popup.querySelector(".popup-message");
  popupMessage.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  `;

  const popupText = popup.querySelector(".popup-text");
  popupText.style.cssText = `
    color: var(--fantasy-text);
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.1rem;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  `;

  const arrowContainer = popup.querySelector(".arrow-container");
  arrowContainer.style.cssText = `
    position: relative;
    height: 40px;
  `;

  const arrow = popup.querySelector(".arrow");
  arrow.style.cssText = `
    font-size: 1.5rem;
    color: var(--fantasy-blue);
    animation: arrowBounce 2s infinite;
  `;

  // Aggiungi il popup al body
  document.body.appendChild(popup);

  // Aggiungi gli stili CSS per le animazioni
  const style = document.createElement("style");
  style.textContent = `
    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: translateX(-50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
    }
    
    @keyframes arrowBounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-8px);
      }
      60% {
        transform: translateY(-4px);
      }
    }
  `;
  document.head.appendChild(style);

  // Rimuovi il popup dopo 3 secondi
  setTimeout(() => {
    if (popup.parentNode) {
      popup.style.animation = "popupFadeOut 0.5s ease-in forwards";
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove();
        }
      }, 500);
    }
  }, 3000);

  // Aggiungi animazione di uscita
  const fadeOutStyle = document.createElement("style");
  fadeOutStyle.textContent = `
    @keyframes popupFadeOut {
      from {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) scale(0.8);
      }
    }
  `;
  document.head.appendChild(fadeOutStyle);

  // Evidenzia i select dei filtri
  highlightFilterSelects();
}

// Funzione per evidenziare i select dei filtri
function highlightFilterSelects() {
  const filterSelects = [
    "elementFilter",
    "weaponFilter",
    "regionFilter",
    "rarityFilter",
  ];

  filterSelects.forEach((selectId, index) => {
    const select = document.getElementById(selectId);
    if (select) {
      // Aggiungi classe di evidenziazione
      select.classList.add("highlight-filter");

      // Aggiungi stili CSS per l'evidenziazione
      const highlightStyle = document.createElement("style");
      highlightStyle.textContent = `
        .highlight-filter {
          border-color: var(--fantasy-blue) !important;
          box-shadow: 0 0 15px var(--fantasy-blue) !important;
          animation: filterPulse 1.5s infinite !important;
        }
        
        @keyframes filterPulse {
          0%, 100% {
            box-shadow: 0 0 15px var(--fantasy-blue);
          }
          50% {
            box-shadow: 0 0 25px var(--fantasy-blue), 0 0 35px var(--fantasy-blue);
          }
        }
      `;
      document.head.appendChild(highlightStyle);

      // Rimuovi l'evidenziazione dopo un delay
      setTimeout(() => {
        select.classList.remove("highlight-filter");
      }, 3000 + index * 500); // Ogni select si illumina per 500ms in sequenza
    }
  });
}

// Seleziona personaggio dalla galleria
function selectCharacterFromGallery(name) {
  selectCharacter(name);
}

// Apri pagina dettagliata personaggio
function openCharacterDetail(name) {
  if (name) {
    window.location.href = `dettaglio.html?character=${encodeURIComponent(
      name
    )}`;
  } else {
    showNotification("Nessun personaggio selezionato! ⚠️");
  }
}

// Carica i dati dettagliati del personaggio
function loadCharacterDetailData(name) {
  const storageKey = `character_detail_${name}`;
  const savedData = localStorage.getItem(storageKey);
  const charData = savedData ? JSON.parse(savedData) : {};

  // Statistiche base
  document.getElementById("detailLevel").value = charData.detailLevel || "";
  document.getElementById("detailConstellation").value =
    charData.detailConstellation || "";
  document.getElementById("detailBaseAtk").value = charData.detailBaseAtk || "";
  document.getElementById("detailBaseHP").value = charData.detailBaseHP || "";
  document.getElementById("detailBaseDef").value = charData.detailBaseDef || "";
  document.getElementById("detailCritRate").value =
    charData.detailCritRate || "";
  document.getElementById("detailCritDMG").value = charData.detailCritDMG || "";
  document.getElementById("detailElementalDMG").value =
    charData.detailElementalDMG || "";

  // Armi
  document.getElementById("detailCurrentWeapon").value =
    charData.detailCurrentWeapon || "";
  document.getElementById("detailWeaponLevel").value =
    charData.detailWeaponLevel || "";
  document.getElementById("detailWeaponRefinement").value =
    charData.detailWeaponRefinement || "";

  // Talenti
  document.getElementById("detailNormalAttack").value =
    charData.detailNormalAttack || "";
  document.getElementById("detailElementalSkill").value =
    charData.detailElementalSkill || "";
  document.getElementById("detailElementalBurst").value =
    charData.detailElementalBurst || "";

  // Artefatti
  document.getElementById("detailMainSet").value = charData.detailMainSet || "";
  document.getElementById("detailMainSetNotes").value =
    charData.detailMainSetNotes || "";
  document.getElementById("detailSubSet").value = charData.detailSubSet || "";
  document.getElementById("detailSubSetNotes").value =
    charData.detailSubSetNotes || "";
  document.getElementById("detailSandsMain").value =
    charData.detailSandsMain || "";
  document.getElementById("detailGobletMain").value =
    charData.detailGobletMain || "";
  document.getElementById("detailCircletMain").value =
    charData.detailCircletMain || "";
  document.getElementById("detailSubStatsPriority").value =
    charData.detailSubStatsPriority || "";

  // Team comps
  document.getElementById("detailTeam1Name").value =
    charData.detailTeam1Name || "";
  document.getElementById("detailTeam1Notes").value =
    charData.detailTeam1Notes || "";
  document.getElementById("detailTeam2Name").value =
    charData.detailTeam2Name || "";
  document.getElementById("detailTeam2Notes").value =
    charData.detailTeam2Notes || "";

  // Note personali
  document.getElementById("detailPersonalNotes").value =
    charData.detailPersonalNotes || "";

  // Aggiorna le statistiche dell'arma
  updateWeaponStats();

  // Aggiorna i membri del team se esistono
  const teamMembers = [
    "detailTeam1Member1",
    "detailTeam1Member2",
    "detailTeam1Member3",
    "detailTeam1Member4",
    "detailTeam2Member1",
    "detailTeam2Member2",
    "detailTeam2Member3",
    "detailTeam2Member4",
  ];

  teamMembers.forEach((memberId) => {
    const memberName = charData[memberId];
    if (memberName && memberName !== "") {
      const character = allCharacters.find((c) => c.name === memberName);
      if (character) {
        // Trova l'emoji del personaggio
        const emoji = getElementEmoji(character.element);

        // Usa la funzione selectTeamMember locale se disponibile, altrimenti quella globale
        if (typeof selectTeamMember === "function") {
          selectTeamMember(memberId, character.name, character.name, emoji);
        } else {
          // Fallback: aggiorna manualmente il display
          const memberInput = document.querySelector(
            `#${memberId}_dropdown`
          )?.previousElementSibling;
          if (memberInput) {
            const avatar = memberInput.querySelector(".team-member-avatar");
            const nameSpan = memberInput.querySelector(".team-member-name");
            const hiddenInput = document.getElementById(memberId + "_hidden");

            if (nameSpan) nameSpan.textContent = character.name;
            if (hiddenInput) hiddenInput.value = character.name;

            if (avatar) {
              // Prima prova a caricare l'immagine personalizzata dal localStorage
              const customImage = localStorage.getItem(
                `character_image_${character.name}`
              );
              if (customImage) {
                avatar.style.backgroundImage = `url(${customImage})`;
                avatar.style.backgroundSize = "cover";
                avatar.style.backgroundPosition = "center";
                avatar.innerHTML = "";
              }
              // Altrimenti usa l'immagine dal JSON
              else if (character.image) {
                avatar.style.backgroundImage = `url(${character.image})`;
                avatar.style.backgroundSize = "cover";
                avatar.style.backgroundPosition = "center";
                avatar.innerHTML = "";
              }
              // Fallback all'emoji dell'elemento
              else {
                avatar.style.backgroundImage = "none";
                avatar.innerHTML = emoji || "👤";
              }
            }
          }
        }
      }
    }
  });
}

// Salva i dati dettagliati del personaggio
function saveCharacterDetail() {
  const characterName = document.getElementById(
    "detailCharacterName"
  ).textContent;
  const data = {};

  // Raccogli tutti i dati dai campi
  const fields = [
    "detailLevel",
    "detailConstellation",
    "detailBaseAtk",
    "detailBaseHP",
    "detailBaseDef",
    "detailCritRate",
    "detailCritDMG",
    "detailElementalDMG",
    "detailCurrentWeapon",
    "detailWeaponLevel",
    "detailWeaponRefinement",
    "detailNormalAttack",
    "detailElementalSkill",
    "detailElementalBurst",
    "detailMainSet",
    "detailMainSetNotes",
    "detailSubSet",
    "detailSubSetNotes",
    "detailSandsMain",
    "detailGobletMain",
    "detailCircletMain",
    "detailSubStatsPriority",
    "detailTeam1Name",
    "detailTeam1Notes",
    "detailTeam2Name",
    "detailTeam2Notes",
    "detailPersonalNotes",
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element) {
      data[field] = element.value;
    }
  });

  // Salva i membri del team
  const teamMembers = [
    "detailTeam1Member1",
    "detailTeam1Member2",
    "detailTeam1Member3",
    "detailTeam1Member4",
    "detailTeam2Member1",
    "detailTeam2Member2",
    "detailTeam2Member3",
    "detailTeam2Member4",
  ];

  teamMembers.forEach((memberId) => {
    const hiddenInput = document.getElementById(memberId + "_hidden");
    if (hiddenInput) {
      data[memberId] = hiddenInput.value;
    }
  });

  // Salva nel localStorage
  localStorage.setItem(
    `character_detail_${characterName}`,
    JSON.stringify(data)
  );

  // Mostra conferma
  showNotification("Dati salvati con successo! 💾", "success");
}

// Reset dei dati del personaggio dettagliato
function resetCharacterDetail() {
  const characterName = document.getElementById(
    "detailCharacterName"
  ).textContent;

  if (
    confirm(`Sei sicuro di voler resettare tutti i dati di ${characterName}?`)
  ) {
    localStorage.removeItem(`character_detail_${characterName}`);

    // Reset di tutti i campi
    const fields = document.querySelectorAll(
      "#characterDetailPage input, #characterDetailPage textarea, #characterDetailPage select"
    );
    fields.forEach((field) => {
      if (field.type === "number") {
        field.value = "";
      } else {
        field.value = "";
      }
    });

    // Reset dei membri del team
    const teamMembers = document.querySelectorAll(".team-member-name");
    teamMembers.forEach((member) => {
      member.textContent = "Seleziona personaggio";
      const avatar = member.previousElementSibling;
      avatar.style.backgroundImage = "none";
      avatar.innerHTML = "👤";
    });

    showNotification("Dati resettati! 🔄", "info");
  }
}

// Esporta i dati del personaggio dettagliato
function exportCharacterData() {
  const name = document.getElementById("detailCharacterName").textContent;
  const storageKey = `genshinSchedario_${name
    .toLowerCase()
    .replace(/\s+/g, "_")}`;
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    const dataStr = JSON.stringify(JSON.parse(savedData), null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_dati.json`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification(`Dati di ${name} esportati! 📤`);
  } else {
    showNotification("Nessun dato trovato per questo personaggio! ⚠️");
  }
}

// Funzioni helper per emoji
function getElementEmoji(element) {
  const elementEmojis = {
    Pyro: "🔥",
    Hydro: "💧",
    Electro: "⚡",
    Cryo: "❄️",
    Anemo: "💨",
    Geo: "🪨",
    Dendro: "🌱",
  };
  return elementEmojis[element] || "💨";
}

function getWeaponEmoji(weapon) {
  const weaponEmojis = {
    Sword: "⚔️",
    Claymore: "🗡️",
    Polearm: "🔱",
    Bow: "🏹",
    Catalyst: "📖",
  };
  return weaponEmojis[weapon] || "⚔️";
}

function getRegionEmoji(region) {
  const regionEmojis = {
    Mondstadt: "🏰",
    Liyue: "🏮",
    Inazuma: "⛩️",
    Sumeru: "🏛️",
    Fontaine: "🌊",
    Natlan: "🌋",
    Snezhnaya: "❄️",
    "Khaenri'ah": "⚫",
    Other: "🌍",
  };
  return regionEmojis[region] || "🏰";
}

// Popola il dropdown con i personaggi salvati
function populateCharacterDropdown() {
  const select = document.getElementById("characterSelect");
  if (!select) return; // Se non siamo nella pagina index.html, esci

  select.innerHTML = '<option value="">Seleziona un personaggio</option>';

  allCharacters.forEach((char) => {
    const option = document.createElement("option");
    option.value = char.name;

    // Gestione immagine nel dropdown
    const imageElement = char.image
      ? `<img src="${char.image}" alt="${char.name}" class="dropdown-character-image" onerror="this.style.display='none';">`
      : "";
    const fallbackEmoji = getElementEmoji(char.element);

    option.innerHTML = `
      ${imageElement}
      <span class="dropdown-character-text">
        ${char.name} ${fallbackEmoji}
      </span>
    `;

    select.appendChild(option);
  });
}

// Funzione per mostrare notifiche
function showNotification(message, type = "info") {
  // Crea una notifica temporanea
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--genshin-gold) 0%, #ffa500 100%);
    color: #1a1a2e;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Funzione per evidenziare un elemento
function highlightElement(element) {
  const originalBackground = element.style.background;
  const originalBoxShadow = element.style.boxShadow;

  element.style.background = "var(--gradient-secondary)";
  element.style.boxShadow = "0 0 20px rgba(240, 147, 251, 0.5)";
  element.style.transform = "scale(1.05)";
  element.style.transition = "all 0.3s ease";

  setTimeout(() => {
    element.style.background = originalBackground;
    element.style.boxShadow = originalBoxShadow;
    element.style.transform = "scale(1)";
  }, 1500);
}

// Popola le opzioni delle armi
function populateWeaponOptions(weaponType) {
  const select = document.getElementById("detailCurrentWeapon");
  select.innerHTML = '<option value="">Seleziona arma...</option>';

  // Lista delle armi per tipo (semplificata)
  const weapons = {
    Sword: [
      "Spada del Favonius",
      "Spada Sacra dei Re",
      "Spada di Ferro",
      "Spada di Jade",
      "Spada di Aquila",
    ],
    Claymore: [
      "Spadone del Favonius",
      "Spadone Sacro dei Re",
      "Spadone di Ferro",
      "Spadone di Jade",
      "Spadone di Aquila",
    ],
    Polearm: [
      "Lancia del Favonius",
      "Lancia Sacra dei Re",
      "Lancia di Ferro",
      "Lancia di Jade",
      "Lancia di Aquila",
    ],
    Bow: [
      "Arco del Favonius",
      "Arco Sacro dei Re",
      "Arco di Ferro",
      "Arco di Jade",
      "Arco di Aquila",
    ],
    Catalyst: [
      "Catalizzatore del Favonius",
      "Catalizzatore Sacro dei Re",
      "Catalizzatore di Ferro",
      "Catalizzatore di Jade",
      "Catalizzatore di Aquila",
    ],
  };

  const weaponList = weapons[weaponType] || [];
  weaponList.forEach((weapon) => {
    const option = document.createElement("option");
    option.value = weapon;
    option.textContent = weapon;
    select.appendChild(option);
  });
}

// Aggiorna le statistiche dell'arma
function updateWeaponStats() {
  const weapon = document.getElementById("detailCurrentWeapon").value;
  const level =
    parseInt(document.getElementById("detailWeaponLevel").value) || 0;
  const refinement =
    parseInt(document.getElementById("detailWeaponRefinement").value) || 1;

  // Calcoli semplificati per le statistiche dell'arma
  let baseAtk = 0;
  let bonus = 0;

  if (weapon && level > 0) {
    baseAtk = 300 + level * 10; // Calcolo semplificato
    bonus = refinement * 5; // Bonus basato sul raffinamento
  }

  document.getElementById("weaponAtk").textContent = baseAtk;
  document.getElementById("weaponBonus").textContent = bonus + "%";
}

// Funzione per rimuovere artefatti
function removeArtifact(button) {
  const artifactDiv = button.parentElement;
  artifactDiv.remove();

  // Rinumera gli artefatti
  const artifacts = document.querySelectorAll(".artifact");
  artifacts.forEach((artifact, index) => {
    const title = artifact.querySelector("h3");
    title.textContent = `Artefatto ${index + 1}`;
  });

  artifactCount = artifacts.length;

  if (isTableView) {
    updateArtifactTable();
  }

  // Salva automaticamente
  if (currentCharacter) {
    autoSave();
  }
}

// Funzione per aggiornare la tabella degli artefatti
function updateArtifactTable() {
  const tableBody = document.getElementById("artifactTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  const artifacts = document.querySelectorAll(".artifact");

  artifacts.forEach((artifact, index) => {
    const inputs = artifact.querySelectorAll("input");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${inputs[0].value || "-"}</td>
      <td>${inputs[1].value || "-"}</td>
      <td>${inputs[2].value || "-"}</td>
      <td>${inputs[3].value || "-"}</td>
      <td>${inputs[4].value || "-"}</td>
      <td>${inputs[5].value || "-"}</td>
      <td>${inputs[6].value || "-"}</td>
      <td>${inputs[7].value || "-"}</td>
      <td>
        <button onclick="removeArtifactFromTable(${index})" class="remove-btn">❌</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Funzione per rimuovere artefatti dalla tabella
function removeArtifactFromTable(index) {
  const artifacts = document.querySelectorAll(".artifact");
  if (artifacts[index]) {
    artifacts[index].remove();
    updateArtifactTable();

    if (currentCharacter) {
      autoSave();
    }
  }
}

// Funzione per cambiare vista artefatti
function toggleArtifactView() {
  isTableView = !isTableView;
  const toggleBtn = document.getElementById("toggleViewBtn");
  const artifactList = document.getElementById("artifactList");
  const artifactTable = document.getElementById("artifactTable");

  if (isTableView) {
    toggleBtn.textContent = "📝 Vista Form";
    artifactList.style.display = "none";
    artifactTable.style.display = "block";
    updateArtifactTable();
  } else {
    toggleBtn.textContent = "📊 Vista Tabella";
    artifactList.style.display = "block";
    artifactTable.style.display = "none";
  }
}

// Funzione per filtrare artefatti
function filterArtifacts() {
  const slotFilter = document.getElementById("slotFilter").value.toLowerCase();
  const setFilter = document.getElementById("setFilter").value.toLowerCase();
  const artifacts = document.querySelectorAll(".artifact");

  artifacts.forEach((artifact) => {
    const inputs = artifact.querySelectorAll("input");
    const slot = inputs[0].value.toLowerCase();
    const set = inputs[1].value.toLowerCase();

    const slotMatch = !slotFilter || slot.includes(slotFilter);
    const setMatch = !setFilter || set.includes(setFilter);

    artifact.style.display = slotMatch && setMatch ? "block" : "none";
  });

  if (isTableView) {
    updateArtifactTable();
  }
}

// Funzione per ordinare artefatti
function sortArtifacts() {
  const sortBy = document.getElementById("sortArtifacts").value;
  const artifactList = document.getElementById("artifactList");
  const artifacts = Array.from(artifactList.children);

  artifacts.sort((a, b) => {
    const inputsA = a.querySelectorAll("input");
    const inputsB = b.querySelectorAll("input");

    let valueA, valueB;

    switch (sortBy) {
      case "slot":
        valueA = inputsA[0].value.toLowerCase();
        valueB = inputsB[0].value.toLowerCase();
        break;
      case "set":
        valueA = inputsA[1].value.toLowerCase();
        valueB = inputsB[1].value.toLowerCase();
        break;
      case "level":
        valueA = parseInt(inputsA[7].value) || 0;
        valueB = parseInt(inputsB[7].value) || 0;
        return valueB - valueA; // Ordine decrescente per livello
      default:
        return 0;
    }

    return valueA.localeCompare(valueB);
  });

  // Rimuovi e riaggiungi gli elementi nell'ordine corretto
  artifacts.forEach((artifact) => {
    artifactList.appendChild(artifact);
  });

  if (isTableView) {
    updateArtifactTable();
  }
}

// Funzione per mostrare le sezioni
function showSection(sectionId) {
  // Controlla se siamo nella pagina index.html
  const gallerySection = document.getElementById("character-gallery");
  const selectionSection = document.getElementById("character-selection");

  if (!gallerySection || !selectionSection) return; // Se non siamo nella pagina index.html, esci

  // Nascondi tutte le sezioni
  gallerySection.style.display = "none";
  selectionSection.style.display = "none";

  // Mostra la sezione selezionata
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = "block";
  }

  // Aggiorna i tab attivi
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Trova e attiva il tab corrispondente
  const activeTab = Array.from(document.querySelectorAll(".nav-tab")).find(
    (tab) => {
      return tab.getAttribute("onclick")?.includes(sectionId);
    }
  );

  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Scroll in cima alla pagina
  window.scrollTo(0, 0);
}

// Funzione per convertire immagine in base64 (per test)
function convertImageToBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

// Funzione per testare il caricamento delle immagini
function testImageLoading() {
  console.log("Testing image loading...");

  // Test con URL esterni
  const testImages = [
    "https://via.placeholder.com/200x200/ffd700/1a1a2e?text=Test1",
    "https://via.placeholder.com/200x200/9dddff/1a1a2e?text=Test2",
    "images/characters/placeholder.svg",
  ];

  testImages.forEach((src, index) => {
    const img = new Image();
    img.onload = () => console.log(`✅ Image ${index + 1} loaded:`, src);
    img.onerror = () => console.log(`❌ Image ${index + 1} failed:`, src);
    img.src = src;
  });
}

// ===== FUNZIONI PER SELEZIONE MEMBRI TEAM =====
function initializeTeamMemberSelectors() {
  const teamMemberInputs = [
    "detailTeam1Member1",
    "detailTeam1Member2",
    "detailTeam1Member3",
    "detailTeam1Member4",
    "detailTeam2Member1",
    "detailTeam2Member2",
    "detailTeam2Member3",
    "detailTeam2Member4",
  ];

  teamMemberInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      // Sostituisci l'input con un div personalizzato
      const wrapper = document.createElement("div");
      wrapper.className = "team-member-select";

      const label = document.createElement("label");
      label.textContent = input.placeholder || "Seleziona personaggio";

      const memberInput = document.createElement("div");
      memberInput.className = "team-member-input";
      memberInput.onclick = () => toggleCharacterDropdown(inputId);

      const avatar = document.createElement("div");
      avatar.className = "team-member-avatar";
      avatar.innerHTML = "👤";

      const nameSpan = document.createElement("span");
      nameSpan.className = "team-member-name";
      nameSpan.textContent = input.value || "Seleziona personaggio";

      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.id = inputId + "_hidden";
      hiddenInput.value = input.value;

      memberInput.appendChild(avatar);
      memberInput.appendChild(nameSpan);
      memberInput.appendChild(hiddenInput);

      const dropdown = document.createElement("div");
      dropdown.className = "character-dropdown";
      dropdown.id = inputId + "_dropdown";

      wrapper.appendChild(label);
      wrapper.appendChild(memberInput);
      wrapper.appendChild(dropdown);

      input.parentNode.replaceChild(wrapper, input);
    }
  });
}

function toggleCharacterDropdown(inputId) {
  const dropdown = document.getElementById(inputId + "_dropdown");
  const allDropdowns = document.querySelectorAll(".character-dropdown");

  // Chiudi tutti gli altri dropdown
  allDropdowns.forEach((d) => {
    if (d !== dropdown) {
      d.classList.remove("show");
    }
  });

  // Toggle del dropdown corrente
  if (dropdown.classList.contains("show")) {
    dropdown.classList.remove("show");
  } else {
    dropdown.classList.add("show");
    populateCharacterDropdown(inputId);
  }
}

function populateCharacterDropdown(inputId) {
  const dropdown = document.getElementById(inputId + "_dropdown");
  if (!dropdown) return; // Se l'elemento non esiste, esci

  dropdown.innerHTML = "";

  // Aggiungi opzione "Nessuno"
  const noneOption = document.createElement("div");
  noneOption.className = "character-option";
  noneOption.onclick = () => selectTeamMember(inputId, "", "Nessuno", "👤");

  const noneAvatar = document.createElement("div");
  noneAvatar.className = "character-option-avatar";
  noneAvatar.innerHTML = "👤";

  const noneInfo = document.createElement("div");
  noneInfo.className = "character-option-info";

  const noneName = document.createElement("div");
  noneName.className = "character-option-name";
  noneName.textContent = "Nessuno";

  const noneDetails = document.createElement("div");
  noneDetails.className = "character-option-details";
  noneDetails.textContent = "Rimuovi personaggio";

  noneInfo.appendChild(noneName);
  noneInfo.appendChild(noneDetails);
  noneOption.appendChild(noneAvatar);
  noneOption.appendChild(noneInfo);
  dropdown.appendChild(noneOption);

  // Aggiungi tutti i personaggi
  allCharacters.forEach((character) => {
    const option = document.createElement("div");
    option.className = "character-option";
    option.onclick = () =>
      selectTeamMember(
        inputId,
        character.name,
        character.name,
        getElementEmoji(character.element)
      );

    const avatar = document.createElement("div");
    avatar.className = "character-option-avatar";

    // Prima prova a caricare l'immagine personalizzata dal localStorage
    const customImage = localStorage.getItem(
      `character_image_${character.name}`
    );
    if (customImage) {
      avatar.style.backgroundImage = `url(${customImage})`;
      avatar.style.backgroundSize = "cover";
      avatar.style.backgroundPosition = "center";
      avatar.innerHTML = "";
    }
    // Altrimenti usa l'immagine dal JSON
    else if (character.image) {
      avatar.style.backgroundImage = `url(${character.image})`;
      avatar.style.backgroundSize = "cover";
      avatar.style.backgroundPosition = "center";
      avatar.innerHTML = "";
    }
    // Fallback all'emoji dell'elemento
    else {
      avatar.style.backgroundImage = "none";
      avatar.innerHTML = getElementEmoji(character.element) || "👤";
    }

    const info = document.createElement("div");
    info.className = "character-option-info";

    const name = document.createElement("div");
    name.className = "character-option-name";
    name.textContent = character.name;

    const details = document.createElement("div");
    details.className = "character-option-details";
    details.textContent = `${character.element} • ${character.weapon} • ${character.rarity}★`;

    info.appendChild(name);
    info.appendChild(details);
    option.appendChild(avatar);
    option.appendChild(info);
    dropdown.appendChild(option);
  });
}

function selectTeamMember(inputId, characterName, displayName, emoji) {
  const dropdown = document.getElementById(inputId + "_dropdown");
  if (!dropdown) return; // Se l'elemento non esiste, esci

  const memberInput = dropdown.previousElementSibling;
  if (!memberInput) return; // Se l'elemento non esiste, esci

  const avatar = memberInput.querySelector(".team-member-avatar");
  const nameSpan = memberInput.querySelector(".team-member-name");
  const hiddenInput = document.getElementById(inputId + "_hidden");

  if (!avatar || !nameSpan || !hiddenInput) return; // Se gli elementi non esistono, esci

  // Aggiorna il display
  nameSpan.textContent = displayName;
  hiddenInput.value = characterName;

  // Aggiorna l'avatar
  if (characterName && characterName !== "Nessuno") {
    // Trova il personaggio nell'array allCharacters
    const character = allCharacters.find((c) => c.name === characterName);

    if (character) {
      // Prima prova a caricare l'immagine personalizzata dal localStorage
      const customImage = localStorage.getItem(
        `character_image_${characterName}`
      );
      if (customImage) {
        avatar.style.backgroundImage = `url(${customImage})`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.innerHTML = "";
      }
      // Altrimenti usa l'immagine dal JSON
      else if (character.image) {
        avatar.style.backgroundImage = `url(${character.image})`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.innerHTML = "";
      }
      // Fallback all'emoji dell'elemento
      else {
        avatar.style.backgroundImage = "none";
        avatar.innerHTML = emoji || "👤";
      }
    } else {
      // Se non trova il personaggio, usa l'emoji fornita
      avatar.style.backgroundImage = "none";
      avatar.innerHTML = emoji || "👤";
    }
  } else {
    avatar.style.backgroundImage = "none";
    avatar.innerHTML = "👤";
  }

  // Chiudi il dropdown
  dropdown.classList.remove("show");

  // Salva automaticamente i dati
  if (typeof saveCharacterDetail === "function") {
    saveCharacterDetail();
  }
}

// Chiudi dropdown quando si clicca fuori
document.addEventListener("click", function (event) {
  if (!event.target.closest(".team-member-select")) {
    document.querySelectorAll(".character-dropdown").forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
  }
});

// ===== FUNZIONI DETTAGLI PERSONAGGIO MIGLIORATE =====
function showCharacterDetail(characterName) {
  const character = characters.find((c) => c.name === characterName);
  if (!character) return;

  // Nascondi la galleria e mostra la pagina dettagli
  document.querySelector(".container").style.display = "none";
  document.getElementById("characterDetailPage").style.display = "block";

  // Popola le informazioni base
  document.getElementById("detailCharacterName").textContent = character.name;
  document.getElementById(
    "detailElement"
  ).textContent = `${character.emoji} ${character.element}`;
  document.getElementById("detailWeapon").textContent = `${getWeaponEmoji(
    character.weapon
  )} ${character.weapon}`;
  document.getElementById("detailRegion").textContent = `${getRegionEmoji(
    character.region
  )} ${character.region}`;

  // Carica i dati salvati del personaggio
  loadCharacterDetailData(characterName);

  // Inizializza i selettori dei membri del team
  initializeTeamMemberSelectors();

  // Popola il dropdown delle armi
  populateWeaponDropdown();
}

function populateWeaponDropdown() {
  const weaponSelect = document.getElementById("detailCurrentWeapon");
  weaponSelect.innerHTML = '<option value="">Seleziona arma...</option>';

  // Lista di armi comuni in Genshin Impact
  const weapons = [
    { name: "Primordial Jade Winged-Spear", type: "Polearm", rarity: 5 },
    { name: "Staff of Homa", type: "Polearm", rarity: 5 },
    { name: "Engulfing Lightning", type: "Polearm", rarity: 5 },
    { name: "Mistsplitter Reforged", type: "Sword", rarity: 5 },
    { name: "Aquila Favonia", type: "Sword", rarity: 5 },
    { name: "Skyward Blade", type: "Sword", rarity: 5 },
    { name: "Wolf's Gravestone", type: "Claymore", rarity: 5 },
    { name: "The Unforged", type: "Claymore", rarity: 5 },
    { name: "Skyward Pride", type: "Claymore", rarity: 5 },
    { name: "Amos' Bow", type: "Bow", rarity: 5 },
    { name: "Skyward Harp", type: "Bow", rarity: 5 },
    { name: "Thundering Pulse", type: "Bow", rarity: 5 },
    { name: "Lost Prayer to the Sacred Winds", type: "Catalyst", rarity: 5 },
    { name: "Skyward Atlas", type: "Catalyst", rarity: 5 },
    { name: "Memory of Dust", type: "Catalyst", rarity: 5 },
    // Armi 4 stelle
    { name: "Favonius Lance", type: "Polearm", rarity: 4 },
    { name: "Dragon's Bane", type: "Polearm", rarity: 4 },
    { name: "Prototype Starglitter", type: "Polearm", rarity: 4 },
    { name: "Favonius Sword", type: "Sword", rarity: 4 },
    { name: "The Flute", type: "Sword", rarity: 4 },
    { name: "Prototype Rancour", type: "Sword", rarity: 4 },
    { name: "Favonius Greatsword", type: "Claymore", rarity: 4 },
    { name: "Prototype Archaic", type: "Claymore", rarity: 4 },
    { name: "The Bell", type: "Claymore", rarity: 4 },
    { name: "Favonius Warbow", type: "Bow", rarity: 4 },
    { name: "Prototype Crescent", type: "Bow", rarity: 4 },
    { name: "The Stringless", type: "Bow", rarity: 4 },
    { name: "Favonius Codex", type: "Catalyst", rarity: 4 },
    { name: "Prototype Amber", type: "Catalyst", rarity: 4 },
    { name: "The Widsith", type: "Catalyst", rarity: 4 },
  ];

  weapons.forEach((weapon) => {
    const option = document.createElement("option");
    option.value = weapon.name;
    option.textContent = `${"⭐".repeat(weapon.rarity)} ${weapon.name} (${
      weapon.type
    })`;
    weaponSelect.appendChild(option);
  });
}

function updateWeaponStats() {
  const weaponName = document.getElementById("detailCurrentWeapon").value;
  const weaponLevel =
    parseInt(document.getElementById("detailWeaponLevel").value) || 1;
  const refinement =
    parseInt(document.getElementById("detailWeaponRefinement").value) || 1;

  // Statistiche base delle armi (semplificate)
  const weaponStats = {
    "Primordial Jade Winged-Spear": { atk: 674, bonus: "Crit Rate 22.1%" },
    "Staff of Homa": { atk: 608, bonus: "Crit DMG 66.2%" },
    "Mistsplitter Reforged": { atk: 674, bonus: "Crit DMG 44.1%" },
    "Wolf's Gravestone": { atk: 608, bonus: "ATK 49.6%" },
    "Amos' Bow": { atk: 608, bonus: "ATK 49.6%" },
    "Lost Prayer to the Sacred Winds": { atk: 608, bonus: "Crit Rate 33.1%" },
  };

  const stats = weaponStats[weaponName] || { atk: 500, bonus: "ATK 25%" };

  // Calcola ATK base dell'arma (semplificato)
  const baseAtk = Math.floor(stats.atk * (0.8 + weaponLevel * 0.02));

  document.getElementById("weaponAtk").textContent = baseAtk;
  document.getElementById("weaponBonus").textContent = stats.bonus;
}

function loadCharacterDetailData(characterName) {
  const savedData = localStorage.getItem(`character_detail_${characterName}`);
  if (savedData) {
    const data = JSON.parse(savedData);

    // Popola tutti i campi con i dati salvati
    Object.keys(data).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "number") {
          element.value = parseInt(data[key]) || 0;
        } else {
          element.value = data[key] || "";
        }
      }
    });

    // Aggiorna i membri del team se esistono
    const teamMembers = [
      "detailTeam1Member1",
      "detailTeam1Member2",
      "detailTeam1Member3",
      "detailTeam1Member4",
      "detailTeam2Member1",
      "detailTeam2Member2",
      "detailTeam2Member3",
      "detailTeam2Member4",
    ];

    teamMembers.forEach((memberId) => {
      const memberName = data[memberId];
      if (memberName && memberName !== "") {
        const character = allCharacters.find((c) => c.name === memberName);
        if (character) {
          // Trova l'emoji del personaggio
          const emoji = getElementEmoji(character.element);

          // Usa la funzione selectTeamMember locale se disponibile, altrimenti quella globale
          if (typeof selectTeamMember === "function") {
            selectTeamMember(memberId, character.name, character.name, emoji);
          } else {
            // Fallback: aggiorna manualmente il display
            const memberInput = document.querySelector(
              `#${memberId}_dropdown`
            )?.previousElementSibling;
            if (memberInput) {
              const avatar = memberInput.querySelector(".team-member-avatar");
              const nameSpan = memberInput.querySelector(".team-member-name");
              const hiddenInput = document.getElementById(memberId + "_hidden");

              if (nameSpan) nameSpan.textContent = character.name;
              if (hiddenInput) hiddenInput.value = character.name;

              if (avatar) {
                // Prima prova a caricare l'immagine personalizzata dal localStorage
                const customImage = localStorage.getItem(
                  `character_image_${character.name}`
                );
                if (customImage) {
                  avatar.style.backgroundImage = `url(${customImage})`;
                  avatar.style.backgroundSize = "cover";
                  avatar.style.backgroundPosition = "center";
                  avatar.innerHTML = "";
                }
                // Altrimenti usa l'immagine dal JSON
                else if (character.image) {
                  avatar.style.backgroundImage = `url(${character.image})`;
                  avatar.style.backgroundSize = "cover";
                  avatar.style.backgroundPosition = "center";
                  avatar.innerHTML = "";
                }
                // Fallback all'emoji dell'elemento
                else {
                  avatar.style.backgroundImage = "none";
                  avatar.innerHTML = emoji || "👤";
                }
              }
            }
          }
        }
      }
    });

    // Aggiorna le statistiche dell'arma
    updateWeaponStats();
  }
}

function resetCharacterDetail() {
  if (confirm("Sei sicuro di voler resettare tutti i dati del personaggio?")) {
    const characterName = document.getElementById(
      "detailCharacterName"
    ).textContent;
    localStorage.removeItem(`character_detail_${characterName}`);

    // Reset di tutti i campi
    const fields = document.querySelectorAll(
      "#characterDetailPage input, #characterDetailPage textarea, #characterDetailPage select"
    );
    fields.forEach((field) => {
      if (field.type === "number") {
        field.value = "";
      } else {
        field.value = "";
      }
    });

    // Reset dei membri del team
    const teamMembers = document.querySelectorAll(".team-member-name");
    teamMembers.forEach((member) => {
      member.textContent = "Seleziona personaggio";
      const avatar = member.previousElementSibling;
      avatar.style.backgroundImage = "none";
      avatar.innerHTML = "👤";
    });

    showNotification("Dati resettati! 🔄", "info");
  }
}

function closeCharacterDetail() {
  document.getElementById("characterDetailPage").style.display = "none";
  document.querySelector(".container").style.display = "block";
}

// ===== FUNZIONI UTILITY =====
function getWeaponEmoji(weapon) {
  const weaponEmojis = {
    Sword: "⚔️",
    Claymore: "🗡️",
    Polearm: "🔱",
    Bow: "🏹",
    Catalyst: "📖",
  };
  return weaponEmojis[weapon] || "⚔️";
}

function getRegionEmoji(region) {
  const regionEmojis = {
    Mondstadt: "🏰",
    Liyue: "🏮",
    Inazuma: "⛩️",
    Sumeru: "🏛️",
    Fontaine: "🌊",
    Natlan: "🌋",
    Snezhnaya: "❄️",
    "Khaenri'ah": "⚫",
    Other: "🌍",
  };
  return regionEmojis[region] || "🏰";
}

function showNotification(message, type = "info") {
  // Crea una notifica temporanea
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--genshin-gold) 0%, #ffa500 100%);
    color: #1a1a2e;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ===== FUNZIONI PER TEAM COMPS SALVATI =====

// Funzione per caricare e mostrare i team comps salvati
function loadSavedTeams(characterName) {
  const container = document.getElementById("savedTeamsContainer");
  if (!container) return;

  const savedData = localStorage.getItem(`character_detail_${characterName}`);

  if (!savedData) {
    container.innerHTML = `
      <div class="no-teams-message">
        <p>Nessun team comp salvato per questo personaggio.</p>
        <p>Clicca su "Dettagli" per configurare i team comps.</p>
      </div>
    `;
    return;
  }

  try {
    const data = JSON.parse(savedData);
    let teamsHTML = "";

    // Team 1
    if (
      data.team1Name ||
      data.team1Member1 ||
      data.team1Member2 ||
      data.team1Member3 ||
      data.team1Member4
    ) {
      teamsHTML += createTeamHTML(
        "Team 1",
        data.team1Name,
        [
          data.team1Member1,
          data.team1Member2,
          data.team1Member3,
          data.team1Member4,
        ],
        data.team1Notes
      );
    }

    // Team 2
    if (
      data.team2Name ||
      data.team2Member1 ||
      data.team2Member2 ||
      data.team2Member3 ||
      data.team2Member4
    ) {
      teamsHTML += createTeamHTML(
        "Team 2",
        data.team2Name,
        [
          data.team2Member1,
          data.team2Member2,
          data.team2Member3,
          data.team2Member4,
        ],
        data.team2Notes
      );
    }

    if (teamsHTML) {
      container.innerHTML = teamsHTML;
    } else {
      container.innerHTML = `
        <div class="no-teams-message">
          <p>Nessun team comp configurato per questo personaggio.</p>
          <p>Clicca su "Dettagli" per configurare i team comps.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Errore nel caricamento dei team comps:", error);
    container.innerHTML = `
      <div class="no-teams-message">
        <p>Errore nel caricamento dei team comps.</p>
      </div>
    `;
  }
}

// Funzione per creare l'HTML di un team
function createTeamHTML(teamLabel, teamName, members, notes) {
  const teamDisplayName = teamName || teamLabel;
  let membersHTML = "";

  members.forEach((memberName, index) => {
    if (memberName && memberName.trim()) {
      const character = allCharacters.find((c) => c.name === memberName);
      if (character) {
        const avatar = getCharacterAvatar(character);
        membersHTML += `
          <div class="saved-team-member">
            <div class="team-member-number">${index + 1}</div>
            <div class="saved-team-member-avatar" style="background-image: url('${avatar}')">
              ${
                !avatar.includes("http") && !avatar.includes("data:")
                  ? getElementEmoji(character.element)
                  : ""
              }
            </div>
            <div class="saved-team-member-info">
              <div class="saved-team-member-name">${character.name}</div>
              <div class="saved-team-member-details">${character.element} • ${
          character.weapon
        } • ${character.rarity}★</div>
            </div>
          </div>
        `;
      } else {
        membersHTML += `
          <div class="saved-team-member">
            <div class="team-member-number">${index + 1}</div>
            <div class="saved-team-member-avatar">👤</div>
            <div class="saved-team-member-info">
              <div class="saved-team-member-name">${memberName}</div>
              <div class="saved-team-member-details">Personaggio non trovato</div>
            </div>
          </div>
        `;
      }
    }
  });

  let notesHTML = "";
  if (notes && notes.trim()) {
    notesHTML = `<div class="saved-team-notes">${notes}</div>`;
  }

  return `
    <div class="saved-team">
      <div class="saved-team-name">${teamDisplayName}</div>
      <div class="saved-team-members">
        ${membersHTML}
      </div>
      ${notesHTML}
    </div>
  `;
}

// Funzione per ottenere l'avatar di un personaggio
function getCharacterAvatar(character) {
  // Prima prova l'immagine personalizzata dal localStorage
  const customImage = localStorage.getItem(`character_image_${character.name}`);
  if (customImage) {
    return customImage;
  }

  // Altrimenti usa l'immagine dal JSON
  if (character.image) {
    return character.image;
  }

  // Fallback
  return "";
}

// Modifica la funzione selectCharacter per caricare anche i team comps
function selectCharacter(name) {
  currentCharacter = name;

  // Popola il form con i dati del personaggio
  const character = allCharacters.find((c) => c.name === name);
  if (character) {
    document.getElementById("charName").value = character.name;
    document.getElementById("weapon").value = character.weapon;
  }

  // Carica i dati salvati
  loadData();

  // Carica i team comps salvati
  loadSavedTeams(name);

  // Mostra la sezione di gestione
  showSection("character-selection");

  // Aggiorna il dropdown
  const select = document.getElementById("characterSelect");
  if (select) {
    select.value = name;
  }
}

// Funzione per aggiornare i team comps salvati
function refreshSavedTeams() {
  if (currentCharacter) {
    loadSavedTeams(currentCharacter);
    showNotification("Team comps aggiornati! 🔄");
  } else {
    showNotification("Nessun personaggio selezionato! ⚠️");
  }
}
