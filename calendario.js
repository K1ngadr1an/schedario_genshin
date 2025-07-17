// Test di caricamento del file
console.log("File calendario.js caricato correttamente!");

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
  try {
    const popup = document.getElementById("materialImagePopup");
    const image = document.getElementById("materialImageLarge");
    const title = document.getElementById("materialImageTitle");
    const description = document.getElementById("materialImageDescription");

    if (!popup) {
      console.error("Modal popup non trovato!");
      showNotification("Errore: Modal non trovato! ❌");
      return;
    }
    if (!image) {
      console.error("Elemento immagine non trovato!");
      showNotification("Errore: Elemento immagine non trovato! ❌");
      return;
    }
    if (!title) {
      console.error("Elemento titolo non trovato!");
      showNotification("Errore: Elemento titolo non trovato! ❌");
      return;
    }
    if (!description) {
      console.error("Elemento descrizione non trovato!");
      showNotification("Errore: Elemento descrizione non trovato! ❌");
      return;
    }

    popup.style.display = "flex";
    popup.style.zIndex = "13000";

    image.src = imageSrc || "images/characters/placeholder.svg";
    image.alt = materialName || "Immagine Materiale";
    image.onerror = function () {
      this.src = "images/characters/placeholder.svg";
    };
    title.textContent = materialName || "Titolo materiale";

    // Gestione descrizioni lunghe e caratteri speciali
    let descText = materialDescription || "";
    if (descText.length > 200) {
      descText = descText.replace(/\. /g, ".\n\n");
    }
    description.textContent = descText;
    description.style.whiteSpace = "pre-line";
    description.style.lineHeight = "1.6";

    document.body.style.overflow = "hidden";
    console.log("Modal aperto per:", materialName);
  } catch (error) {
    console.error("Errore nell'apertura del modal:", error);
  }
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
  console.log("Calendario inizializzato!");
});

// Renderizza il calendario
function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  const currentMonthYear = document.getElementById("currentMonthYear");

  // Aggiorna header mese/anno
  const months = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  currentMonthYear.textContent = `${
    months[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  // Calcola primo giorno del mese e numero giorni
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  let calendarHTML = "";

  // Genera 42 giorni (6 settimane)
  for (let i = 0; i < 42; i++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(startDate.getDate() + i);

    const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
    const isToday = isSameDay(currentDay, new Date());
    const isSelected = isSameDay(currentDay, selectedDate);
    const dayTasks = getTasksForDate(currentDay);
    const completedTasks = dayTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const totalTasks = dayTasks.length;

    let dayClass = "calendar-day";
    if (!isCurrentMonth) dayClass += " other-month";
    if (isToday) dayClass += " today";
    if (isSelected) dayClass += " selected";

    calendarHTML += `
            <div class="${dayClass}" onclick="selectDate('${currentDay.toISOString()}')">
                <div class="day-number">${currentDay.getDate()}</div>
                ${
                  totalTasks > 0
                    ? `
                    <div class="day-tasks-indicator">
                        <span class="completed-count">${completedTasks}</span>
                        <span class="total-count">/${totalTasks}</span>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  calendarDays.innerHTML = calendarHTML;
}

// Seleziona una data
function selectDate(dateString) {
  selectedDate = new Date(dateString);
  renderCalendar();
  renderTasks();
  updateSelectedDateDisplay();
  updateStats();
}

// Navigazione mesi
function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

// ===== GESTIONE ATTIVITÀ =====

// ===== ESPANSIONE AUTOMATICA DIV DAILY TASKS =====

// Espande automaticamente la sezione daily-tasks
function expandDailyTasksSection() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  if (dailyTasksSection) {
    dailyTasksSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Toggle espansione sezione daily-tasks
function toggleDailyTasksExpansion() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  const expansionBtnText = document.getElementById("expansionBtnText");

  if (dailyTasksSection.classList.contains("expanded")) {
    // Comprimi
    dailyTasksSection.classList.remove(
      "expanded",
      "expanded-extra",
      "expanded-max"
    );
    expansionBtnText.textContent = "Espandi Sezione";
    showNotification("Sezione compressa! 📏");
  } else if (dailyTasksSection.classList.contains("expanded-extra")) {
    // Vai al livello successivo
    dailyTasksSection.classList.remove("expanded-extra");
    dailyTasksSection.classList.add("expanded");
    expansionBtnText.textContent = "Espandi Ancora";
    showNotification("Espansione ridotta! 📏");
  } else {
    // Espandi al primo livello
    dailyTasksSection.classList.add("expanded");
    expansionBtnText.textContent = "Espandi Ancora";
    showNotification("Sezione espansa! 📏");
  }
}

// Espansione massima della sezione daily-tasks
function expandDailyTasksMax() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  const expansionBtnText = document.getElementById("expansionBtnText");

  // Rimuovi tutte le classi di espansione
  dailyTasksSection.classList.remove("expanded", "expanded-extra");

  // Aggiungi espansione massima
  dailyTasksSection.classList.add("expanded-max");
  expansionBtnText.textContent = "Comprimi Sezione";

  showNotification("Espansione massima attivata! 🚀");
}

// Espandi la sezione daily-tasks
function expandDailyTasks() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  if (dailyTasksSection) {
    dailyTasksSection.classList.add("expanded");
    document.getElementById("expandTasksBtn").style.display = "none";
    document.getElementById("compressTasksBtn").style.display = "";
  }
}

// Comprimi la sezione daily-tasks
function compressDailyTasks() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  if (dailyTasksSection) {
    dailyTasksSection.classList.remove("expanded");
    document.getElementById("expandTasksBtn").style.display = "";
    document.getElementById("compressTasksBtn").style.display = "none";
  }
}

// Aggiungi nuova attività
function addNewTask() {
  const title = document.getElementById("newTaskTitle").value.trim();
  const category = document.getElementById("newTaskCategory").value;
  const priority = document.getElementById("newTaskPriority").value;
  const notes = document.getElementById("newTaskNotes").value.trim();
  const time = document.getElementById("newTaskTime").value;

  if (!title) {
    showNotification("Inserisci un titolo per l'attività! ⚠️");
    return;
  }

  const task = {
    id: generateTaskId(),
    title: title,
    category: category,
    priority: priority,
    notes: notes,
    time: time,
    status: "pending",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  // Aggiungi le immagini selezionate se presenti
  if (selectedTaskImages && selectedTaskImages.length > 0) {
    task.selectedImages = selectedTaskImages;
  }

  console.log("Aggiungendo attività:", task);
  console.log("Data selezionata:", selectedDate);
  console.log("Chiave data:", formatDateKey(selectedDate));

  addTaskToDate(selectedDate, task);

  console.log("Attività dopo aggiunta:", getTasksForDate(selectedDate));

  clearNewTaskForm();
  renderTasks();
  renderCalendar();
  updateStats();

  // Espande automaticamente la sezione se ci sono molte attività
  const dayTasks = getTasksForDate(selectedDate);
  if (dayTasks.length > 10) {
    const dailyTasksSection = document.querySelector(".daily-tasks");
    if (
      dailyTasksSection &&
      !dailyTasksSection.classList.contains("expanded-max")
    ) {
      dailyTasksSection.classList.add("expanded-max");
      const expansionBtnText = document.getElementById("expansionBtnText");
      if (expansionBtnText) {
        expansionBtnText.textContent = "Comprimi Sezione";
      }
    }
  } else if (dayTasks.length > 5) {
    const dailyTasksSection = document.querySelector(".daily-tasks");
    if (
      dailyTasksSection &&
      !dailyTasksSection.classList.contains("expanded")
    ) {
      dailyTasksSection.classList.add("expanded");
      const expansionBtnText = document.getElementById("expansionBtnText");
      if (expansionBtnText) {
        expansionBtnText.textContent = "Espandi Ancora";
      }
    }
  }

  // Scroll alla sezione
  expandDailyTasksSection();

  showNotification("Attività aggiunta con successo! ✅");
}

// Aggiungi attività da template
function addTemplateTask(category, title, notes) {
  if (category === "farming" && title === "Material Farming") {
    // Apri il popup farming invece del template normale
    openFarmingPopup();
    return;
  }

  // Caso speciale per Artifact Farming
  if (title === "Artifact Farming") {
    showArtifactTable();
    return;
  }

  // Comportamento normale per altri template
  showTemplateTaskPopup(category, title, notes);
}

// Mostra popup template attività
function showTemplateTaskPopup(
  category,
  title,
  notes,
  selectedMaterialsData = null
) {
  currentTemplateData = { category, title, notes, selectedMaterialsData };

  document.getElementById("templateIcon").textContent =
    getCategoryIcon(category);
  document.getElementById("templateTitle").textContent = title;
  document.getElementById("templateDescription").textContent = notes;
  document.getElementById("templateTaskTitle").value = title;
  document.getElementById("templateTaskCategory").value = category;
  document.getElementById("templateTaskNotes").value = notes;

  // Reset delle immagini per tutti i template
  selectedTaskImages = [];

  // Mostra la sezione solo per Trasmutatore Manufatti
  if (category === "other" && title === "Trasmutatore Manufatti") {
    document.getElementById("artifactToCreateSection").style.display = "block";
    // Ripristina il valore se già selezionato
    document.getElementById("artifactToCreateInput").value =
      selectedArtifactToCreate ? selectedArtifactToCreate.name : "";
    // Mostra immagine cliccabile se selezionato
    const imgContainer = document.getElementById(
      "artifactToCreateImgContainer"
    );
    if (selectedArtifactToCreate && selectedArtifactToCreate.image) {
      let artifactDesc = "";
      if (selectedArtifactToCreate.setBonus) {
        artifactDesc =
          "Bonus 2pz: " +
          selectedArtifactToCreate.setBonus["2pc"] +
          "\n\nBonus 4pz: " +
          selectedArtifactToCreate.setBonus["4pc"];
      }
      imgContainer.innerHTML = `<img src="${
        selectedArtifactToCreate.image
      }" alt="${
        selectedArtifactToCreate.name
      }" style="width:32px;height:32px;border-radius:6px;border:1.5px solid #64ffda;background:#222;object-fit:cover;cursor:pointer;" onerror="this.onerror=null;this.src='images/characters/placeholder.svg';this.setAttribute('data-placeholder','1');" onclick="openMaterialImagePopup(${JSON.stringify(
        selectedArtifactToCreate.image
      )}, ${JSON.stringify(selectedArtifactToCreate.name)}, ${JSON.stringify(
        artifactDesc
      )})">`;
    } else {
      // Mostra sempre un placeholder cliccabile
      imgContainer.innerHTML = `<img src="images/characters/placeholder.svg" alt="Nessun manufatto selezionato" style="width:32px;height:32px;border-radius:6px;border:1.5px solid #64ffda;background:#222;object-fit:cover;cursor:pointer;opacity:0.6;" onclick="openMaterialImagePopup('images/characters/placeholder.svg', 'Nessun manufatto selezionato', 'Seleziona un manufatto per vedere i dettagli.')">`;
    }
  } else {
    document.getElementById("artifactToCreateSection").style.display = "none";
    document.getElementById("artifactToCreateInput").value = "";
    document.getElementById("artifactToCreateImgContainer").innerHTML = "";
    selectedArtifactToCreate = null;
  }

  // Reset progress
  selectedTaskProgress = "not-started";
  document
    .querySelectorAll(".progress-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector('[data-progress="not-started"]')
    .classList.add("active");

  document.getElementById("templateTaskPopup").style.display = "flex";
}

// Ottieni icona categoria
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

// Imposta progresso attività
function setTaskProgress(progress) {
  selectedTaskProgress = progress;

  // Rimuovi classe active da tutti i pulsanti
  document.querySelectorAll(".progress-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Aggiungi classe active al pulsante selezionato
  document
    .querySelector(`[data-progress="${progress}"]`)
    .classList.add("active");
}

// Conferma template attività
function confirmTemplateTask() {
  try {
    const title = document.getElementById("templateTaskTitle").value.trim();
    const category = document.getElementById("templateTaskCategory").value;
    const priority = document.getElementById("templateTaskPriority").value;
    const notes = document.getElementById("templateTaskNotes").value.trim();
    const time = document.getElementById("templateTaskTime").value;

    if (!title) {
      showNotification("Inserisci un titolo per l'attività! ⚠️");
      return;
    }

    // Determina lo status basato sul progresso
    let status = "pending";
    if (selectedTaskProgress === "completed") {
      status = "completed";
    } else if (selectedTaskProgress === "in-progress") {
      status = "pending"; // Potresti aggiungere un nuovo status "in-progress" se vuoi
    }

    const task = {
      id: generateTaskId(),
      title: title,
      category: category,
      priority: priority,
      notes: notes,
      time: time,
      status: status,
      createdAt: new Date().toISOString(),
      completedAt: status === "completed" ? new Date().toISOString() : null,
    };

    // Aggiungi i materiali selezionati se presenti (per attività di farming)
    if (currentTemplateData && currentTemplateData.selectedMaterialsData) {
      task.selectedMaterials = currentTemplateData.selectedMaterialsData;
    }

    // Aggiungi il manufatto da creare se presente
    if (
      category === "other" &&
      title === "Trasmutatore Manufatti" &&
      selectedArtifactToCreate
    ) {
      task.artifactToCreate = selectedArtifactToCreate;
    }

    // Aggiungi le immagini selezionate se presenti
    if (selectedTaskImages && selectedTaskImages.length > 0) {
      task.selectedImages = selectedTaskImages;
    }

    addTaskToDate(selectedDate, task);
    closeTemplateTask();
    renderTasks();
    renderCalendar();
    updateStats();

    // Espande automaticamente la sezione
    expandDailyTasksSection();

    const progressText =
      selectedTaskProgress === "completed"
        ? "completata"
        : selectedTaskProgress === "in-progress"
        ? "iniziata"
        : "aggiunta";
    showNotification(`Attività ${progressText} con successo! ✅`);
  } catch (error) {
    console.error("Errore durante la conferma del template task:", error);
    showNotification("Errore durante l'aggiunta dell'attività! ❌");
    // Assicurati che il popup venga chiuso anche in caso di errore
    closeTemplateTask();
  }
}

// Chiudi popup template
function closeTemplateTask() {
  document.getElementById("templateTaskPopup").style.display = "none";
  currentTemplateData = null;
  selectedTaskProgress = "not-started";
  // Reset del manufatto selezionato per evitare problemi
  selectedArtifactToCreate = null;
}

// Renderizza le attività
function renderTasks() {
  try {
    const tasksList = document.getElementById("tasksList");
    const dayTasks = getTasksForDate(selectedDate);

    if (dayTasks.length === 0) {
      tasksList.innerHTML = `
              <div class="no-tasks">
                  <div class="no-tasks-icon">📅</div>
                  <h4>Nessuna attività per questa data</h4>
                  <p>Aggiungi la tua prima attività usando il form qui sotto!</p>
              </div>
          `;
      return;
    }

    let tasksHTML = "";
    dayTasks.forEach((task) => {
      const priorityColors = {
        low: "🟢",
        medium: "🟡",
        high: "🔴",
        critical: "⚫",
      };

      const statusIcons = {
        pending: "⏳",
        completed: "✅",
        skipped: "⏭️",
      };

      const categoryIcons = {
        daily: "📅",
        weekly: "📆",
        events: "🎉",
        farming: "🌾",
        domains: "🏛️",
        abyss: "⚔️",
        other: "📝",
      };

      // Se è una task Trasmutatore Manufatti con artifactToCreate, mostra l'artefatto scelto
      let artifactToCreateHTML = "";
      if (
        task.category === "other" &&
        task.title === "Trasmutatore Manufatti"
      ) {
        let imgSrc =
          task.artifactToCreate && task.artifactToCreate.image
            ? task.artifactToCreate.image
            : "images/characters/placeholder.svg";
        let artifactName =
          task.artifactToCreate && task.artifactToCreate.name
            ? task.artifactToCreate.name
            : "Nessun manufatto selezionato";
        let artifactDesc = "";
        if (task.artifactToCreate && task.artifactToCreate.setBonus) {
          artifactDesc =
            "Bonus 2pz: " +
            task.artifactToCreate.setBonus["2pc"] +
            "\n\nBonus 4pz: " +
            task.artifactToCreate.setBonus["4pc"];
        } else {
          artifactDesc = "Seleziona un manufatto per vedere i dettagli.";
        }
        // Usa JSON.stringify e doppi apici per l'onclick
        artifactToCreateHTML = `
        <div class="task-artifact-to-create" style="margin-top:0.7em;display:flex;align-items:center;gap:0.7em;">
          <img src="${imgSrc}" alt="${artifactName}"
            style="width:32px;height:32px;border-radius:6px;border:1.5px solid #64ffda;background:#222;object-fit:cover;cursor:pointer;${
              imgSrc.includes("placeholder") ? "opacity:0.6;" : ""
            }"
            onerror="this.onerror=null;this.src='images/characters/placeholder.svg';this.setAttribute('data-placeholder','1');"
            onclick="openMaterialImagePopup(${JSON.stringify(
              imgSrc
            )}, ${JSON.stringify(artifactName)}, ${JSON.stringify(
          artifactDesc
        )})">
          <span style="color:#64ffda;font-weight:600;">${artifactName}</span>
        </div>
      `;
      }

      // Se è una task di tipo domains, abyss o farming con artefatti, mostra gli artefatti (tutti cliccabili)
      let artifactsHTML = "";
      if (
        (task.category === "domains" ||
          task.category === "abyss" ||
          task.category === "farming") &&
        Array.isArray(task.selectedArtifacts) &&
        task.selectedArtifacts.length > 0
      ) {
        const labelText =
          task.category === "farming" ? "Artefatti da farmare:" : "Artefatti:";
        artifactsHTML = `<div class="task-artifacts" style="margin:0.8rem 0;">
        <div class="artifacts-label">${labelText}</div>
        <div class="artifacts-list">`;
        for (const art of task.selectedArtifacts) {
          const imgSrc = art.image || "images/characters/placeholder.svg";
          const artName = art.name || "Artefatto";
          const artDesc = art.setBonus
            ? `Bonus 2pz: ${art.setBonus["2pc"]}\n\nBonus 4pz: ${art.setBonus["4pc"]}`
            : "";
          artifactsHTML += `
          <div class="artifact-chip">
            <img src="${imgSrc}" alt="${artName}" class="artifact-chip-img"
              style="width:20px;height:20px;border-radius:4px;object-fit:cover;cursor:pointer;"
              onclick="openMaterialImagePopup(${JSON.stringify(
                imgSrc
              )}, ${JSON.stringify(artName)}, ${JSON.stringify(artDesc)})">
            <span>${artName}</span>
          </div>
        `;
        }
        artifactsHTML += `</div></div>`;
      }

      // Se è una task di tipo farming con materiali selezionati, mostra i materiali
      let materialsHTML = "";
      if (
        task.category === "farming" &&
        Array.isArray(task.selectedMaterials) &&
        task.selectedMaterials.length > 0
      ) {
        materialsHTML = `<div class="task-artifacts" style="margin:0.8rem 0;">
        <div class="artifacts-label">Materiali da farmare:</div>
        <div class="artifacts-list">`;
        for (const material of task.selectedMaterials) {
          const imgSrc =
            material.immagine ||
            material.image ||
            "images/characters/placeholder.svg";
          const matName = material.name || material.nome || "Materiale";
          const matDesc = material.description || material.descrizione || "";
          // Usa JSON.stringify per passare i parametri in modo sicuro
          materialsHTML += `
          <div class="artifact-chip">
            <img src="${imgSrc}" alt="${matName}" class="artifact-chip-img"
              style="width:20px;height:20px;border-radius:4px;object-fit:cover;cursor:pointer;"
              onclick="openMaterialImagePopup(${JSON.stringify(
                imgSrc
              )}, ${JSON.stringify(matName)}, ${JSON.stringify(matDesc)})">
            <span>${matName}</span>
          </div>
        `;
        }
        materialsHTML += `</div></div>`;
      }

      // Se è una task normale con immagini selezionate, mostra le immagini
      let imagesHTML = "";
      if (
        Array.isArray(task.selectedImages) &&
        task.selectedImages.length > 0
      ) {
        imagesHTML = `<div class="task-artifacts" style="margin:0.8rem 0;">
        <div class="artifacts-label">Immagini associate:</div>
        <div class="artifacts-list">`;
        for (const image of task.selectedImages) {
          const imgSrc = image.image || "images/characters/placeholder.svg";
          const imgName = image.name || "Immagine";
          const imgDesc = image.descrizione || "";
          // Usa JSON.stringify per passare i parametri in modo sicuro
          imagesHTML += `
          <div class="artifact-chip">
            <img src="${imgSrc}" alt="${imgName}" class="artifact-chip-img"
              style="width:20px;height:20px;border-radius:4px;object-fit:cover;cursor:pointer;"
              onclick="openMaterialImagePopup(${JSON.stringify(
                imgSrc
              )}, ${JSON.stringify(imgName)}, ${JSON.stringify(imgDesc)})">
            <span>${imgName}</span>
          </div>
        `;
        }
        imagesHTML += `</div></div>`;
      }

      tasksHTML += `
            <div class="task-item ${task.status}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-priority">${
                      priorityColors[task.priority]
                    }</div>
                    <div class="task-category">${
                      categoryIcons[task.category]
                    }</div>
                    <div class="task-title">${task.title}</div>
                </div>
                ${artifactToCreateHTML}
                ${artifactsHTML}
                ${materialsHTML}
                ${imagesHTML}
                ${
                  task.notes
                    ? `<div class="task-notes">${task.notes}</div>`
                    : ""
                }
                ${
                  task.time
                    ? `<div class="task-time"><span>🕒</span> ${task.time}</div>`
                    : ""
                }
                <div class="task-actions">
                    <button class="btn-small" onclick="toggleTaskStatus('${
                      task.id
                    }')">${
        statusIcons[task.status] === "✅"
          ? "Segna come Incompleta"
          : "Segna Completata"
      }</button>
                    <button class="btn-small btn-secondary" onclick="editTask('${
                      task.id
                    }')">Modifica</button>
                    <button class="btn-small btn-danger" onclick="deleteTaskById('${
                      task.id
                    }')">Elimina</button>
                </div>
            </div>
        `;
    });

    tasksList.innerHTML = tasksHTML;
  } catch (error) {
    console.error("Errore durante il rendering delle attività:", error);
    const tasksList = document.getElementById("tasksList");
    if (tasksList) {
      tasksList.innerHTML = `
        <div class="no-tasks">
          <div class="no-tasks-icon">⚠️</div>
          <h4>Errore nel caricamento delle attività</h4>
          <p>Si è verificato un errore durante il caricamento delle attività. Ricarica la pagina.</p>
        </div>
      `;
    }
  }
}

// Cambia stato attività
function toggleTaskStatus(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  if (task.status === "completed") {
    task.status = "pending";
    task.completedAt = null;
  } else {
    task.status = "completed";
    task.completedAt = new Date().toISOString();
  }

  saveCalendarData();
  renderTasks();
  renderCalendar();
  updateStats();

  showNotification(
    `Attività ${task.status === "completed" ? "completata" : "ripristinata"}! ${
      task.status === "completed" ? "✅" : "⏳"
    }`
  );
}

// Modifica attività
function editTask(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  currentEditingTask = task;

  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskCategory").value = task.category;
  document.getElementById("editTaskPriority").value = task.priority;
  document.getElementById("editTaskNotes").value = task.notes || "";
  document.getElementById("editTaskTime").value = task.time || "";

  // Carica le immagini esistenti se presenti
  if (task.selectedImages && Array.isArray(task.selectedImages)) {
    selectedTaskImages = [...task.selectedImages];
    const imageNames = selectedTaskImages.map((img) => img.name).join(", ");
    document.getElementById("editTaskImagesInput").value = imageNames;
    updateEditTaskImagesContainer();
  } else {
    selectedTaskImages = [];
    document.getElementById("editTaskImagesInput").value = "";
    document.getElementById("editTaskImagesContainer").innerHTML = "";
  }

  document.getElementById("taskDetailPopup").style.display = "flex";
}

// Salva modifiche attività
function saveTaskChanges() {
  if (!currentEditingTask) return;

  currentEditingTask.title = document
    .getElementById("editTaskTitle")
    .value.trim();
  currentEditingTask.category =
    document.getElementById("editTaskCategory").value;
  currentEditingTask.priority =
    document.getElementById("editTaskPriority").value;
  currentEditingTask.notes = document
    .getElementById("editTaskNotes")
    .value.trim();
  currentEditingTask.time = document.getElementById("editTaskTime").value;

  // Salva le immagini selezionate
  if (selectedTaskImages && selectedTaskImages.length > 0) {
    currentEditingTask.selectedImages = selectedTaskImages;
  } else {
    delete currentEditingTask.selectedImages;
  }

  if (!currentEditingTask.title) {
    showNotification("Il titolo non può essere vuoto! ⚠️");
    return;
  }

  saveCalendarData();
  renderTasks();
  renderCalendar();
  updateStats();
  closeTaskDetail();

  showNotification("Attività modificata con successo! ✏️");
}

// Elimina attività
function deleteTask() {
  if (!currentEditingTask) return;

  if (confirm("Sei sicuro di voler eliminare questa attività?")) {
    deleteTaskById(currentEditingTask.id);
    closeTaskDetail();
  }
}

function deleteTaskById(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  const dateKey = formatDateKey(selectedDate);
  if (tasks[dateKey]) {
    tasks[dateKey] = tasks[dateKey].filter((t) => t.id !== taskId);
    if (tasks[dateKey].length === 0) {
      delete tasks[dateKey];
    }
  }

  saveCalendarData();
  renderTasks();
  renderCalendar();
  updateStats();

  showNotification("Attività eliminata! 🗑️");
}

// Chiudi popup dettagli
function closeTaskDetail() {
  document.getElementById("taskDetailPopup").style.display = "none";
  currentEditingTask = null;
}

// ===== FILTRI E STATISTICHE =====

// Filtra attività
function filterTasks() {
  const categoryFilter = document.getElementById("taskCategoryFilter").value;
  const statusFilter = document.getElementById("taskStatusFilter").value;

  const taskItems = document.querySelectorAll(".task-item");

  taskItems.forEach((item) => {
    const taskId = item.dataset.taskId;
    const task = findTaskById(taskId);

    const categoryMatch = !categoryFilter || task.category === categoryFilter;
    const statusMatch = !statusFilter || task.status === statusFilter;

    item.style.display = categoryMatch && statusMatch ? "block" : "none";
  });
}

// Reset filtri
function resetTaskFilters() {
  document.getElementById("taskCategoryFilter").value = "";
  document.getElementById("taskStatusFilter").value = "";
  filterTasks();
}

// Aggiorna statistiche
function updateStats() {
  const today = new Date();
  const todayTasks = getTasksForDate(today);
  const completedToday = todayTasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalToday = todayTasks.length;

  // Statistiche per la data selezionata
  const selectedTasks = getTasksForDate(selectedDate);
  const completedSelected = selectedTasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalSelected = selectedTasks.length;

  // Controlla se gli elementi HTML esistono
  const completedTasksElement = document.getElementById("completedTasks");
  const totalTasksElement = document.getElementById("totalTasks");
  const completionRateElement = document.getElementById("completionRate");
  const streakDaysElement = document.getElementById("streakDays");

  if (
    !completedTasksElement ||
    !totalTasksElement ||
    !completionRateElement ||
    !streakDaysElement
  ) {
    return; // Gli elementi non sono ancora disponibili
  }

  // SEMPRE mostra le statistiche per la data selezionata
  completedTasksElement.textContent = completedSelected;
  totalTasksElement.textContent = totalSelected;
  completionRateElement.textContent =
    totalSelected > 0
      ? Math.round((completedSelected / totalSelected) * 100) + "%"
      : "0%";

  // Calcola streak (sempre basato su oggi)
  let streak = 0;
  let currentDate = new Date();
  while (true) {
    const dayTasks = getTasksForDate(currentDate);
    const completedTasks = dayTasks.filter(
      (task) => task.status === "completed"
    );
    if (dayTasks.length > 0 && completedTasks.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  streakDaysElement.textContent = streak;
}

// ===== AZIONI GLOBALI =====

// Segna tutto completato
function markAllCompleted() {
  const dayTasks = getTasksForDate(selectedDate);
  dayTasks.forEach((task) => {
    if (task.status !== "completed") {
      task.status = "completed";
      task.completedAt = new Date().toISOString();
    }
  });

  saveCalendarData();
  renderTasks();
  renderCalendar();
  updateStats();

  showNotification("Tutte le attività segnate come completate! ✅");
}

// Cancella tutte le attività
function clearAllTasks() {
  if (
    confirm("Sei sicuro di voler cancellare tutte le attività di questa data?")
  ) {
    const dateKey = formatDateKey(selectedDate);
    delete tasks[dateKey];

    saveCalendarData();
    renderTasks();
    renderCalendar();
    updateStats();

    showNotification("Tutte le attività cancellate! 🗑️");
  }
}

// Esporta dati
function exportCalendarData() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `genshin_calendar_${
    new Date().toISOString().split("T")[0]
  }.json`;
  a.click();

  URL.revokeObjectURL(url);
  showNotification("Dati calendario esportati! 📤");
}

// Importa dati
function importCalendarData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const importedTasks = JSON.parse(e.target.result);
          tasks = { ...tasks, ...importedTasks };
          saveCalendarData();
          renderTasks();
          renderCalendar();
          updateStats();
          showNotification("Dati calendario importati con successo! 📥");
        } catch (error) {
          showNotification("Errore nell'importazione del file! ❌");
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// Genera report settimanale
function generateWeeklyReport() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  let report = "📊 Report Settimanale\n\n";
  let totalTasks = 0;
  let completedTasks = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const dayTasks = getTasksForDate(date);
    const dayCompleted = dayTasks.filter(
      (task) => task.status === "completed"
    ).length;

    totalTasks += dayTasks.length;
    completedTasks += dayCompleted;

    const dayName = [
      "Domenica",
      "Lunedì",
      "Martedì",
      "Mercoledì",
      "Giovedì",
      "Venerdì",
      "Sabato",
    ][date.getDay()];
    report += `${dayName}: ${dayCompleted}/${dayTasks.length} completate\n`;
  }

  report += `\nTotale: ${completedTasks}/${totalTasks} (${Math.round(
    (completedTasks / totalTasks) * 100
  )}%)`;

  alert(report);
}

// ===== UTILITY FUNCTIONS =====

// Genera ID univoco per attività
function generateTaskId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formatta chiave data
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Ottieni attività per data
function getTasksForDate(date) {
  const dateKey = formatDateKey(date);
  console.log("getTasksForDate - Chiave data:", dateKey);
  console.log("getTasksForDate - Tutte le attività:", tasks);
  console.log(
    "getTasksForDate - Attività per questa data:",
    tasks[dateKey] || []
  );
  return tasks[dateKey] || [];
}

// Aggiungi attività a data
function addTaskToDate(date, task) {
  const dateKey = formatDateKey(date);
  console.log("addTaskToDate - Chiave data:", dateKey);
  console.log(
    "addTaskToDate - Attività esistenti prima:",
    tasks[dateKey] || []
  );

  if (!tasks[dateKey]) {
    tasks[dateKey] = [];
  }
  tasks[dateKey].push(task);

  console.log("addTaskToDate - Attività dopo aggiunta:", tasks[dateKey]);

  saveCalendarData();

  console.log(
    "addTaskToDate - Dati salvati, verifica:",
    JSON.parse(localStorage.getItem("genshinCalendar"))
  );
}

// Trova attività per ID
function findTaskById(taskId) {
  for (const dateKey in tasks) {
    const task = tasks[dateKey].find((t) => t.id === taskId);
    if (task) return task;
  }
  return null;
}

// Confronta date
function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

// Aggiorna indicatori UI
function updateTodayIndicator() {
  const today = new Date();
  const months = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ];
  document.getElementById("todayDate").textContent = `${today.getDate()} ${
    months[today.getMonth()]
  }`;
}

function updateSelectedDateDisplay() {
  const months = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const dayNames = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];

  const isToday = isSameDay(selectedDate, new Date());
  const displayText = isToday
    ? "Oggi"
    : `${dayNames[selectedDate.getDay()]} ${selectedDate.getDate()} ${
        months[selectedDate.getMonth()]
      }`;

  document.getElementById("selectedDate").textContent = displayText;
}

// Pulisci form nuova attività
function clearNewTaskForm() {
  document.getElementById("newTaskTitle").value = "";
  document.getElementById("newTaskCategory").value = "daily";
  document.getElementById("newTaskPriority").value = "medium";
  document.getElementById("newTaskNotes").value = "";
  document.getElementById("newTaskTime").value = "";

  // Pulisci anche le immagini
  selectedTaskImages = [];
  document.getElementById("newTaskImagesInput").value = "";
  document.getElementById("newTaskImagesContainer").innerHTML = "";
}

// ===== PERSISTENZA DATI =====

// Salva dati calendario
function saveCalendarData() {
  localStorage.setItem(
    getUserStorageKey("calendarioData"),
    JSON.stringify(tasks)
  );
}

// Carica dati calendario
function loadCalendarData() {
  const data = localStorage.getItem(getUserStorageKey("calendarioData"));
  if (data) {
    tasks = JSON.parse(data);
  } else {
    tasks = {};
  }
  renderTasks();
  renderCalendar();
}

// Migra le vecchie chiavi di data dal formato ISO al formato locale
function migrateOldDateKeys() {
  const newTasks = {};
  let hasChanges = false;

  for (const dateKey in tasks) {
    // Se la chiave è nel formato ISO (contiene T o Z), convertila
    if (dateKey.includes("T") || dateKey.includes("Z")) {
      try {
        const date = new Date(dateKey);
        const newKey = formatDateKey(date);
        newTasks[newKey] = tasks[dateKey];
        hasChanges = true;
        console.log(`Migrazione: ${dateKey} -> ${newKey}`);
      } catch (error) {
        console.error(
          `Errore nella migrazione della chiave ${dateKey}:`,
          error
        );
        // Mantieni la chiave originale se non può essere convertita
        newTasks[dateKey] = tasks[dateKey];
      }
    } else {
      // Mantieni le chiavi già nel formato corretto
      newTasks[dateKey] = tasks[dateKey];
    }
  }

  if (hasChanges) {
    tasks = newTasks;
    saveCalendarData();
    console.log("Migrazione completata");
  }
}

// ===== NOTIFICHE =====

// Mostra notifica
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-gold);
        color: #1a1a2e;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-heavy);
        z-index: 10000;
        font-weight: bold;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ===== GESTIONE ARTEFATTI =====

// Carica gli artefatti da artefatti.json
async function loadArtifacts() {
  try {
    const response = await fetch("artefatti.json");
    const data = await response.json();
    allArtifacts = data.artifacts || [];
    console.log("Artefatti caricati:", allArtifacts.length);
  } catch (error) {
    console.error("Errore nel caricamento degli artefatti:", error);
    allArtifacts = [];
  }
}

// Mostra la tabella degli artefatti per Artifact Farming
function showArtifactTable() {
  // Crea il popup per la selezione artefatti
  const popup = document.createElement("div");
  popup.id = "artifactSelectionPopup";
  popup.className = "popup-overlay";
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 3000;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
  `;

  popup.innerHTML = `
    <div class="artifact-popup" style="
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
      border-radius: 20px;
      padding: 2rem;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      border: 2px solid rgba(100, 255, 218, 0.3);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
      position: relative;
    ">
      <div class="popup-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(100, 255, 218, 0.3);
      ">
        <h3 style="color: #64ffda; margin: 0; font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">💎 Seleziona Artefatti da Farmare</h3>
        <button onclick="closeArtifactTable()" style="
          background: none;
          border: none;
          color: #64ffda;
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(100, 255, 218, 0.1)'" onmouseout="this.style.background='none'">×</button>
      </div>

      <div class="artifact-search" style="margin-bottom: 1rem;">
        <input type="text" id="artifactSearchInput" placeholder="Cerca artefatto..." style="
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 2px solid rgba(100, 255, 218, 0.3);
          background: rgba(10, 10, 26, 0.9);
          color: #e0e0e0;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        " onfocus="this.style.borderColor='#64ffda'; this.style.boxShadow='0 0 0 3px rgba(100, 255, 218, 0.2)'" onblur="this.style.borderColor='rgba(100, 255, 218, 0.3)'; this.style.boxShadow='none'">
      </div>

      <div class="artifact-gallery" id="artifactGallery" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
        max-height: 60vh;
        overflow-y: auto;
        padding: 1rem;
        background: rgba(10, 10, 26, 0.8);
        border-radius: 15px;
        border: 1px solid rgba(100, 255, 218, 0.2);
      "></div>

      <div class="selected-artifacts" style="margin-top: 1.5rem;">
        <h4 style="color: #64ffda; margin-bottom: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Artefatti Selezionati:</h4>
        <div id="selectedArtifactsList" style="
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          min-height: 50px;
          padding: 1rem;
          background: rgba(100, 255, 218, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(100, 255, 218, 0.3);
        "></div>
      </div>

      <div class="popup-actions" style="
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 2px solid rgba(100, 255, 218, 0.3);
      ">
        <button onclick="confirmArtifactSelection()" style="
          background: linear-gradient(135deg, #64ffda, #00d4aa);
          color: #16213e;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          ✅ Conferma Selezione
        </button>
        <button onclick="closeArtifactTable()" style="
          background: rgba(255, 255, 255, 0.1);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.8rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
          ❌ Annulla
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  renderArtifactGallery();
  setupArtifactSearch();
}

// Renderizza la galleria degli artefatti
function renderArtifactGallery() {
  const gallery = document.getElementById("artifactGallery");
  if (!gallery) return;

  gallery.innerHTML = "";

  let filteredArtifacts = allArtifacts;
  if (currentArtifactSearch.trim() !== "") {
    const searchLower = currentArtifactSearch.trim().toLowerCase();
    filteredArtifacts = allArtifacts.filter(
      (art) => art.name && art.name.toLowerCase().includes(searchLower)
    );
  }

  if (filteredArtifacts.length === 0) {
    gallery.innerHTML =
      '<div style="color: #ff6f3c; text-align: center; grid-column: 1 / -1;">Nessun artefatto trovato.</div>';
    return;
  }

  filteredArtifacts.forEach((art) => {
    const card = document.createElement("div");
    card.className = "artifact-item";
    card.style.cssText = `
      background: linear-gradient(135deg, rgba(10, 10, 26, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    const isSelected = selectedArtifacts.some(
      (selected) => selected.name === art.name
    );
    if (isSelected) {
      card.style.borderColor = "#64ffda";
      card.style.boxShadow =
        "0 0 12px rgba(100, 255, 218, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)";
      card.style.background =
        "linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(22, 33, 62, 0.9) 100%)";
    }

    card.innerHTML = `
      <img src="${art.image}" alt="${art.name}" 
           class="artifact-image" 
           onerror="this.src='images/characters/placeholder.svg'"
           title="Clicca per vedere la descrizione e l'immagine in grande"
           style="cursor: pointer;">
      <div class="artifact-info">
        <div class="artifact-name">${art.name}</div>
        <div style="margin: 0.3em 0 0.5em 0;">
          <a href="#" class="artifact-desc-link" style="color:#64ffda;font-size:0.95em;text-decoration:underline;cursor:pointer;" onclick="event.stopPropagation(); openArtifactDescriptionModal(${JSON.stringify(
            art
          ).replace(/"/g, "&quot;")}); return false;">Leggi descrizione</a>
        </div>
        <div class="artifact-details">
          <span class="artifact-slot">${art.slot || ""}</span>
          <span class="artifact-set">${art.set || ""}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => toggleArtifactSelection(art));
    card.addEventListener("mouseenter", () => {
      if (!isSelected) {
        card.style.borderColor = "#00bcd4";
        card.style.transform = "translateY(-2px)";
        card.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
      }
    });
    card.addEventListener("mouseleave", () => {
      if (!isSelected) {
        card.style.borderColor = "transparent";
        card.style.transform = "translateY(0)";
        card.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
      }
    });

    gallery.appendChild(card);
  });
}

// Toggle selezione artefatto
function toggleArtifactSelection(artifact) {
  const index = selectedArtifacts.findIndex(
    (art) => art.name === artifact.name
  );

  if (index > -1) {
    selectedArtifacts.splice(index, 1);
  } else {
    selectedArtifacts.push(artifact);
  }

  renderArtifactGallery();
  renderSelectedArtifacts();
}

// Renderizza gli artefatti selezionati
function renderSelectedArtifacts() {
  const selectedList = document.getElementById("selectedArtifactsList");

  // Funzione di escape per apici singoli e doppi
  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/\"/g, '\\"');
  }

  if (selectedArtifacts.length === 0) {
    selectedList.innerHTML = "";
    return;
  }

  let selectedHTML = "";

  selectedArtifacts.forEach((artifact) => {
    let artifactDescription;
    if (
      artifact.setBonus &&
      artifact.setBonus["2pc"] &&
      artifact.setBonus["4pc"]
    ) {
      artifactDescription =
        "Bonus 2pz: " +
        artifact.setBonus["2pc"] +
        "\\n\\nBonus 4pz: " +
        artifact.setBonus["4pc"];
    } else {
      artifactDescription = "Nessuna descrizione disponibile";
    }
    selectedHTML += `
      <div class="selected-artifact-chip">
        <img src="${artifact.image}" alt="${artifact.name}" 
             onerror="this.style.display='none'"
             onclick="openMaterialImagePopup(${JSON.stringify(
               artifact.image
             )}, ${JSON.stringify(artifact.name)}, ${JSON.stringify(
      escapeQuotes(artifactDescription)
    )})"
             title="Clicca per vedere la descrizione e l'immagine in grande"
             style="cursor: pointer;">
        <span>${artifact.name}</span>
        <button class="remove-artifact" onclick="removeSelectedArtifact(${JSON.stringify(
          artifact.name
        )})">×</button>
      </div>
    `;
  });

  selectedList.innerHTML = selectedHTML;
}
