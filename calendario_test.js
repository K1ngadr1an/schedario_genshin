// Test di caricamento del file
console.log("File calendario_test.js caricato correttamente!");

// Variabili globali
let selectedArtifactToCreate = null;

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
function showTemplateTaskPopup(category, title, notes) {
  console.log("showTemplateTaskPopup chiamata:", category, title, notes);

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
  console.log("setTaskProgress chiamata:", progress);
}

// Funzione per confermare template attività
function confirmTemplateTask() {
  console.log("confirmTemplateTask chiamata");
  closeTemplateTask();
}

// Funzione per chiudere popup template
function closeTemplateTask() {
  document.getElementById("templateTaskPopup").style.display = "none";
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
    '<div class="popup farming-popup" style="max-width: 700px;"><div class="popup-header"><h3 class="popup-title">Seleziona Manufatto</h3><button class="popup-close" onclick="closeArtifactToCreateSelectionModal()">×</button></div><div class="popup-content"><div id="artifactToCreateGallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;max-height:45vh;overflow-y:auto;padding:1rem;background:rgba(10,10,26,0.8);border-radius:15px;border:1px solid rgba(100,255,218,0.2);"></div><div class="popup-actions" style="display:flex;gap:1rem;justify-content:flex-end;margin-top:1.5rem;padding-top:1rem;border-top:2px solid rgba(100,255,218,0.3);"><button class="btn" onclick="confirmArtifactToCreateSelection()">Conferma</button><button class="btn btn-secondary" onclick="closeArtifactToCreateSelectionModal()">Annulla</button></div></div></div>';

  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  // Popola la galleria artefatti
  renderArtifactToCreateGallery();
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
    ];

    sampleArtifacts.forEach(function (art) {
      const card = document.createElement("div");
      card.style.cssText =
        "background: rgba(10, 10, 26, 0.9); border: 2px solid transparent; border-radius: 12px; padding: 1rem; cursor: pointer; text-align: center;";

      let artifactDesc = "";
      if (art.setBonus) {
        artifactDesc =
          "Bonus 2pz: " +
          art.setBonus["2pc"] +
          " Bonus 4pz: " +
          art.setBonus["4pc"];
      }

      card.innerHTML =
        '<img src="' +
        art.image +
        '" alt="' +
        art.name +
        '" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(100, 255, 218, 0.3);" onclick="openMaterialImagePopup(\'' +
        art.image +
        "', '" +
        art.name +
        "', '" +
        artifactDesc +
        '\')"><div style="font-weight: 600; color: #e0e0e0; font-size: 0.9rem; margin: 0.5rem 0;">' +
        art.name +
        '</div><span style="color:#64ffda;font-size:0.85em;cursor:pointer;" onclick="event.stopPropagation(); openMaterialImagePopup(\'' +
        art.image +
        "', '" +
        art.name +
        "', '" +
        artifactDesc +
        "')\">Leggi descrizione</span>";

      card.addEventListener("click", function () {
        selectArtifactToCreate(art);
      });

      gallery.appendChild(card);
    });
  } catch (error) {
    console.error(
      "Errore durante il rendering della galleria artefatti:",
      error
    );
  }
}

// Funzione per gestire la selezione di manufatti
function selectArtifactToCreate(artifact) {
  selectedArtifactToCreate = artifact;
  document.getElementById("artifactToCreateInput").value = artifact.name;
  console.log("Artefatto selezionato:", artifact.name);
}

// Funzione per confermare la selezione
function confirmArtifactToCreateSelection() {
  if (selectedArtifactToCreate) {
    alert("Manufatto " + selectedArtifactToCreate.name + " selezionato!");
    closeArtifactToCreateSelectionModal();
  } else {
    alert("Nessun manufatto selezionato!");
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
window.renderArtifactToCreateGallery = renderArtifactToCreateGallery;
window.selectArtifactToCreate = selectArtifactToCreate;
window.confirmArtifactToCreateSelection = confirmArtifactToCreateSelection;
window.closeArtifactToCreateSelectionModal =
  closeArtifactToCreateSelectionModal;

// Inizializzazione
document.addEventListener("DOMContentLoaded", function () {
  console.log("Calendario test inizializzato!");
});
