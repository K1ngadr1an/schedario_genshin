// Test di caricamento del file
console.log("File calendario_minimal.js caricato correttamente!");

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
function openMaterialImagePopup(
  imageSrc,
  materialName,
  materialDescription = ""
) {
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

// Rendi le funzioni accessibili globalmente
window.openMaterialImagePopup = openMaterialImagePopup;
window.closeMaterialImagePopup = closeMaterialImagePopup;

// Inizializzazione
document.addEventListener("DOMContentLoaded", function () {
  console.log("Calendario minimale inizializzato!");
});
