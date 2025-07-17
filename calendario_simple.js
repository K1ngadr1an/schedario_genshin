// Test di caricamento del file
console.log("File calendario_simple.js caricato correttamente!");

// Variabili globali calendario
let currentDate = new Date();
let selectedDate = new Date();
let tasks = {};
let currentEditingTask = null;

// Variabili per gli artefatti
let allArtifacts = [];
let selectedArtifacts = [];
let currentArtifactSearch = "";

// Variabili per i template
let currentTemplateData = null;
let selectedTaskProgress = "not-started";

// Variabili per il farming
let allMaterials = {};
let selectedMaterials = [];
let currentFarmingSearch = "";
let currentFarmingCategoryFilter = "";
let currentFarmingRarityFilter = "";

// Variabile globale per il manufatto selezionato da creare
let selectedArtifactToCreate = null;

// Variabili per le immagini delle attività
let selectedTaskImages = [];
let currentTaskImagesSearch = "";
let currentTaskImagesCategoryFilter = "";
let currentTaskImagesRarityFilter = "";
let currentTaskImagesMode = ""; // "new", "edit", "template"

// Funzione di test per il modal immagine materiale
function openMaterialImagePopup(imageSrc, materialName, materialDescription) {
  console.log("openMaterialImagePopup chiamata con:", imageSrc, materialName);

  const popup = document.getElementById("materialImagePopup");
  const image = document.getElementById("materialImageLarge");
  const title = document.getElementById("materialImageTitle");
  const description = document.getElementById("materialImageDescription");

  if (!popup) {
    console.error("Modal popup non trovato!");
    return;
  }

  // Imposta sempre z-index e display
  popup.style.display = "flex";
  popup.style.zIndex = "13000";

  if (image) image.src = imageSrc || "images/characters/placeholder.svg";
  if (title) title.textContent = materialName || "Titolo materiale";
  if (description) description.textContent = materialDescription || "";

  document.body.style.overflow = "hidden";
}

function closeMaterialImagePopup() {
  const popup = document.getElementById("materialImagePopup");
  if (popup) {
    popup.style.display = "none";
    document.body.style.overflow = "";
  }
}

// Funzione per aggiungere template attività
function addTemplateTask(category, title, notes) {
  console.log("addTemplateTask chiamata:", category, title, notes);
  showTemplateTaskPopup(category, title, notes);
}

// Funzione per mostrare popup template
function showTemplateTaskPopup(category, title, notes, selectedMaterialsData) {
  console.log("showTemplateTaskPopup chiamata:", category, title, notes);

  currentTemplateData = {
    category: category,
    title: title,
    notes: notes,
    selectedMaterialsData: selectedMaterialsData,
  };

  // Popola i campi del popup
  document.getElementById("templateTitle").textContent = title;
  document.getElementById("templateDescription").textContent = notes;
  document.getElementById("templateIcon").textContent =
    getCategoryIcon(category);
  document.getElementById("templateTaskTitle").value = title;
  document.getElementById("templateTaskCategory").value = category;
  document.getElementById("templateTaskNotes").value = notes;

  // Mostra/nascondi sezione manufatto da creare
  const artifactSection = document.getElementById("artifactToCreateSection");
  if (category === "other" && title === "Trasmutatore Manufatti") {
    artifactSection.style.display = "block";
  } else {
    artifactSection.style.display = "none";
  }

  // Reset progress
  selectedTaskProgress = "not-started";
  document.querySelectorAll(".progress-btn").forEach(function (btn) {
    btn.classList.remove("active");
  });
  document
    .querySelector('[data-progress="not-started"]')
    .classList.add("active");

  document.getElementById("templateTaskPopup").style.display = "flex";
}

// Funzione per ottenere icona categoria
function getCategoryIcon(category) {
  const icons = {
    daily: "📅",
    weekly: "📆",
    events: "🎉",
    farming: "🌾",
    domains: "🏛️",
    abyss: "⚔️",
    other: "📝",
  };
  return icons[category] || "📝";
}

// Funzione per impostare progresso attività
function setTaskProgress(progress) {
  selectedTaskProgress = progress;
  document.querySelectorAll(".progress-btn").forEach(function (btn) {
    btn.classList.remove("active");
  });
  document
    .querySelector('[data-progress="' + progress + '"]')
    .classList.add("active");
}

// Funzione per confermare template attività
function confirmTemplateTask() {
  console.log("confirmTemplateTask chiamata");
  showNotification("Funzione conferma template non ancora implementata!");
  closeTemplateTask();
}

// Funzione per chiudere popup template
function closeTemplateTask() {
  document.getElementById("templateTaskPopup").style.display = "none";
  currentTemplateData = null;
  selectedTaskProgress = "not-started";
  selectedArtifactToCreate = null;
}

// Funzione per aprire modal selezione manufatto
function openArtifactToCreateModal() {
  console.log("openArtifactToCreateModal chiamata");

  // Se esiste già, rimuovi il vecchio popup
  const oldPopup = document.getElementById("artifactToCreateSelectionPopup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.id = "artifactToCreateSelectionPopup";
  popup.className = "popup-overlay";
  popup.style.cssText =
    "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.85); z-index: 12000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(6px);";

  popup.innerHTML =
    '<div class="popup farming-popup" style="max-width: 700px;"><div class="popup-header"><h3 class="popup-title">💎 Seleziona Manufatto da Creare</h3><button class="popup-close" onclick="closeArtifactToCreateSelectionModal()">×</button></div><div class="popup-content"><div class="farming-search" style="margin-bottom:1.2rem;"><input type="text" id="artifactToCreateSearchInput" placeholder="🔍 Cerca artefatto..." class="farming-search-input" /></div><div class="artifact-gallery" id="artifactToCreateGallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;max-height:45vh;overflow-y:auto;padding:1rem;background:rgba(10,10,26,0.8);border-radius:15px;border:1px solid rgba(100,255,218,0.2);"></div><div class="selected-artifacts" style="margin-top:1.5rem;"><h4 style="color:#64ffda;margin-bottom:1rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Manufatto Selezionato:</h4><div id="selectedArtifactToCreateDisplay" style="display:flex;align-items:center;gap:0.7em;min-height:50px;"></div></div><div class="popup-actions" style="display:flex;gap:1rem;justify-content:flex-end;margin-top:1.5rem;padding-top:1rem;border-top:2px solid rgba(100,255,218,0.3);"><button class="btn" onclick="confirmArtifactToCreateSelection()">✅ Conferma Selezione</button><button class="btn btn-secondary" onclick="closeArtifactToCreateSelectionModal()">❌ Annulla</button></div></div></div>';

  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  // Popola la galleria artefatti
  renderArtifactToCreateGallery();
  renderSelectedArtifactToCreateDisplay();

  // Setup ricerca
  setupArtifactToCreateSearch();

  // Focus sulla barra di ricerca
  setTimeout(function () {
    const searchInput = document.getElementById("artifactToCreateSearchInput");
    if (searchInput) searchInput.focus();
  }, 300);
}

// Funzione per renderizzare la galleria degli artefatti
function renderArtifactToCreateGallery() {
  try {
    const gallery = document.getElementById("artifactToCreateGallery");
    if (!gallery) return;

    gallery.innerHTML = "";

    // Per ora usiamo artefatti di esempio
    const sampleArtifacts = [
      {
        name: "Fiori di Paradiso",
        image: "images/characters/placeholder.svg",
        setBonus: {
          "2pc": "Aumenta l'ATK del 18%",
          "4pc":
            "Quando il personaggio usa l'abilità elementale, ottiene il buff 'Fiori di Paradiso' per 16s",
        },
      },
      {
        name: "Ombra Verde",
        image: "images/characters/placeholder.svg",
        setBonus: {
          "2pc": "Aumenta il DAN da Dendro del 15%",
          "4pc":
            "Dopo aver attivato una reazione elementale, aumenta il DAN da Dendro del 25% per 8s",
        },
      },
      {
        name: "Sogni Dorati",
        image: "images/characters/placeholder.svg",
        setBonus: {
          "2pc": "Aumenta la MAST Elementale del 80",
          "4pc":
            "Dopo aver attivato una reazione elementale, aumenta la MAST Elementale del 150 per 8s",
        },
      },
    ];

    sampleArtifacts.forEach(function (art) {
      const card = document.createElement("div");
      card.className = "artifact-to-create-item";
      card.style.cssText =
        "background: linear-gradient(135deg, rgba(10, 10, 26, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%); border: 2px solid transparent; border-radius: 12px; padding: 1rem; cursor: pointer; transition: all 0.3s ease; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);";

      const isSelected =
        selectedArtifactToCreate && selectedArtifactToCreate.name === art.name;
      if (isSelected) {
        card.style.borderColor = "#64ffda";
        card.style.boxShadow =
          "0 0 12px rgba(100, 255, 218, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)";
        card.style.background =
          "linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(22, 33, 62, 0.9) 100%)";
      }

      let artifactDesc = "";
      if (art.setBonus) {
        artifactDesc =
          "Bonus 2pz: " +
          art.setBonus["2pc"] +
          "\n\nBonus 4pz: " +
          art.setBonus["4pc"];
      }

      card.innerHTML =
        '<img src="' +
        art.image +
        '" alt="' +
        art.name +
        '" class="artifact-image" onerror="this.src=\'images/characters/placeholder.svg\'" title="Clicca per vedere la descrizione e l\'immagine in grande" style="cursor: pointer; width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(100, 255, 218, 0.3);" onclick="openMaterialImagePopup(\'' +
        art.image +
        "', '" +
        art.name +
        "', '" +
        artifactDesc.replace(/'/g, "\\'") +
        '\')"><div class="artifact-info"><div class="artifact-name" style="font-weight: 600; color: #e0e0e0; font-size: 0.9rem; margin-bottom: 0.3rem;">' +
        art.name +
        '</div><div style="margin: 0.3em 0 0.5em 0;"><span style="color:#64ffda;font-size:0.85em;cursor:pointer;" onclick="event.stopPropagation(); openMaterialImagePopup(\'' +
        art.image +
        "', '" +
        art.name +
        "', '" +
        artifactDesc.replace(/'/g, "\\'") +
        "')\">Leggi descrizione</span></div></div>";

      card.addEventListener("click", function () {
        selectArtifactToCreate(art);
      });

      card.addEventListener("mouseenter", function () {
        if (!isSelected) {
          card.style.borderColor = "rgba(100, 255, 218, 0.5)";
          card.style.transform = "translateY(-2px)";
        }
      });

      card.addEventListener("mouseleave", function () {
        if (!isSelected) {
          card.style.borderColor = "transparent";
          card.style.transform = "translateY(0)";
        }
      });

      gallery.appendChild(card);
    });
  } catch (error) {
    console.error(
      "Errore durante il rendering della galleria artefatti:",
      error
    );
    const gallery = document.getElementById("artifactToCreateGallery");
    if (gallery) {
      gallery.innerHTML =
        '<div style="color: #ff6f3c; text-align: center; grid-column: 1 / -1;">Errore nel caricamento della galleria.</div>';
    }
  }
}

// Funzione per renderizzare la visualizzazione del manufatto selezionato
function renderSelectedArtifactToCreateDisplay() {
  const display = document.getElementById("selectedArtifactToCreateDisplay");
  if (!display) return;

  if (selectedArtifactToCreate) {
    let artifactDesc = "";
    if (selectedArtifactToCreate.setBonus) {
      artifactDesc =
        "Bonus 2pz: " +
        selectedArtifactToCreate.setBonus["2pc"] +
        "\n\nBonus 4pz: " +
        selectedArtifactToCreate.setBonus["4pc"];
    }

    display.innerHTML =
      '<img src="' +
      selectedArtifactToCreate.image +
      '" alt="' +
      selectedArtifactToCreate.name +
      '" onerror="this.src=\'images/characters/placeholder.svg\'" onclick="openMaterialImagePopup(\'' +
      selectedArtifactToCreate.image +
      "', '" +
      selectedArtifactToCreate.name +
      "', '" +
      artifactDesc.replace(/'/g, "\\'") +
      '\')" title="Clicca per vedere la descrizione e l\'immagine in grande" style="cursor: pointer; width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(100, 255, 218, 0.5);"><span style="color: #64ffda; font-weight: 600; font-size: 1.1rem;">' +
      selectedArtifactToCreate.name +
      '</span><button onclick="removeSelectedArtifactToCreate()" style="background: rgba(255, 107, 107, 0.2); border: 1px solid rgba(255, 107, 107, 0.5); color: #ff6b6b; cursor: pointer; font-size: 1.2rem; padding: 0.2rem 0.5rem; border-radius: 50%; transition: all 0.3s ease; margin-left: auto;" onmouseover="this.style.background=\'rgba(255, 107, 107, 0.3)\'" onmouseout="this.style.background=\'rgba(255, 107, 107, 0.2)\'">×</button>';
  } else {
    display.innerHTML =
      '<span style="color: #888; font-style: italic;">Nessun manufatto selezionato</span>';
  }
}

// Funzione per setup della ricerca
function setupArtifactToCreateSearch() {
  const searchInput = document.getElementById("artifactToCreateSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderArtifactToCreateGallery();
    });
  }
}

// Funzione per gestire la selezione di manufatti
function selectArtifactToCreate(artifact) {
  selectedArtifactToCreate = artifact;
  document.getElementById("artifactToCreateInput").value = artifact.name;

  // Aggiorna il container dell'immagine nel template popup
  const container = document.getElementById("artifactToCreateImgContainer");
  if (container) {
    let artifactDesc = "";
    if (artifact.setBonus) {
      artifactDesc =
        "Bonus 2pz: " +
        artifact.setBonus["2pc"] +
        "\n\nBonus 4pz: " +
        artifact.setBonus["4pc"];
    }
    container.innerHTML =
      '<img src="' +
      artifact.image +
      '" alt="' +
      artifact.name +
      "\" style=\"width:32px;height:32px;border-radius:6px;border:1.5px solid #64ffda;background:#222;object-fit:cover;cursor:pointer;\" onerror=\"this.onerror=null;this.src='images/characters/placeholder.svg';this.setAttribute('data-placeholder','1');\" onclick=\"openMaterialImagePopup('" +
      artifact.image +
      "', '" +
      artifact.name +
      "', '" +
      artifactDesc.replace(/'/g, "\\'") +
      "')\">";
  }

  // Aggiorna anche la visualizzazione nel modal di selezione
  renderSelectedArtifactToCreateDisplay();

  // Aggiorna la galleria per evidenziare la selezione
  renderArtifactToCreateGallery();
}

// Funzione per confermare la selezione
function confirmArtifactToCreateSelection() {
  if (selectedArtifactToCreate) {
    showNotification(
      'Manufatto "' +
        selectedArtifactToCreate.name +
        '" selezionato per la creazione! ⚒️'
    );
    closeArtifactToCreateSelectionModal();
  } else {
    showNotification("Nessun manufatto selezionato! ⚠️");
  }
}

// Funzione per chiudere il modal di selezione
function closeArtifactToCreateSelectionModal() {
  const popup = document.getElementById("artifactToCreateSelectionPopup");
  if (popup) {
    popup.remove();
  }
  document.body.style.overflow = "";
}

// Funzione per rimuovere la selezione
function removeSelectedArtifactToCreate() {
  selectedArtifactToCreate = null;
  document.getElementById("artifactToCreateInput").value = "";
  document.getElementById("artifactToCreateImgContainer").innerHTML = "";

  // Aggiorna anche la visualizzazione nel modal di selezione
  renderSelectedArtifactToCreateDisplay();

  // Aggiorna la galleria per rimuovere la selezione visiva
  renderArtifactToCreateGallery();
}

// Funzione per mostrare notifiche
function showNotification(message) {
  console.log("Notifica:", message);
  // Implementazione semplice per ora
  alert(message);
}

// Rendi le funzioni accessibili globalmente
window.openMaterialImagePopup = openMaterialImagePopup;
window.closeMaterialImagePopup = closeMaterialImagePopup;
window.addTemplateTask = addTemplateTask;
window.showTemplateTaskPopup = showTemplateTaskPopup;
window.getCategoryIcon = getCategoryIcon;
window.setTaskProgress = setTaskProgress;
window.confirmTemplateTask = confirmTemplateTask;
window.closeTemplateTask = closeTemplateTask;
window.openArtifactToCreateModal = openArtifactToCreateModal;
window.showNotification = showNotification;
window.renderArtifactToCreateGallery = renderArtifactToCreateGallery;
window.renderSelectedArtifactToCreateDisplay =
  renderSelectedArtifactToCreateDisplay;
window.setupArtifactToCreateSearch = setupArtifactToCreateSearch;
window.selectArtifactToCreate = selectArtifactToCreate;
window.confirmArtifactToCreateSelection = confirmArtifactToCreateSelection;
window.closeArtifactToCreateSelectionModal =
  closeArtifactToCreateSelectionModal;
window.removeSelectedArtifactToCreate = removeSelectedArtifactToCreate;

// Inizializzazione
document.addEventListener("DOMContentLoaded", function () {
  console.log("Calendario semplice inizializzato!");
});
