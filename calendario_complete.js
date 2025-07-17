// Calendario Genshin Impact - Versione Completa
console.log("Calendario completo caricato!");

// Variabili globali
let currentDate = new Date();
let selectedDate = new Date();
let tasks =
  JSON.parse(localStorage.getItem(getUserStorageKey("calendarTasks"))) || {};
let selectedArtifactToCreate = null;
let selectedMaterials = [];
let selectedTaskImages = [];
let allArtifacts = []; // Array per tutti gli artefatti

// Variabili per il farming di materiali
let allMaterials = {};
let currentFarmingSearch = "";
let currentFarmingCategoryFilter = "";
let currentFarmingRarityFilter = "";
let currentFarmingElementFilter = "";

// Funzione per gestire il cambio di rarità (chiamata dall'HTML)
function handleRarityChange(value) {
  console.log("🎯 handleRarityChange chiamata con valore:", value);
  currentFarmingRarityFilter = value;

  // Mostra/nascondi il filtro elementi in base alla rarità selezionata
  const elementFilter = document.getElementById("farmingElementFilter");
  if (elementFilter) {
    if (value && value !== "") {
      console.log("🔥 Mostrando filtro elementi");
      elementFilter.style.display = "block";
    } else {
      console.log("❌ Nascondendo filtro elementi");
      elementFilter.style.display = "none";
      elementFilter.value = "";
      currentFarmingElementFilter = "";
    }
  }

  renderMaterialsGallery();
}

// Funzione per gestire il cambio di elemento (chiamata dall'HTML)
function handleElementChange(value) {
  console.log("🔥 handleElementChange chiamata con valore:", value);
  currentFarmingElementFilter = value;
  renderMaterialsGallery();
}

// Funzione per pulire tutti i filtri del farming
function clearFarmingFilters() {
  console.log("🧹 Pulizia filtri farming...");

  // Controlla se ci sono filtri attivi
  const searchInput = document.getElementById("farmingSearchInput");
  const categoryFilter = document.getElementById("farmingCategoryFilter");
  const rarityFilter = document.getElementById("farmingRarityFilter");
  const elementFilter = document.getElementById("farmingElementFilter");

  const hasActiveFilters =
    (searchInput && searchInput.value.trim() !== "") ||
    (categoryFilter && categoryFilter.value !== "") ||
    (rarityFilter && rarityFilter.value !== "") ||
    (elementFilter && elementFilter.value !== "");

  if (!hasActiveFilters) {
    // Mostra messaggio se non ci sono filtri attivi
    showCustomConfirm(
      "Non hai ancora selezionato alcun filtro. Sceglierne uno?",
      function () {
        // Callback vuoto, solo per chiudere il popup
      }
    );
    return;
  }

  // Reset delle variabili globali
  currentFarmingSearch = "";
  currentFarmingCategoryFilter = "";
  currentFarmingRarityFilter = "";
  currentFarmingElementFilter = "";

  // Reset dei campi HTML
  if (searchInput) searchInput.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (rarityFilter) rarityFilter.value = "";
  if (elementFilter) {
    elementFilter.value = "";
    // Nascondi il filtro elementi
    elementFilter.style.display = "none";
  }

  // Ricarica la galleria
  renderMaterialsGallery();

  console.log("✅ Filtri farming puliti");
}

// Funzione per pulire i filtri del modal immagini attività
function clearTaskImagesFilters() {
  console.log("🧹 Pulizia filtri immagini attività...");

  // Controlla se ci sono filtri attivi
  const searchInput = document.getElementById("taskImagesSearchInput");
  const categoryFilter = document.getElementById("taskImagesCategoryFilter");
  const rarityFilter = document.getElementById("taskImagesRarityFilter");

  const hasActiveFilters =
    (searchInput && searchInput.value.trim() !== "") ||
    (categoryFilter && categoryFilter.value !== "") ||
    (rarityFilter && rarityFilter.value !== "");

  if (!hasActiveFilters) {
    // Mostra messaggio se non ci sono filtri attivi
    showCustomConfirm(
      "Non hai ancora selezionato alcun filtro. Sceglierne uno?",
      function () {
        // Callback vuoto, solo per chiudere il popup
      }
    );
    return;
  }

  // Reset della ricerca
  currentTaskImagesSearch = "";

  // Reset dei campi HTML
  if (searchInput) searchInput.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (rarityFilter) rarityFilter.value = "";

  // Ricarica la galleria
  renderTaskImagesGallery();

  console.log("✅ Filtri immagini attività puliti");
}

// Variabili per il farming di artefatti
let selectedArtifacts = [];
let currentArtifactSearch = "";

// Variabile globale per la ricerca nel modal selezione manufatti
let currentArtifactToCreateSearch = "";

// Variabile globale per la ricerca immagini attività
let currentTaskImagesSearch = "";

// Funzioni di utilità
function formatDate(date) {
  const options = { year: "numeric", month: "long" };
  return date.toLocaleDateString("it-IT", options);
}

function formatDateShort(date) {
  const options = { day: "numeric", month: "short" };
  return date.toLocaleDateString("it-IT", options);
}

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

// === GESTIONE UTENTE E LOGIN ===
function getCurrentUser() {
  return localStorage.getItem("user") || "guest";
}

function getUserStorageKey(baseKey) {
  return getCurrentUser() + "_" + baseKey;
}

function isLoggedIn() {
  return !!localStorage.getItem("user");
}

function logoutUser() {
  localStorage.removeItem("user");
  renderUserControls();
  location.reload();
}

function renderUserControls() {
  const controls = document.getElementById("user-controls");
  if (!controls) return;
  controls.innerHTML = "";
  if (isLoggedIn()) {
    controls.innerHTML = `<span style="color:#64ffda;font-weight:600;">👤 ${getCurrentUser()}</span><button class="btn" onclick="logoutUser()">Logout</button>`;
  } else {
    controls.innerHTML = `<a href="login.html" class="btn">Login</a><a href="registrazione.html" class="btn btn-secondary">Registrati</a>`;
  }
}

window.logoutUser = logoutUser;
window.renderUserControls = renderUserControls;
window.isLoggedIn = isLoggedIn;

// Funzioni per il calendario
function initializeCalendar() {
  updateCalendarDisplay();
  updateStats();
  loadTasksForDate(selectedDate);
}

function updateCalendarDisplay() {
  const monthYear = formatDate(currentDate);
  document.getElementById("currentMonthYear").textContent = monthYear;

  const today = new Date();
  document.getElementById("todayDate").textContent = formatDateShort(today);

  renderCalendar();
}

function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  calendarDays.innerHTML = "";

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

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";

    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();

    if (!isCurrentMonth) dayElement.classList.add("other-month");
    if (isToday) dayElement.classList.add("today");
    if (isSelected) dayElement.classList.add("selected");

    dayElement.innerHTML =
      '<span class="day-number">' + date.getDate() + "</span>";

    // Aggiungi indicatori per le attività
    const dateKey = getDateKey(date);
    const dayTasks = tasks[dateKey] || [];
    const completedTasks = dayTasks.filter(
      (task) => task.status === "completed"
    ).length;

    if (dayTasks.length > 0) {
      const taskIndicator = document.createElement("div");
      taskIndicator.className = "task-indicator";
      taskIndicator.innerHTML =
        '<span class="task-count">' + dayTasks.length + "</span>";
      if (completedTasks > 0) {
        taskIndicator.innerHTML +=
          '<span class="completed-count">' + completedTasks + "</span>";
      }
      dayElement.appendChild(taskIndicator);
    }

    dayElement.addEventListener("click", () => selectDate(date));
    calendarDays.appendChild(dayElement);
  }
}

function selectDate(date) {
  // Normalizza la data selezionata a mezzanotte
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  updateSelectedDateDisplay();
  loadTasksForDate(selectedDate);
  renderCalendar();
  updateStats();
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendarDisplay();
  updateStats();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendarDisplay();
  updateStats();
}

// Funzioni per le attività
function loadTasksForDate(date) {
  const dateKey = getDateKey(date);
  const dayTasks = tasks[dateKey] || [];
  renderTasks(dayTasks);
  updateStats(); // Aggiorna sempre le statistiche dopo ogni caricamento
}

function renderTasks(tasksList) {
  const tasksContainer = document.getElementById("tasksList");
  tasksContainer.innerHTML = "";

  if (tasksList.length === 0) {
    tasksContainer.innerHTML =
      '<div class="no-tasks"><div class="no-tasks-icon">📝</div><h4>Nessuna attività</h4><p>Non ci sono attività programmate per questa data.</p></div>';
    return;
  }

  tasksList.forEach((task, index) => {
    const taskElement = createTaskElement(task, index);
    tasksContainer.appendChild(taskElement);
  });
}

function createTaskElement(task, index) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-item";
  if (task.status === "completed") taskDiv.classList.add("completed");

  const priorityColors = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336",
    critical: "#9c27b0",
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

  // Fallback robusto per mostrare le immagini dei manufatti nelle attività di tipo farming
  let artifactsToShow = [];
  if (task.category === "farming") {
    if (Array.isArray(task.artifacts) && task.artifacts.length > 0) {
      artifactsToShow = task.artifacts;
      console.log(
        "🔍 DEBUG: createTaskElement - task.artifacts trovati:",
        task.artifacts
      );
    } else if (Array.isArray(task.images) && task.images.length > 0) {
      artifactsToShow = task.images;
      console.log(
        "🔍 DEBUG: createTaskElement - task.images trovati:",
        task.images
      );
    }
  } else if (Array.isArray(task.artifacts) && task.artifacts.length > 0) {
    artifactsToShow = task.artifacts;
    console.log(
      "🔍 DEBUG: createTaskElement - task.artifacts trovati (non farming):",
      task.artifacts
    );
  }

  console.log(
    "🔍 DEBUG: createTaskElement - artifactsToShow =",
    artifactsToShow
  );

  let artifactsHtml = "";
  if (artifactsToShow.length === 1 && task.category === "farming") {
    // Un solo manufatto: mostra solo il nome accanto all'immagine
    const art = artifactsToShow[0];
    let description = "";
    if (art.setBonus && art.setBonus["2pc"] && art.setBonus["4pc"]) {
      console.log(
        "DEBUG ARTIFACT DESCR:",
        art.name,
        "| 2pc:",
        art.setBonus["2pc"],
        "| 4pc:",
        art.setBonus["4pc"]
      );
      description = `Bonus 2pz: ${art.setBonus["2pc"]}. Bonus 4pz: ${art.setBonus["4pc"]}`;
    } else if (art.setBonus && art.setBonus["2pc"]) {
      description = `Bonus 2pz: ${art.setBonus["2pc"]}`;
    } else {
      description = art.name || "Manufatto selezionato";
    }
    artifactsHtml = `<div class='task-artifacts'><div class='artifacts-label'>Manufatto:</div><div class='artifacts-list'><div class='selected-material-chip' style='background: #222;'><img src='${
      art.image || art.immagine || "images/characters/placeholder.svg"
    }' alt='${
      art.name
    }' style='width:24px;height:24px;border-radius:4px;object-fit:cover;border:1px solid rgba(100,255,218,0.3);background:#222;display:block;margin-right:0.5em;cursor:pointer;' onclick="openMaterialImagePopup('${
      art.image || art.immagine || "images/characters/placeholder.svg"
    }', '${art.name}', '${description.replace(
      /'/g,
      "\\'"
    )}')"><span style='color: #e0e0e0; flex: 1;'>${
      art.name
    }</span></div></div></div>`;
  } else if (artifactsToShow.length > 0) {
    // Più manufatti: elenco classico
    artifactsHtml =
      '<div class="task-artifacts"><div class="artifacts-label">Manufatti:</div><div class="artifacts-list">';
    artifactsToShow.forEach(function (artifact) {
      let description = "";
      if (
        artifact.setBonus &&
        artifact.setBonus["2pc"] &&
        artifact.setBonus["4pc"]
      ) {
        description =
          "Bonus 2pz: " +
          artifact.setBonus["2pc"] +
          ". Bonus 4pz: " +
          artifact.setBonus["4pc"];
      } else {
        description = "Nessuna descrizione disponibile";
      }
      const safeDescription = description.replace(/'/g, "\\'");
      artifactsHtml += `<div class="selected-material-chip" style='background: #222;'><img src="${
        artifact.image ||
        artifact.immagine ||
        "images/characters/placeholder.svg"
      }" alt="${
        artifact.name
      }" style='width:24px;height:24px;border-radius:4px;object-fit:cover;border:1px solid rgba(100,255,218,0.3);background:#222;display:block;margin-right:0.5em;cursor:pointer;' onclick="openMaterialImagePopup('${
        artifact.image ||
        artifact.immagine ||
        "images/characters/placeholder.svg"
      }', '${
        artifact.name
      }', '${safeDescription}')"><span style='color: #e0e0e0; flex: 1;'>${
        artifact.name
      }</span></div>`;
    });
    artifactsHtml += "</div></div>";
  }

  // Se attività di farming e un solo manufatto, usa la descrizione dettagliata anche nelle note
  let notesToShow = task.notes;
  if (task.category === "farming" && artifactsToShow.length === 1) {
    const art = artifactsToShow[0];
    let description = "";
    if (art.setBonus && art.setBonus["2pc"] && art.setBonus["4pc"]) {
      console.log(
        "DEBUG ARTIFACT DESCR:",
        art.name,
        "| 2pc:",
        art.setBonus["2pc"],
        "| 4pc:",
        art.setBonus["4pc"]
      );
      description = `Bonus 2pz: ${art.setBonus["2pc"]}. Bonus 4pz: ${art.setBonus["4pc"]}`;
    } else if (art.setBonus && art.setBonus["2pc"]) {
      description = `Bonus 2pz: ${art.setBonus["2pc"]}`;
    } else {
      description = art.name || "Manufatto selezionato";
    }
    notesToShow = `${art.name} - ${description}`;
  }

  // Se è una task di material farming, mostra le immagini dei materiali
  let materialsHtml = "";
  if (
    task.category === "farming" &&
    Array.isArray(task.materials) &&
    task.materials.length > 0
  ) {
    materialsHtml = `<div class='task-artifacts'><div class='artifacts-label'>Materiali:</div><div class='artifacts-list'>`;
    task.materials.forEach(function (mat) {
      materialsHtml += `<div class='selected-material-chip' style='background: #222;'>
        <img class='material-img-in-task' src='${
          mat.image || mat.immagine || "images/characters/placeholder.svg"
        }' alt='${mat.name}'
          data-name="${mat.name
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")}"
          data-img="${(
            mat.image ||
            mat.immagine ||
            "images/characters/placeholder.svg"
          )
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")}"
          data-desc="${(mat.descrizione || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")}"
          style='width:24px;height:24px;border-radius:4px;object-fit:cover;border:1px solid rgba(100,255,218,0.3);background:#222;display:block;margin-right:0.5em;cursor:pointer;'>
        <span style='color: #e0e0e0; flex: 1;'>${mat.name}</span>
      </div>`;
    });
    materialsHtml += `</div></div>`;
  }

  // Dopo aver inserito l'HTML della task, aggiungi l'event listener
  setTimeout(() => {
    document.querySelectorAll(".material-img-in-task").forEach((img) => {
      img.addEventListener("click", function () {
        const name = this.getAttribute("data-name");
        const imgUrl = this.getAttribute("data-img");
        const desc = this.getAttribute("data-desc");
        console.log("CLICK IMG MATERIAL:", name, imgUrl, desc);
        openMaterialImagePopup(imgUrl, name, desc);
      });
    });
  }, 0);

  taskDiv.innerHTML = `
    <div class="task-header">
      <span class="task-priority" style="background: ${
        priorityColors[task.priority]
      }">${task.priority.toUpperCase()}</span>
      <span class="task-category">${
        categoryIcons[task.category]
      } ${task.category.toUpperCase()}</span>
      <span class="task-status">${task.status === "completed" ? "✅" : "⏳"} ${
    task.status === "completed" ? "COMPLETATO" : "IN ATTESA"
  }</span>
      <h4 class="task-title">${task.title}</h4>
    </div>
    ${notesToShow ? '<div class="task-notes">' + notesToShow + "</div>" : ""}
    ${task.time ? '<div class="task-time">🕐 ' + task.time + "</div>" : ""}
    ${materialsHtml}
    ${artifactsHtml}
    <div class="task-actions">
      <button class="btn-small" onclick="toggleTaskStatus(${index})">${
    task.status === "completed" ? "↩️ Ripristina" : "✅ Completa"
  }</button>
      <button class="btn-small btn-secondary" onclick="editTask(${index})">✏️ Modifica</button>
      <button class="btn-small btn-danger" onclick="deleteTask(${index})">🗑️ Elimina</button>
    </div>
  `;

  return taskDiv;
}

function addNewTask() {
  const title = document.getElementById("newTaskTitle").value.trim();
  const category = document.getElementById("newTaskCategory").value;
  const priority = document.getElementById("newTaskPriority").value;
  const notes = document.getElementById("newTaskNotes").value.trim();
  const time = document.getElementById("newTaskTime").value;

  if (!title) {
    alert("Inserisci un titolo per l'attività");
    return;
  }

  const task = {
    title,
    category,
    priority,
    notes,
    time,
    status: "pending",
    artifacts: selectedTaskImages,
  };

  const dateKey = getDateKey(selectedDate);
  if (!tasks[dateKey]) tasks[dateKey] = [];
  tasks[dateKey].push(task);

  saveTasks();
  loadTasksForDate(selectedDate);
  updateStats();
  expandDailyTasksAuto();

  // Reset form
  document.getElementById("newTaskTitle").value = "";
  document.getElementById("newTaskNotes").value = "";
  document.getElementById("newTaskTime").value = "";
  selectedTaskImages = [];
  document.getElementById("newTaskImagesInput").value = "";
  document.getElementById("newTaskImagesContainer").innerHTML = "";
}

function toggleTaskStatus(index) {
  const dateKey = getDateKey(selectedDate);
  const task = tasks[dateKey][index];
  task.status = task.status === "completed" ? "pending" : "completed";

  saveTasks();
  loadTasksForDate(selectedDate);
  updateStats();
}

function editTask(index) {
  const dateKey = getDateKey(selectedDate);
  const task = tasks[dateKey][index];

  // Se è una task di material farming (ha materials o materiali)
  if (task.category === "farming" && (task.materials || task.materiali)) {
    closeTaskDetail();
    window.selectedMaterialsFarming = (task.materials || task.materiali).map(
      (m) => ({
        name: m.name,
        immagine: m.image || m.immagine,
        descrizione: m.descrizione || "",
      })
    );
    window.editingMaterialTaskIndex = index; // <--- salvo l'indice
    showMaterialTable();
    return;
  }

  // Altrimenti comportamento classico
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDate").value = dateKey;
  document.getElementById("editTaskCategory").value = task.category;
  document.getElementById("editTaskPriority").value = task.priority;
  document.getElementById("editTaskNotes").value = task.notes || "";
  document.getElementById("editTaskTime").value = task.time || "";

  // Gestisci immagini
  selectedTaskImages = task.artifacts || [];
  updateEditTaskImagesDisplay();

  // Nascondi la sezione immagini associate se la categoria è 'daily'
  var editTaskImagesSection = document
    .getElementById("editTaskImagesInput")
    .closest(".form-group");
  if (task.category === "daily") {
    editTaskImagesSection.style.display = "none";
  } else {
    editTaskImagesSection.style.display = "";
  }

  document.getElementById("taskDetailPopup").style.display = "flex";
}

function saveTaskChanges() {
  const title = document.getElementById("editTaskTitle").value.trim();
  const dateKey = document.getElementById("editTaskDate").value;
  const category = document.getElementById("editTaskCategory").value;
  const priority = document.getElementById("editTaskPriority").value;
  const notes = document.getElementById("editTaskNotes").value.trim();
  const time = document.getElementById("editTaskTime").value;

  if (!title) {
    alert("Inserisci un titolo per l'attività");
    return;
  }

  // Trova l'attività da modificare
  const oldDateKey = getDateKey(selectedDate);
  const taskIndex = tasks[oldDateKey]
    ? tasks[oldDateKey].findIndex((t) => t.title === title)
    : -1;

  if (taskIndex !== -1) {
    const task = tasks[oldDateKey][taskIndex];
    task.title = title;
    task.category = category;
    task.priority = priority;
    task.notes = notes;
    task.time = time;
    task.artifacts = selectedTaskImages;

    // Se attività di farming e un solo manufatto, aggiorna le note con la descrizione dettagliata
    if (category === "farming" && selectedTaskImages.length === 1) {
      const art = selectedTaskImages[0];
      let description = "";
      if (art.setBonus && art.setBonus["2pc"] && art.setBonus["4pc"]) {
        console.log(
          "DEBUG ARTIFACT DESCR:",
          art.name,
          "| 2pc:",
          art.setBonus["2pc"],
          "| 4pc:",
          art.setBonus["4pc"]
        );
        description = `Bonus 2pz: ${art.setBonus["2pc"]}. Bonus 4pz: ${art.setBonus["4pc"]}`;
      } else if (art.setBonus && art.setBonus["2pc"]) {
        description = `Bonus 2pz: ${art.setBonus["2pc"]}`;
      } else {
        description = art.name || "Manufatto selezionato";
      }
      task.notes = `${art.name} - ${description}`;
    }

    // Se la data è cambiata, sposta l'attività
    if (dateKey !== oldDateKey) {
      tasks[oldDateKey].splice(taskIndex, 1);
      if (!tasks[dateKey]) tasks[dateKey] = [];
      tasks[dateKey].push(task);
    }

    saveTasks();
    loadTasksForDate(selectedDate);
    updateStats();
    expandDailyTasksAuto();
  }

  closeTaskDetail();
}

function deleteTask(index) {
  showCustomConfirm(
    "Sei sicuro di voler eliminare questa attività?",
    function (confirmed) {
      if (confirmed) {
        const dateKey = getDateKey(selectedDate);
        tasks[dateKey].splice(index, 1);
        saveTasks();
        loadTasksForDate(selectedDate);
        updateStats();
        renderCalendar(); // Aggiorna anche il calendario per i badge
      }
    }
  );
}

function closeTaskDetail() {
  document.getElementById("taskDetailPopup").style.display = "none";
}

// Funzioni per le statistiche
function updateStats() {
  // Usa la data selezionata invece di oggi
  const date = selectedDate || new Date();
  const dateKey = getDateKey(date);
  const dayTasks = tasks[dateKey] || [];

  const completedTasks = dayTasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalTasks = dayTasks.length;

  document.getElementById("completedTasks").textContent = completedTasks;
  document.getElementById("totalTasks").textContent = totalTasks;

  // Calcola streak (resta su oggi)
  let streak = 0;
  let currentDate = new Date();
  while (true) {
    const key = getDateKey(currentDate);
    const dayTasks = tasks[key] || [];
    const completedDayTasks = dayTasks.filter(
      (task) => task.status === "completed"
    ).length;
    if (dayTasks.length === 0 || completedDayTasks === 0) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  document.getElementById("streakDays").textContent = streak;

  // Calcola tasso di completamento
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById("completionRate").textContent = completionRate + "%";

  // Aggiorna il calendario per mostrare i nuovi indicatori
  renderCalendar();
}

// Funzioni per i template
function addTemplateTask(category, title, notes) {
  // Gestione speciale per Artifact Farming
  if (category === "farming" && title === "Artifact Farming") {
    console.log("Opening artifact table for:", title);
    showArtifactTable();
    return;
  }

  showTemplateTaskPopup(category, title, notes);
}

// Modifica showTemplateTaskPopup per accettare un indice opzionale
function showTemplateTaskPopup(category, title, notes, artifacts, index) {
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

  // Salva gli artefatti selezionati temporaneamente
  window.templateTaskArtifacts = artifacts || [];

  // Salva l'indice della task in modifica (se fornito)
  if (typeof index === "number") {
    window.editingTemplateTaskIndex = index;
  } else {
    window.editingTemplateTaskIndex = undefined;
  }

  document.getElementById("templateTaskPopup").style.display = "flex";
}

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

// Modifica setTaskProgress per usare l'indice
function setTaskProgress(progress) {
  document.querySelectorAll(".progress-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.closest(".progress-btn").classList.add("active");

  const dateKey = getDateKey(selectedDate);
  if (progress === "completed") {
    if (typeof window.editingTemplateTaskIndex === "number") {
      tasks[dateKey][window.editingTemplateTaskIndex].status = "completed";
      saveTasks();
      loadTasksForDate(selectedDate);
      updateStats();
      renderCalendar();
      closeTemplateTask();
      window.editingTemplateTaskIndex = undefined;
      return;
    }
    // Fallback: cerca per titolo
    const title = document.getElementById("templateTaskTitle")?.value?.trim();
    const idx = tasks[dateKey]?.findIndex((t) => t.title === title);
    if (idx !== undefined && idx >= 0) {
      tasks[dateKey][idx].status = "completed";
      saveTasks();
      loadTasksForDate(selectedDate);
      updateStats();
      renderCalendar();
      closeTemplateTask();
    }
  }
}

function confirmTemplateTask() {
  const title = document.getElementById("templateTaskTitle").value.trim();
  const category = document.getElementById("templateTaskCategory").value;
  const priority = document.getElementById("templateTaskPriority").value;
  const notes = document.getElementById("templateTaskNotes").value.trim();
  const time = document.getElementById("templateTaskTime").value;

  // Leggi lo stato selezionato nei bottoni progresso
  let status = "pending";
  const progressBtn = document.querySelector(".progress-btn.active");
  if (progressBtn) {
    const progress = progressBtn.getAttribute("data-progress");
    if (progress === "completed") status = "completed";
    else if (progress === "in-progress") status = "in-progress";
    else if (progress === "not-started") status = "pending";
  }

  if (!title) {
    alert("Inserisci un titolo per l'attività");
    return;
  }

  const task = {
    title,
    category,
    priority,
    notes,
    time,
    status,
  };

  // Aggiungi manufatto selezionato per Trasmutatore Manufatti
  if (
    category === "other" &&
    title === "Trasmutatore Manufatti" &&
    selectedArtifactToCreate
  ) {
    task.artifacts = [selectedArtifactToCreate];
  }

  // Aggiungi artefatti selezionati per Artifact Farming
  if (
    category === "farming" &&
    window.templateTaskArtifacts &&
    window.templateTaskArtifacts.length > 0
  ) {
    console.log("🔍 DEBUG: Aggiungendo artefatti alla task");
    console.log(
      "🔍 DEBUG: window.templateTaskArtifacts =",
      window.templateTaskArtifacts
    );

    task.artifacts = window.templateTaskArtifacts.map((a) => ({
      name: a.name,
      image: a.image || a.immagine || "images/characters/placeholder.svg",
      setBonus: a.setBonus || {},
    }));

    console.log("🔍 DEBUG: task.artifacts =", task.artifacts);
  }

  // Aggiungi materiali selezionati per Material Farming
  if (
    category === "farming" &&
    window.templateTaskMaterials &&
    window.templateTaskMaterials.length > 0
  ) {
    console.log("🔍 DEBUG: Aggiungendo materiali alla task");
    console.log(
      "🔍 DEBUG: window.templateTaskMaterials =",
      window.templateTaskMaterials
    );

    task.materials = window.templateTaskMaterials;

    console.log("🔍 DEBUG: task.materials =", task.materials);
  }

  const dateKey = getDateKey(selectedDate);

  // Controlla se stiamo modificando un'attività esistente
  if (typeof window.editingTemplateTaskIndex === "number") {
    console.log(
      "🔄 Modificando attività esistente con indice:",
      window.editingTemplateTaskIndex
    );

    if (tasks[dateKey] && tasks[dateKey][window.editingTemplateTaskIndex]) {
      // Aggiorna l'attività esistente
      const existingTask = tasks[dateKey][window.editingTemplateTaskIndex];
      existingTask.title = task.title;
      existingTask.category = task.category;
      existingTask.priority = task.priority;
      existingTask.notes = task.notes;
      existingTask.time = task.time;
      existingTask.status = task.status;

      // Aggiorna artefatti e materiali se presenti
      if (task.artifacts) existingTask.artifacts = task.artifacts;
      if (task.materials) existingTask.materials = task.materials;

      console.log("✅ Attività esistente aggiornata:", existingTask);
    } else {
      console.log(
        "❌ Attività da modificare non trovata, creando nuova attività"
      );
      // Se l'attività non esiste più, crea una nuova
      if (!tasks[dateKey]) tasks[dateKey] = [];
      tasks[dateKey].push(task);
    }

    // Reset dell'indice di modifica
    window.editingTemplateTaskIndex = undefined;
  } else {
    console.log("🆕 Creando nuova attività");
    // Crea una nuova attività
    if (!tasks[dateKey]) tasks[dateKey] = [];
    tasks[dateKey].push(task);
  }

  saveTasks();
  loadTasksForDate(selectedDate);
  updateStats();
  expandDailyTasksAuto();

  // Pulisci le variabili temporanee
  window.templateTaskArtifacts = [];
  window.templateTaskMaterials = [];
  selectedTaskImages = [];

  closeTemplateTask();
}

function closeTemplateTask() {
  document.getElementById("templateTaskPopup").style.display = "none";
  selectedArtifactToCreate = null;
  document.getElementById("artifactToCreateInput").value = "";
  document.getElementById("artifactToCreateImgContainer").innerHTML = "";

  // Pulisci le variabili temporanee
  window.templateTaskArtifacts = [];
  window.templateTaskMaterials = [];
  window.editingTemplateTaskIndex = undefined;
}

// Funzioni per la selezione manufatti
function openArtifactToCreateModal() {
  // Se esiste già, rimuovi il vecchio popup
  const oldPopup = document.getElementById("artifactToCreateSelectionPopup");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.id = "artifactToCreateSelectionPopup";
  popup.className = "popup-overlay";
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    z-index: 12000;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(6px);
  `;

  popup.innerHTML = `
    <div class="popup farming-popup" style="max-width: 700px;">
      <div class="popup-header">
        <h3 class="popup-title">💎 Seleziona Manufatto da Creare</h3>
        <button class="popup-close" onclick="closeArtifactToCreateSelectionModal()">×</button>
      </div>
      <div class="popup-content">
        <div class="farming-search" style="margin-bottom:1.2rem;">
          <input type="text" id="artifactToCreateSearchInput" placeholder="🔍 Cerca artefatto..." class="farming-search-input" />
        </div>
        <div class="artifact-gallery" id="artifactToCreateGallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;max-height:45vh;overflow-y:auto;padding:1rem;background:rgba(10,10,26,0.8);border-radius:15px;border:1px solid rgba(100,255,218,0.2);"></div>
        <div class="selected-artifacts" style="margin-top:1.5rem;">
          <h4 style="color:#64ffda;margin-bottom:1rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Manufatto Selezionato:</h4>
          <div id="selectedArtifactToCreateDisplay" style="display:flex;align-items:center;gap:0.7em;min-height:50px;"></div>
        </div>
        <div class="popup-actions" style="display:flex;gap:1rem;justify-content:flex-end;margin-top:1.5rem;padding-top:1rem;border-top:2px solid rgba(100,255,218,0.3);">
          <button class="btn" onclick="confirmArtifactToCreateSelection()">✅ Conferma Selezione</button>
          <button class="btn btn-secondary" onclick="closeArtifactToCreateSelectionModal()">❌ Annulla</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  // Popola la galleria artefatti
  renderArtifactToCreateGallery();
  renderSelectedArtifactToCreateDisplay();

  // Setup ricerca
  setupArtifactToCreateSearch();

  // Focus sulla barra di ricerca
  setTimeout(() => {
    const searchInput = document.getElementById("artifactToCreateSearchInput");
    if (searchInput) searchInput.focus();
  }, 300);
}

// Funzione per caricare gli artefatti dal file JSON
async function loadArtifacts() {
  console.log("Loading artifacts...");
  try {
    const response = await fetch("artefatti.json");
    const data = await response.json();
    allArtifacts = data.artifacts || [];
    console.log("Artefatti caricati:", allArtifacts.length);
    console.log("First artifact:", allArtifacts[0]);
  } catch (error) {
    console.error("Errore nel caricamento artefatti:", error);
    // Fallback con artefatti di esempio
    allArtifacts = [
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
  }
}

// Funzione per caricare i materiali dal file JSON
async function loadMaterials() {
  try {
    const response = await fetch("materiali.json");
    const data = await response.json();
    allMaterials = data.materiali || {};
    console.log("Materiali caricati:", Object.keys(allMaterials));
  } catch (error) {
    console.error("Errore nel caricamento dei materiali:", error);
    allMaterials = {};
  }
}

// Apre il popup farming
function openFarmingPopup() {
  console.log("🚀 Funzione openFarmingPopup chiamata");
  const popup = document.getElementById("farmingPopup");
  console.log("🔍 Popup trovato:", popup);
  popup.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Reset delle selezioni
  selectedMaterialsFarming = [];
  currentFarmingSearch = "";
  currentFarmingCategoryFilter = "";
  currentFarmingRarityFilter = "";
  currentFarmingElementFilter = "";

  // Reset dei filtri
  document.getElementById("farmingSearchInput").value = "";
  document.getElementById("farmingCategoryFilter").value = "";
  document.getElementById("farmingRarityFilter").value = "";

  // Reset filtro elementi (nascondi di default)
  const elementFilter = document.getElementById("farmingElementFilter");
  if (elementFilter) {
    elementFilter.value = "";
    elementFilter.style.display = "none";
  }

  // Popola la lista dei materiali
  renderMaterialsGallery();
  renderSelectedMaterialsFarming();

  // Aggiungi event listeners
  console.log("🔗 Chiamando setupFarmingListeners...");
  setupFarmingListeners();
  console.log("✅ setupFarmingListeners completata");

  // Aggiungi event listener diretto per il filtro rarità
  const rarityFilterDirect = document.getElementById("farmingRarityFilter");
  if (rarityFilterDirect) {
    console.log("🔗 Aggiungendo event listener diretto per rarità");
    rarityFilterDirect.addEventListener("change", function () {
      console.log("🎯 Event listener diretto ATTIVATO! Valore:", this.value);
      renderMaterialsGallery();
    });
    console.log("✅ Event listener diretto aggiunto");
  }

  // Focus sulla barra di ricerca
  setTimeout(() => {
    document.getElementById("farmingSearchInput").focus();
  }, 300);
}

// Chiude il popup farming
function closeFarmingPopup() {
  const popup = document.getElementById("farmingPopup");
  popup.style.display = "none";
  document.body.style.overflow = "";

  // Rimuovi event listeners per evitare duplicati
  const searchInput = document.getElementById("farmingSearchInput");
  if (searchInput && searchInput.farmingSearchHandler) {
    searchInput.removeEventListener("input", searchInput.farmingSearchHandler);
    delete searchInput.farmingSearchHandler;
  }

  const categoryFilter = document.getElementById("farmingCategoryFilter");
  if (categoryFilter && categoryFilter.farmingCategoryHandler) {
    categoryFilter.removeEventListener(
      "change",
      categoryFilter.farmingCategoryHandler
    );
    delete categoryFilter.farmingCategoryHandler;
  }

  const rarityFilter = document.getElementById("farmingRarityFilter");
  if (rarityFilter && rarityFilter.farmingRarityHandler) {
    rarityFilter.removeEventListener(
      "change",
      rarityFilter.farmingRarityHandler
    );
    delete rarityFilter.farmingRarityHandler;
  }

  const elementFilter = document.getElementById("farmingElementFilter");
  if (elementFilter && elementFilter.farmingElementHandler) {
    elementFilter.removeEventListener(
      "change",
      elementFilter.farmingElementHandler
    );
    delete elementFilter.farmingElementHandler;
  }

  if (popup && popup.farmingOutsideClickHandler) {
    popup.removeEventListener("click", popup.farmingOutsideClickHandler);
    delete popup.farmingOutsideClickHandler;
  }

  // Reset delle variabili
  selectedMaterialsFarming = [];
  currentFarmingSearch = "";
  currentFarmingCategoryFilter = "";
  currentFarmingRarityFilter = "";
  currentFarmingElementFilter = "";
}

// Evidenzia il termine di ricerca nel testo
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(
    regex,
    '<mark style="background: rgba(100, 255, 218, 0.3); color: #64ffda; padding: 0.1rem 0.2rem; border-radius: 3px;">$1</mark>'
  );
}

// Ottiene il nome di visualizzazione della categoria
function getCategoryDisplayName(category) {
  const categoryNames = {
    materiali_ascensione_personaggi: "Ascensione 📈 Personaggi",
    materiali_esperienza: "Materiali 📚 Esperienza",
    materiali_ascensione_armi: "Ascensione ⚔️ Armi",
    materiali_talenti: "Materiali 🎯 Talenti",
    materiali_speciali: "Materiali 💎 Speciali",
    materiali_locali: "Materiali 🗺️ Locali",
  };
  return categoryNames[category] || category;
}

// Funzione per formattare i nomi delle categorie con layout a colonne
function getCategoryDisplayNameFormatted(category) {
  const categoryFormats = {
    materiali_ascensione_personaggi:
      '<span style="display: block;">Ascensione Personaggi</span><span style="display: block; margin-top: 0.1em;">📈</span>',
    materiali_esperienza:
      '<span style="display: block;">Materiali Esperienza</span><span style="display: block; margin-top: 0.1em;">📚</span>',
    materiali_ascensione_armi:
      '<span style="display: block;">Ascensione Armi</span><span style="display: block; margin-top: 0.1em;">⚔️</span>',
    materiali_talenti:
      '<span style="display: block;">Materiali Talenti</span><span style="display: block; margin-top: 0.1em;">🎯</span>',
    materiali_speciali:
      '<span style="display: block;">Materiali Speciali</span><span style="display: block; margin-top: 0.1em;">💎</span>',
    materiali_locali:
      '<span style="display: block;">Materiali Locali</span><span style="display: block; margin-top: 0.1em;">🗺️</span>',
  };
  return categoryFormats[category] || category;
}

// Calcola il punteggio di rilevanza per un materiale
function calculateRelevanceScore(materialName, material, category, searchTerm) {
  if (!searchTerm) return 0;

  const searchTermLower = searchTerm.toLowerCase().trim();
  const materialNameLower = materialName.toLowerCase();
  let score = 0;

  // Punteggio più alto per corrispondenza esatta nel nome
  if (materialNameLower === searchTermLower) {
    score += 100;
  }
  // Punteggio alto per inizio del nome
  else if (materialNameLower.startsWith(searchTermLower)) {
    score += 80;
  }
  // Punteggio medio per contenuto nel nome
  else if (materialNameLower.includes(searchTermLower)) {
    score += 60;
  }
  // Punteggio per parole che iniziano con il termine
  else {
    const materialWords = materialNameLower.split(/\s+/);
    const startsWithMatch = materialWords.some((word) =>
      word.startsWith(searchTermLower)
    );
    if (startsWithMatch) {
      score += 40;
    }
  }

  // Punteggio per descrizione
  if (material.descrizione) {
    const descLower = material.descrizione.toLowerCase();
    if (descLower.includes(searchTermLower)) {
      score += 20;
    }
  }

  return score;
}

// Controlla se un materiale corrisponde ai filtri
function matchesFilters(materialName, material, category) {
  // Filtro per ricerca
  if (currentFarmingSearch) {
    const searchTerm = currentFarmingSearch.toLowerCase().trim();
    const materialNameLower = materialName.toLowerCase();

    // Priorità 1: Ricerca esatta nel nome del materiale
    if (materialNameLower.includes(searchTerm)) {
      return true;
    }

    // Priorità 2: Ricerca per parole che iniziano con il termine
    const materialWords = materialNameLower.split(/\s+/);
    const startsWithMatch = materialWords.some((word) =>
      word.startsWith(searchTerm)
    );
    if (startsWithMatch) {
      return true;
    }

    // Priorità 3: Ricerca nella descrizione (solo se esiste)
    if (material.descrizione) {
      const descLower = material.descrizione.toLowerCase();
      if (descLower.includes(searchTerm)) {
        return true;
      }
    }

    // Priorità 4: Ricerca per categoria/elemento
    const categoryName = getCategoryDisplayName(category).toLowerCase();
    if (categoryName.includes(searchTerm)) {
      return true;
    }

    // Se nessuna corrispondenza trovata, filtra via
    return false;
  }

  // Filtro per rarità
  if (currentFarmingRarityFilter) {
    // Controlla se material.rarita esiste
    if (!material.rarita) {
      return false;
    }

    if (material.rarita.toString() !== currentFarmingRarityFilter) {
      return false;
    }
  }

  return true;
}

// Ottiene i materiali filtrati
function getFilteredMaterials() {
  const materials = [];

  // Itera attraverso tutte le categorie
  Object.keys(allMaterials).forEach((category) => {
    if (
      currentFarmingCategoryFilter &&
      category !== currentFarmingCategoryFilter
    ) {
      return;
    }

    const categoryData = allMaterials[category];

    // Gestisce le sottocategorie (elementi, materiali_comuni, etc.)
    if (category === "materiali_ascensione_personaggi") {
      // Gestisce gli elementi
      Object.keys(categoryData.elementi || {}).forEach((element) => {
        Object.keys(categoryData.elementi[element]).forEach((materialName) => {
          const material = categoryData.elementi[element][materialName];
          if (matchesFilters(materialName, material, category)) {
            const relevanceScore = calculateRelevanceScore(
              materialName,
              material,
              category,
              currentFarmingSearch
            );
            materials.push({
              name: materialName,
              category: category,
              subcategory: element,
              relevanceScore: relevanceScore,
              ...material,
            });
          }
        });
      });

      // Gestisce i materiali comuni
      Object.keys(categoryData.materiali_comuni || {}).forEach(
        (materialName) => {
          const material = categoryData.materiali_comuni[materialName];
          if (matchesFilters(materialName, material, category)) {
            const relevanceScore = calculateRelevanceScore(
              materialName,
              material,
              category,
              currentFarmingSearch
            );
            materials.push({
              name: materialName,
              category: category,
              subcategory: "comuni",
              relevanceScore: relevanceScore,
              ...material,
            });
          }
        }
      );

      // Gestisce i materiali non comuni
      Object.keys(categoryData.materiali_non_comuni || {}).forEach(
        (materialName) => {
          const material = categoryData.materiali_non_comuni[materialName];
          if (matchesFilters(materialName, material, category)) {
            const relevanceScore = calculateRelevanceScore(
              materialName,
              material,
              category,
              currentFarmingSearch
            );
            materials.push({
              name: materialName,
              category: category,
              subcategory: "non_comuni",
              relevanceScore: relevanceScore,
              ...material,
            });
          }
        }
      );
    } else {
      // Per altre categorie, itera direttamente
      Object.keys(categoryData).forEach((materialName) => {
        const material = categoryData[materialName];
        if (matchesFilters(materialName, material, category)) {
          const relevanceScore = calculateRelevanceScore(
            materialName,
            material,
            category,
            currentFarmingSearch
          );
          materials.push({
            name: materialName,
            category: category,
            relevanceScore: relevanceScore,
            ...material,
          });
        }
      });
    }
  });

  // Ordina per rilevanza se c'è una ricerca attiva
  if (currentFarmingSearch && currentFarmingSearch.trim()) {
    materials.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  return materials;
}

// Renderizza la lista dei materiali
function renderFarmingMaterials() {
  const materialsList = document.getElementById("farmingMaterialsList");
  const filteredMaterials = getFilteredMaterials();

  if (filteredMaterials.length === 0) {
    materialsList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #888; font-style: italic;">
        ${
          currentFarmingSearch
            ? `Nessun materiale trovato per "${currentFarmingSearch}"`
            : "Nessun materiale disponibile"
        }
      </div>
    `;
    return;
  }

  // Aggiungi contatore risultati
  const resultsCount = document.createElement("div");
  resultsCount.style.cssText =
    "grid-column: 1 / -1; text-align: center; margin-bottom: 1rem; color: #64ffda; font-weight: 600;";
  resultsCount.textContent = `${filteredMaterials.length} materiali trovati`;

  let materialsHTML = "";

  filteredMaterials.forEach((material) => {
    const isSelected = selectedMaterialsFarming.some(
      (m) => m.name === material.name
    );
    const stars = "★".repeat(material.rarita || 1);
    const categoryName = getCategoryDisplayName(material.category);

    materialsHTML += `
      <div class="material-item ${isSelected ? "selected" : ""}" 
           onclick="selectMaterial(${JSON.stringify(
             material.name || ""
           )}, ${JSON.stringify(material.categoria || "")})">
        <img src="${material.immagine || "images/characters/placeholder.svg"}" 
             alt="${material.name || "Materiale"}" 
             class="material-image" 
             onerror="this.src='images/characters/placeholder.svg'"
             onclick="event.stopPropagation(); openMaterialImagePopup(${JSON.stringify(
               material.immagine || "images/characters/placeholder.svg"
             )}, ${JSON.stringify(
      material.name || "Materiale"
    )}, ${JSON.stringify(material.descrizione || "")})"
             title="Clicca per vedere la descrizione e l'immagine in grande"
             style="cursor: pointer;">
        <div class="material-info">
          <div class="material-name">${highlightSearchTerm(
            material.name || "",
            currentFarmingSearch
          )}</div>
          <div class="material-details">
            <span class="material-category">${getCategoryDisplayName(
              material.categoria || ""
            )}</span>
            <span class="material-rarity">
              ${"★".repeat(material.rarita || 1)}
            </span>
          </div>
          ${
            material.descrizione
              ? `<div class="material-description">${material.descrizione}</div>`
              : ""
          }
        </div>
      </div>
    `;
  });

  materialsList.innerHTML = resultsCount.outerHTML + materialsHTML;
}

// Trova un materiale specifico
function findMaterial(materialName, category) {
  const categoryData = allMaterials[category];
  if (!categoryData) return null;

  if (category === "materiali_ascensione_personaggi") {
    // Cerca negli elementi
    for (const element in categoryData.elementi || {}) {
      if (categoryData.elementi[element][materialName]) {
        return categoryData.elementi[element][materialName];
      }
    }
    // Cerca nei materiali comuni
    if (
      categoryData.materiali_comuni &&
      categoryData.materiali_comuni[materialName]
    ) {
      return categoryData.materiali_comuni[materialName];
    }

    // Cerca nei materiali non comuni
    if (
      categoryData.materiali_non_comuni &&
      categoryData.materiali_non_comuni[materialName]
    ) {
      return categoryData.materiali_non_comuni[materialName];
    }

    // Cerca nei materiali rari
    if (
      categoryData.materiali_rari &&
      categoryData.materiali_rari[materialName]
    ) {
      return categoryData.materiali_rari[materialName];
    }

    // Cerca nei materiali epici
    if (
      categoryData.materiali_epici &&
      categoryData.materiali_epici[materialName]
    ) {
      return categoryData.materiali_epici[materialName];
    }

    // Cerca nei materiali condivisi
    if (
      categoryData.materiali_condivisi &&
      categoryData.materiali_condivisi[materialName]
    ) {
      const sharedMaterial = categoryData.materiali_condivisi[materialName];
      // Aggiungi la proprietà isShared per identificare i materiali condivisi
      return {
        ...sharedMaterial,
        isShared: true,
      };
    }
  } else {
    // Per altre categorie, cerca direttamente
    if (categoryData[materialName]) {
      return categoryData[materialName];
    }
  }

  return null;
}

// Seleziona un materiale
function selectMaterial(materialName, category) {
  const material = findMaterial(materialName, category);
  if (!material) return;

  const isAlreadySelected = selectedMaterialsFarming.some(
    (m) => m.name === materialName
  );

  if (isAlreadySelected) {
    // Rimuovi dalla selezione
    selectedMaterialsFarming = selectedMaterialsFarming.filter(
      (m) => m.name !== materialName
    );
  } else {
    // Aggiungi alla selezione
    selectedMaterialsFarming.push({
      name: materialName,
      categoria: category,
      ...material,
    });
  }

  renderSelectedMaterialsFarming();
  renderMaterialsGallery(); // Aggiorna per mostrare lo stato di selezione
}

// Renderizza i materiali selezionati
function renderSelectedMaterials() {
  const selectedList = document.getElementById("selectedMaterialsList");

  if (selectedMaterialsFarming.length === 0) {
    selectedList.innerHTML = "";
    return;
  }

  let selectedHTML = "";

  selectedMaterialsFarming.forEach((material) => {
    selectedHTML += `
      <div class="selected-material-chip">
        <img src="${material.immagine}" alt="${material.name}" 
             onerror="this.style.display='none'"
             onclick="openMaterialImagePopup(${JSON.stringify(
               material.immagine
             )}, ${JSON.stringify(material.name)}, ${JSON.stringify(
      material.descrizione || ""
    )})"
             title="Clicca per vedere la descrizione e l'immagine in grande"
             style="cursor: pointer;">
        <span>${material.name}</span>
        <button class="remove-material" onclick="removeSelectedMaterial(${JSON.stringify(
          material.name
        )}, ${JSON.stringify(material.categoria)})">×</button>
      </div>
    `;
  });

  selectedList.innerHTML = selectedHTML;
}

// Rimuove un materiale dalla selezione
function removeSelectedMaterial(materialName, category) {
  const index = selectedMaterialsFarming.findIndex(
    (m) => m.name === materialName
  );
  if (index >= 0) {
    selectedMaterialsFarming.splice(index, 1);
    renderMaterialsGallery();
    renderSelectedMaterialsFarming();
  }
}

// Conferma la selezione dei materiali
function confirmFarmingSelection() {
  if (selectedMaterialsFarming.length === 0) {
    alert("❌ Seleziona almeno un materiale da farmare!");
    return;
  }

  // Crea il titolo dell'attività
  const materialNames = selectedMaterialsFarming.map((m) => m.name).join(", ");
  const title = `Farmare: ${materialNames}`;

  // Crea le note con i dettagli
  const notes = selectedMaterialsFarming
    .map((material) => {
      const categoryName = getCategoryDisplayName(material.categoria);
      const stars = "★".repeat(material.rarita || 1); // Default a 1 stella se non definita
      return `• ${material.name} (${categoryName}, ${stars}) - ${
        material.descrizione || "Nessuna descrizione disponibile"
      }`;
    })
    .join("\n");

  // Salva i materiali selezionati con le loro immagini per mostrare nell'attività
  const selectedMaterialsData = selectedMaterialsFarming.map((material) => ({
    name: material.name,
    image: material.immagine,
    category: material.category,
    rarita: material.rarita,
    descrizione: material.descrizione,
  }));

  // Chiudi il popup farming
  closeFarmingPopup();

  // Apri il popup template con i dati precompilati e passa i materiali selezionati
  showTemplateTaskPopup("farming", title, notes, selectedMaterialsData);
}

// Setup degli event listeners per il farming
function setupFarmingListeners() {
  console.log("🔧 Setup event listeners per farming...");
  console.log("📅 Funzione setupFarmingListeners chiamata");

  // Event listener per la ricerca
  const searchInput = document.getElementById("farmingSearchInput");
  if (searchInput) {
    // Rimuovi event listener esistente se presente
    searchInput.removeEventListener("input", searchInput.farmingSearchHandler);

    // Crea nuovo handler
    searchInput.farmingSearchHandler = function () {
      currentFarmingSearch = this.value;
      renderMaterialsGallery();
    };

    // Aggiungi nuovo event listener
    searchInput.addEventListener("input", searchInput.farmingSearchHandler);
  }

  // Event listeners per i filtri
  const categoryFilter = document.getElementById("farmingCategoryFilter");
  if (categoryFilter) {
    // Rimuovi event listener esistente se presente
    categoryFilter.removeEventListener(
      "change",
      categoryFilter.farmingCategoryHandler
    );

    // Crea nuovo handler
    categoryFilter.farmingCategoryHandler = function () {
      currentFarmingCategoryFilter = this.value;
      renderMaterialsGallery();
    };

    // Aggiungi nuovo event listener
    categoryFilter.addEventListener(
      "change",
      categoryFilter.farmingCategoryHandler
    );
  }

  const rarityFilter = document.getElementById("farmingRarityFilter");
  console.log("🔍 Cercando elemento farmingRarityFilter:", rarityFilter);

  if (rarityFilter) {
    console.log("✅ Elemento farmingRarityFilter trovato");

    // Rimuovi event listener esistente se presente
    if (rarityFilter.farmingRarityHandler) {
      console.log("🔄 Rimuovendo event listener esistente");
      rarityFilter.removeEventListener(
        "change",
        rarityFilter.farmingRarityHandler
      );
    }

    // Crea nuovo handler
    rarityFilter.farmingRarityHandler = function () {
      console.log("🔄 Handler rarità chiamato con valore:", this.value);
      console.log("🎯 Event listener del filtro rarità ATTIVATO!");
      currentFarmingRarityFilter = this.value;

      // Mostra/nascondi filtro elementi in base alla rarità selezionata
      const elementFilter = document.getElementById("farmingElementFilter");
      console.log("🔍 Cercando elemento farmingElementFilter:", elementFilter);

      if (elementFilter) {
        console.log("✅ Elemento farmingElementFilter trovato");
        console.log("📊 Valore rarità selezionato:", this.value);
        console.log("📊 Valore rarità è vuoto?", this.value === "");

        if (this.value && this.value !== "") {
          console.log("🔥 Mostrando filtro elementi");
          elementFilter.style.display = "block";
          console.log("✅ Display impostato a 'block'");
        } else {
          console.log("❌ Nascondendo filtro elementi");
          elementFilter.style.display = "none";
          elementFilter.value = ""; // Reset del filtro elementi
          console.log("✅ Display impostato a 'none' e valore resettato");
        }
      } else {
        console.log("❌ Elemento farmingElementFilter NON trovato!");
      }

      renderMaterialsGallery();
    };

    // Aggiungi nuovo event listener
    console.log("🔗 Aggiungendo event listener per cambio rarità");
    rarityFilter.addEventListener("change", rarityFilter.farmingRarityHandler);
    console.log("✅ Event listener aggiunto con successo");
  } else {
    console.log("❌ Elemento farmingRarityFilter NON trovato!");
  }

  // Event listener per il filtro elementi
  const elementFilter = document.getElementById("farmingElementFilter");
  if (elementFilter) {
    // Rimuovi event listener esistente se presente
    elementFilter.removeEventListener(
      "change",
      elementFilter.farmingElementHandler
    );

    // Crea nuovo handler
    elementFilter.farmingElementHandler = function () {
      currentFarmingElementFilter = this.value;
      renderMaterialsGallery();
    };

    // Aggiungi nuovo event listener
    elementFilter.addEventListener(
      "change",
      elementFilter.farmingElementHandler
    );
  }

  // Chiudi popup cliccando fuori
  const popup = document.getElementById("farmingPopup");
  if (popup) {
    // Rimuovi event listener esistente se presente
    popup.removeEventListener("click", popup.farmingOutsideClickHandler);

    // Crea nuovo handler
    popup.farmingOutsideClickHandler = function (event) {
      if (event.target === popup) {
        closeFarmingPopup();
      }
    };

    // Aggiungi nuovo event listener
    popup.addEventListener("click", popup.farmingOutsideClickHandler);
  }
}

function renderArtifactToCreateGallery() {
  try {
    const gallery = document.getElementById("artifactToCreateGallery");
    if (!gallery) return;

    gallery.innerHTML = "";

    if (allArtifacts.length === 0) {
      gallery.innerHTML =
        '<div style="text-align: center; color: #888; padding: 2rem;">Caricamento artefatti...</div>';
      return;
    }

    // FILTRO DINAMICO
    let filteredArtifacts = allArtifacts;
    if (currentArtifactToCreateSearch.trim() !== "") {
      const searchLower = currentArtifactToCreateSearch.trim().toLowerCase();
      filteredArtifacts = allArtifacts.filter(
        (art) => art.name && art.name.toLowerCase().includes(searchLower)
      );
    }

    if (filteredArtifacts.length === 0) {
      gallery.innerHTML =
        '<div style="color: #ff6f3c; text-align: center; grid-column: 1 / -1;">Nessun manufatto trovato.</div>';
      return;
    }

    filteredArtifacts.forEach(function (art) {
      const card = document.createElement("div");
      card.className = "artifact-to-create-item";
      card.style.cssText =
        "background: linear-gradient(135deg, rgba(10, 10, 26, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%); border: 2px solid transparent; border-radius: 12px; padding: 1rem; cursor: pointer; text-align: center; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);";

      // Controlla se questo artefatto è selezionato
      const isSelected =
        selectedArtifactToCreate && selectedArtifactToCreate.name === art.name;
      if (isSelected) {
        card.classList.add("selected-artifact-card");
      }

      // Crea descrizione dai bonus del set
      let description = "";
      if (art.setBonus) {
        description =
          "Bonus 2pz: " +
          art.setBonus["2pc"] +
          ". Bonus 4pz: " +
          art.setBonus["4pc"];
      }

      // Usa immagine dell'artefatto o placeholder
      const imageUrl = art.image || "images/characters/placeholder.svg";

      // Funzione per escapare le stringhe per l'HTML
      function escapeHtml(text) {
        if (!text) return "";
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      // Crea l'elemento immagine separatamente
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = art.name;
      img.style.cssText =
        "width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(100, 255, 218, 0.3); cursor: pointer;";
      img.addEventListener("click", function (e) {
        e.stopPropagation();
        openMaterialImagePopup(imageUrl, art.name, description);
      });

      // Crea il contenitore del nome
      const nameDiv = document.createElement("div");
      nameDiv.style.cssText =
        "font-weight: 600; color: #e0e0e0; font-size: 0.9rem; margin-bottom: 0.3rem;";
      nameDiv.textContent = art.name;

      // Crea il link "Leggi descrizione"
      const descLink = document.createElement("span");
      descLink.style.cssText = "color:#64ffda;font-size:0.85em;cursor:pointer;";
      descLink.textContent = "Leggi descrizione";
      descLink.addEventListener("click", function (e) {
        e.stopPropagation();
        openMaterialImagePopup(imageUrl, art.name, description);
      });

      // Aggiungi elementi al card
      card.appendChild(img);
      card.appendChild(nameDiv);
      card.appendChild(descLink);

      card.addEventListener("click", function () {
        console.log("Card cliccata:", art.name);

        // Rimuovi la selezione da tutte le altre card IMMEDIATAMENTE
        document
          .querySelectorAll(".artifact-to-create-item")
          .forEach(function (el) {
            el.classList.remove("selected-artifact-card");
          });

        // Aggiungi la classe alla card cliccata IMMEDIATAMENTE
        card.classList.add("selected-artifact-card");

        // Poi aggiorna la selezione
        selectArtifactToCreate(art);

        console.log(
          "Classe aggiunta alla card:",
          card.classList.contains("selected-artifact-card")
        );
      });

      card.addEventListener("mouseenter", function () {
        if (!isSelected) {
          this.style.borderColor = "rgba(100, 255, 218, 0.5)";
          this.style.transform = "translateY(-2px)";
        }
      });

      card.addEventListener("mouseleave", function () {
        if (!isSelected) {
          this.style.borderColor = "transparent";
          this.style.transform = "translateY(0)";
        }
      });

      gallery.appendChild(card);
      console.log("Card added for:", art.name);
    });
    console.log(
      "All cards created, gallery children:",
      gallery.children.length
    );
  } catch (error) {
    console.error(
      "Errore durante il rendering della galleria artefatti:",
      error
    );
  }
}

function selectArtifactToCreate(artifact) {
  selectedArtifactToCreate = artifact;
  document.getElementById("artifactToCreateInput").value = artifact.name;

  const container = document.getElementById("artifactToCreateImgContainer");
  if (container) {
    container.innerHTML =
      '<img src="' +
      artifact.image +
      '" alt="' +
      artifact.name +
      '" style="width: 32px; height: 32px; border-radius: 6px; border: 1.5px solid #64ffda; background: #222; object-fit: cover; cursor: pointer;" onerror="this.src=\'images/characters/placeholder.svg\'">';
  }
}

function confirmArtifactToCreateSelection() {
  if (selectedArtifactToCreate) {
    closeArtifactToCreateSelectionModal();
  } else {
    alert("Nessun manufatto selezionato!");
  }
}

function closeArtifactToCreateSelectionModal() {
  const popup = document.getElementById("artifactToCreateSelectionPopup");
  if (popup) {
    popup.remove();
  }
  document.body.style.overflow = "";
}

// Funzioni per il modal immagine materiale
function openMaterialImagePopup(imageSrc, materialName, materialDescription) {
  try {
    const popup = document.getElementById("materialImagePopup");
    const image = document.getElementById("materialImageLarge");
    const title = document.getElementById("materialImageTitle");
    const description = document.getElementById("materialImageDescription");

    if (!popup) {
      console.error("Modal popup non trovato!");
      return;
    }

    popup.style.display = "flex";
    popup.style.zIndex = "13000";

    if (image) {
      image.src = imageSrc || "images/characters/placeholder.svg";
      image.onerror = function () {
        this.src = "images/characters/placeholder.svg";
      };
    }

    if (title) {
      title.textContent = materialName || "Titolo materiale";
    }

    if (description) {
      // Gestisci descrizioni lunghe e formattazione
      let descText = materialDescription || "";

      // Pulisci il testo da caratteri invisibili e di controllo
      descText = descText
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width spaces
        .replace(/[\u00A0]/g, " ") // Non-breaking spaces
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Caratteri di controllo (inclusi \b)
        .replace(/\s+/g, " ") // Multiple spaces to single space
        .trim();

      // Se la descrizione è molto lunga, aggiungi interruzioni di riga
      if (descText.length > 200) {
        descText = descText.replace(/\. /g, ".\n\n");
      }

      // Usa innerHTML per una migliore formattazione
      description.innerHTML = descText.replace(/\n/g, "<br>");
      description.style.whiteSpace = "normal";
      description.style.lineHeight = "1.6";
      description.style.fontFamily = "'Fredoka', sans-serif";
    }

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

// Funzioni per la gestione delle immagini nelle attività
function openNewTaskImagesModal() {
  openTaskImagesModal("new");
}

function openEditTaskImagesModal() {
  openTaskImagesModal("edit");
}

function openTaskImagesModal(mode) {
  const popup = document.getElementById("taskImagesPopup");
  if (popup) {
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Popola la galleria con tutti gli artefatti
    renderTaskImagesGallery();

    // Aggiorna le immagini selezionate
    updateSelectedTaskImagesDisplay();

    // Setup ricerca immagini
    const searchInput = document.getElementById("taskImagesSearchInput");
    if (searchInput) {
      searchInput.value = currentTaskImagesSearch;
      searchInput.removeEventListener(
        "input",
        searchInput.taskImagesSearchHandler
      );
      searchInput.taskImagesSearchHandler = function () {
        currentTaskImagesSearch = this.value;
        renderTaskImagesGallery();
      };
      searchInput.addEventListener(
        "input",
        searchInput.taskImagesSearchHandler
      );
    }
  }
}

function renderTaskImagesGallery() {
  const gallery = document.getElementById("taskImagesList");
  if (!gallery) return;

  gallery.innerHTML = "";

  if (allArtifacts.length === 0) {
    gallery.innerHTML =
      '<div style="text-align: center; color: #888; padding: 2rem;">Caricamento artefatti...</div>';
    return;
  }

  // FILTRO PER RICERCA
  let filteredArtifacts = allArtifacts;
  if (currentTaskImagesSearch && currentTaskImagesSearch.trim() !== "") {
    const searchLower = currentTaskImagesSearch.trim().toLowerCase();
    filteredArtifacts = allArtifacts.filter(
      (art) => art.name && art.name.toLowerCase().includes(searchLower)
    );
  }

  if (filteredArtifacts.length === 0) {
    gallery.innerHTML = `<div style="color: #ff6f3c; text-align: center; grid-column: 1 / -1;">Nessuna immagine trovata${
      currentTaskImagesSearch ? ` per "${currentTaskImagesSearch}"` : ""
    }.</div>`;
    return;
  }

  filteredArtifacts.forEach(function (art) {
    const card = document.createElement("div");
    card.style.cssText =
      "background: rgba(10, 10, 26, 0.9); border: 2px solid transparent; border-radius: 12px; padding: 1rem; cursor: pointer; text-align: center; transition: all 0.3s ease;";
    let description = "";
    if (art.setBonus) {
      description =
        "Bonus 2pz: " +
        (art.setBonus["2pc"] || "") +
        "\n\nBonus 4pz: " +
        (art.setBonus["4pc"] || "");
    }
    const imageUrl = art.image || "images/characters/placeholder.svg";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = art.name;
    img.style.cssText =
      "width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(100, 255, 218, 0.3);";
    img.addEventListener("click", function (e) {
      e.stopPropagation();
      openMaterialImagePopup(imageUrl, art.name, description);
    });
    const nameDiv = document.createElement("div");
    nameDiv.style.cssText =
      "font-weight: 600; color: #e0e0e0; font-size: 0.9rem; margin: 0.5rem 0;";
    nameDiv.textContent = art.name;
    const descLink = document.createElement("span");
    descLink.style.cssText = "color:#64ffda;font-size:0.85em;cursor:pointer;";
    descLink.textContent = "Leggi descrizione";
    descLink.addEventListener("click", function (e) {
      e.stopPropagation();
      openMaterialImagePopup(imageUrl, art.name, description);
    });
    card.appendChild(img);
    card.appendChild(nameDiv);
    card.appendChild(descLink);
    card.addEventListener("click", function () {
      toggleTaskImageSelection(art);
    });
    card.addEventListener("mouseenter", function () {
      this.style.borderColor = "rgba(100, 255, 218, 0.5)";
      this.style.transform = "translateY(-2px)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.borderColor = "transparent";
      this.style.transform = "translateY(0)";
    });
    gallery.appendChild(card);
  });
}

function toggleTaskImageSelection(artifact) {
  const index = selectedTaskImages.findIndex(
    (img) => img.name === artifact.name
  );

  if (index === -1) {
    // Aggiungi artefatto
    selectedTaskImages.push(artifact);
  } else {
    // Rimuovi artefatto
    selectedTaskImages.splice(index, 1);
  }

  updateSelectedTaskImagesDisplay();

  // AGGIORNAMENTO NOTE AGGIUNTIVE AUTOMATICO PER FARMING
  const notesField = document.getElementById("editTaskNotes");
  const catField = document.getElementById("editTaskCategory");
  if (
    notesField &&
    catField &&
    catField.value === "farming" &&
    selectedTaskImages.length === 1
  ) {
    // Prendi il manufatto selezionato
    const art = selectedTaskImages[0];
    let description = "";
    if (art.setBonus && art.setBonus["2pc"] && art.setBonus["4pc"]) {
      description = `Bonus 2pz: ${art.setBonus["2pc"]}. Bonus 4pz: ${art.setBonus["4pc"]}`;
    } else if (art.setBonus && art.setBonus["2pc"]) {
      description = `Bonus 2pz: ${art.setBonus["2pc"]}`;
    } else {
      description = art.name || "Manufatto selezionato";
    }
    notesField.value = `${art.name} - ${description}`;
  }
}

function updateSelectedTaskImagesDisplay() {
  const container = document.getElementById("selectedTaskImagesList");
  if (!container) return;

  container.innerHTML = "";

  if (selectedTaskImages.length === 0) {
    container.innerHTML =
      '<div style="text-align: center; color: #888; font-style: italic;">Nessuna immagine selezionata</div>';
    return;
  }

  selectedTaskImages.forEach(function (artifact, index) {
    const chip = document.createElement("div");
    chip.style.cssText =
      "display: flex; align-items: center; gap: 0.5rem; background: rgba(100, 255, 218, 0.2); border: 1px solid rgba(100, 255, 218, 0.5); border-radius: 8px; padding: 0.5rem; font-size: 0.9rem; transition: all 0.3s ease;";

    const imageUrl = artifact.image || "images/characters/placeholder.svg";

    chip.innerHTML =
      '<img src="' +
      imageUrl +
      '" alt="' +
      artifact.name +
      '" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; border: 1px solid rgba(100, 255, 218, 0.3);"><span style="color: #fff; flex: 1;">' +
      artifact.name +
      '</span><button class="remove-artifact" onclick="removeTaskImage(' +
      index +
      ')" style="background: none; border: none; color: #ff6f3c; cursor: pointer; font-size: 1.2rem; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;">×</button>';

    container.appendChild(chip);
  });
}

function removeTaskImage(index) {
  selectedTaskImages.splice(index, 1);
  updateSelectedTaskImagesDisplay();
}

function updateNewTaskImagesDisplay() {
  const container = document.getElementById("newTaskImagesContainer");
  const input = document.getElementById("newTaskImagesInput");

  if (!container || !input) return;

  container.innerHTML = "";

  if (selectedTaskImages.length === 0) {
    input.value = "";
    return;
  }

  input.value = selectedTaskImages.map((img) => img.name).join(", ");

  selectedTaskImages.forEach(function (artifact, index) {
    const chip = document.createElement("div");
    chip.style.cssText =
      "display: flex; align-items: center; gap: 0.5rem; background: rgba(100, 255, 218, 0.2); border: 1px solid rgba(100, 255, 218, 0.5); border-radius: 8px; padding: 0.5rem; font-size: 0.9rem; transition: all 0.3s ease; margin-top: 0.5rem;";

    const imageUrl = artifact.image || "images/characters/placeholder.svg";

    chip.innerHTML =
      '<img src="' +
      imageUrl +
      '" alt="' +
      artifact.name +
      '" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; border: 1px solid rgba(100, 255, 218, 0.3);"><span style="color: #fff; flex: 1;">' +
      artifact.name +
      '</span><button class="remove-artifact" onclick="removeTaskImage(' +
      index +
      ')" style="background: none; border: none; color: #ff6f3c; cursor: pointer; font-size: 1.2rem; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;">×</button>';

    container.appendChild(chip);
  });
}

function updateEditTaskImagesDisplay() {
  const container = document.getElementById("editTaskImagesContainer");
  const input = document.getElementById("editTaskImagesInput");

  if (!container || !input) return;

  container.innerHTML = "";

  if (selectedTaskImages.length === 0) {
    input.value = "";
    return;
  }

  input.value = selectedTaskImages.map((img) => img.name).join(", ");

  selectedTaskImages.forEach(function (artifact, index) {
    const chip = document.createElement("div");
    chip.style.cssText =
      "display: flex; align-items: center; gap: 0.5rem; background: rgba(100, 255, 218, 0.2); border: 1px solid rgba(100, 255, 218, 0.5); border-radius: 8px; padding: 0.5rem; font-size: 0.9rem; transition: all 0.3s ease; margin-top: 0.5rem;";

    const imageUrl = artifact.image || "images/characters/placeholder.svg";

    chip.innerHTML =
      '<img src="' +
      imageUrl +
      '" alt="' +
      artifact.name +
      '" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; border: 1px solid rgba(100, 255, 218, 0.3);"><span style="color: #fff; flex: 1;">' +
      artifact.name +
      '</span><button class="remove-artifact" onclick="removeTaskImage(' +
      index +
      ')" style="background: none; border: none; color: #ff6f3c; cursor: pointer; font-size: 1.2rem; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease;">×</button>';

    container.appendChild(chip);
  });
}

function confirmTaskImagesSelection() {
  updateNewTaskImagesDisplay();
  closeTaskImagesPopup();
}

function closeTaskImagesPopup() {
  const popup = document.getElementById("taskImagesPopup");
  if (popup) {
    popup.style.display = "none";
    document.body.style.overflow = "";
  }
}

// Funzioni per espandere/comprimere attività
function expandDailyTasks() {
  const dailyTasks = document.querySelector(".daily-tasks");
  dailyTasks.classList.add("expanded");
  document.getElementById("expandTasksBtn").style.display = "none";
  document.getElementById("compressTasksBtn").style.display = "inline-block";
}

function compressDailyTasks() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  if (dailyTasksSection) {
    dailyTasksSection.classList.remove("expanded");
  }
  const expandBtn = document.getElementById("expandTasksBtn");
  const compressBtn = document.getElementById("compressTasksBtn");
  if (expandBtn) expandBtn.style.display = "";
  if (compressBtn) compressBtn.style.display = "none";
}

// Funzioni per i filtri
function filterTasks() {
  const categoryFilter = document.getElementById("taskCategoryFilter").value;
  const statusFilter = document.getElementById("taskStatusFilter").value;

  const dateKey = getDateKey(selectedDate);
  const allTasks = tasks[dateKey] || [];

  const filteredTasks = allTasks.filter((task) => {
    const categoryMatch = !categoryFilter || task.category === categoryFilter;
    const statusMatch = !statusFilter || task.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  renderTasks(filteredTasks);
}

function resetTaskFilters() {
  document.getElementById("taskCategoryFilter").value = "";
  document.getElementById("taskStatusFilter").value = "";
  loadTasksForDate(selectedDate);
}

// Funzioni di utilità
function saveTasks() {
  localStorage.setItem(
    getUserStorageKey("calendarTasks"),
    JSON.stringify(tasks)
  );
}

// Funzioni per azioni globali
function clearAllTasks() {
  if (
    confirm(
      "Sei sicuro di voler cancellare tutte le attività? Questa azione non può essere annullata."
    )
  ) {
    tasks = {};
    saveTasks();
    loadTasksForDate(selectedDate);
    updateStats();
  }
}

function markAllCompleted() {
  const dateKey = getDateKey(selectedDate);
  if (tasks[dateKey]) {
    tasks[dateKey].forEach((task) => {
      task.status = "completed";
    });
    saveTasks();
    loadTasksForDate(selectedDate);
    updateStats();
  }
}

function exportCalendarData() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    "calendario_genshin_" + new Date().toISOString().split("T")[0] + ".json";
  link.click();
  URL.revokeObjectURL(url);
}

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
          tasks = importedTasks;
          saveTasks();
          loadTasksForDate(selectedDate);
          updateStats();
          alert("Dati importati con successo!");
        } catch (error) {
          alert("Errore durante l'importazione: " + error.message);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function generateWeeklyReport() {
  const today = new Date();

  // Calcola correttamente l'inizio della settimana (Lunedì = 0)
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Domenica = 0, ma vogliamo Lunedì = 0
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToMonday);

  let totalTasks = 0;
  let completedTasks = 0;
  const dayNames = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];
  const weekData = [];

  // Raccogli dati per ogni giorno della settimana
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    // Crea una data normalizzata per evitare problemi di fuso orario
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const dateKey = normalizedDate.toISOString().split("T")[0];

    const dayTasks = tasks[dateKey] || [];
    const dayCompleted = dayTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const dayTotal = dayTasks.length;
    const dayPercentage =
      dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;

    totalTasks += dayTotal;
    completedTasks += dayCompleted;

    weekData.push({
      name: dayNames[i], // Usa l'indice invece di date.getDay()
      date: normalizedDate,
      completed: dayCompleted,
      total: dayTotal,
      percentage: dayPercentage,
    });
  }

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Genera HTML per il popup
  const popupContent = document.getElementById("weeklyReportContent");
  popupContent.innerHTML = `
    <div class="weekly-report-summary">
      <h4 style="color: #64ffda; margin-bottom: 1rem; font-size: 1.3rem;">📈 Panoramica Settimanale</h4>
      <p style="color: #b0eaff; margin: 0; font-size: 1rem;">Dal ${formatDateShort(
        weekStart
      )} al ${formatDateShort(
    new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
  )}</p>
    </div>

    <div class="weekly-report-stats">
      <div class="weekly-stat-card">
        <div class="weekly-stat-number">${totalTasks}</div>
        <div class="weekly-stat-label">Attività Totali</div>
      </div>
      <div class="weekly-stat-card">
        <div class="weekly-stat-number">${completedTasks}</div>
        <div class="weekly-stat-label">Completate</div>
      </div>
      <div class="weekly-stat-card">
        <div class="weekly-stat-number">${completionRate}%</div>
        <div class="weekly-stat-label">Tasso Completamento</div>
      </div>
    </div>

    <div class="weekly-report-progress">
      <div class="weekly-report-progress-bar" style="width: ${completionRate}%"></div>
    </div>

    <div class="weekly-report-days">
      <h4>📅 Dettaglio Giornaliero</h4>
      ${weekData
        .map(
          (day) => `
        <div class="weekly-day-item">
          <div class="weekly-day-name">${day.name}</div>
          <div class="weekly-day-stats">
            <span class="weekly-day-completed">${day.completed}</span>
            <span class="weekly-day-total">/ ${day.total}</span>
            ${
              day.total > 0
                ? `<span class="weekly-day-percentage">${day.percentage}%</span>`
                : ""
            }
          </div>
        </div>
      `
        )
        .join("")}
    </div>

    <div class="weekly-report-actions">
      <button class="weekly-report-btn" onclick="exportWeeklyReport()">
        📤 Esporta Report
      </button>
      <button class="weekly-report-btn btn-secondary" onclick="closeWeeklyReport()">
        ❌ Chiudi
      </button>
    </div>
  `;

  // Mostra il popup
  document.getElementById("weeklyReportPopup").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeWeeklyReport() {
  document.getElementById("weeklyReportPopup").style.display = "none";
  document.body.style.overflow = "";
}

function exportWeeklyReport() {
  const today = new Date();

  // Calcola correttamente l'inizio della settimana (Lunedì = 0)
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Domenica = 0, ma vogliamo Lunedì = 0
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToMonday);

  let reportText = "📊 REPORT SETTIMANALE GENSHIN IMPACT\n";
  reportText += "=".repeat(40) + "\n\n";
  reportText += `Periodo: ${formatDateShort(weekStart)} - ${formatDateShort(
    new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
  )}\n\n`;

  let totalTasks = 0;
  let completedTasks = 0;
  const dayNames = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    // Crea una data normalizzata per evitare problemi di fuso orario
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const dateKey = normalizedDate.toISOString().split("T")[0];

    const dayTasks = tasks[dateKey] || [];
    const dayCompleted = dayTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const dayTotal = dayTasks.length;
    const dayPercentage =
      dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;

    totalTasks += dayTotal;
    completedTasks += dayCompleted;

    reportText += `${dayNames[i]}: ${dayCompleted}/${dayTotal} (${dayPercentage}%)\n`;
  }

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  reportText += `\nTOTALE: ${completedTasks}/${totalTasks} (${completionRate}%)\n`;

  // Crea e scarica il file
  const blob = new Blob([reportText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genshin_weekly_report_${
    new Date().toISOString().split("T")[0]
  }.txt`;
  a.click();
  URL.revokeObjectURL(url);

  showNotification("Report settimanale esportato! 📤");
}

// Rendi tutte le funzioni accessibili globalmente
window.initializeCalendar = initializeCalendar;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.addNewTask = addNewTask;
window.toggleTaskStatus = toggleTaskStatus;
window.editTask = editTask;
window.saveTaskChanges = saveTaskChanges;
window.deleteTask = deleteTask;
window.closeTaskDetail = closeTaskDetail;
window.addTemplateTask = addTemplateTask;
window.setTaskProgress = setTaskProgress;
window.confirmTemplateTask = confirmTemplateTask;
window.closeTemplateTask = closeTemplateTask;
window.loadArtifacts = loadArtifacts;
window.openArtifactToCreateModal = openArtifactToCreateModal;
window.renderArtifactToCreateGallery = renderArtifactToCreateGallery;
window.selectArtifactToCreate = selectArtifactToCreate;
window.confirmArtifactToCreateSelection = confirmArtifactToCreateSelection;
window.closeArtifactToCreateSelectionModal =
  closeArtifactToCreateSelectionModal;
window.openMaterialImagePopup = openMaterialImagePopup;
window.closeMaterialImagePopup = closeMaterialImagePopup;
window.openNewTaskImagesModal = openNewTaskImagesModal;
window.openEditTaskImagesModal = openEditTaskImagesModal;
window.openTaskImagesModal = openTaskImagesModal;
window.renderTaskImagesGallery = renderTaskImagesGallery;
window.toggleTaskImageSelection = toggleTaskImageSelection;
window.updateSelectedTaskImagesDisplay = updateSelectedTaskImagesDisplay;
window.removeTaskImage = removeTaskImage;
window.updateNewTaskImagesDisplay = updateNewTaskImagesDisplay;
window.updateEditTaskImagesDisplay = updateEditTaskImagesDisplay;
window.confirmTaskImagesSelection = confirmTaskImagesSelection;
window.closeTaskImagesPopup = closeTaskImagesPopup;
window.expandDailyTasks = expandDailyTasks;
window.compressDailyTasks = compressDailyTasks;
window.filterTasks = filterTasks;
window.resetTaskFilters = resetTaskFilters;
window.clearAllTasks = clearAllTasks;
window.markAllCompleted = markAllCompleted;
window.exportCalendarData = exportCalendarData;
window.importCalendarData = importCalendarData;
window.generateWeeklyReport = generateWeeklyReport;
window.closeWeeklyReport = closeWeeklyReport;
window.exportWeeklyReport = exportWeeklyReport;

// Inizializzazione
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Calendario completo inizializzato!");
  await loadArtifacts(); // Carica gli artefatti
  await loadMaterials(); // Carica i materiali
  initializeCalendar();
});

// Funzioni per il farming di artefatti
function showArtifactTable() {
  // Mostra il modal HTML esistente
  const popup = document.getElementById("artifactTablePopup");
  if (popup) {
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  // Reset selezione e ricerca
  selectedArtifacts = [];
  console.log("🔍 DEBUG: showArtifactTable - selectedArtifacts resettato");
  currentArtifactSearch = "";
  const searchInput = document.getElementById("artifactSearchInput");
  if (searchInput) searchInput.value = "";
  // Popola la galleria
  renderArtifactGallery();
  renderSelectedArtifacts();
  setupArtifactSearch();
}

// Modifica closeArtifactTable per chiudere il modal HTML
function closeArtifactTable() {
  const popup = document.getElementById("artifactTablePopup");
  if (popup) {
    popup.style.display = "none";
    document.body.style.overflow = "";
  }
  selectedArtifacts = [];
  console.log("🔍 DEBUG: closeArtifactTable - selectedArtifacts resettato");
  currentArtifactSearch = "";
}

// Renderizza la galleria degli artefatti
function renderArtifactGallery() {
  console.log("renderArtifactGallery called");
  const gallery = document.getElementById("artifactGallery");
  if (!gallery) {
    console.log("Gallery element not found!");
    return;
  }

  gallery.innerHTML = "";
  console.log("Gallery cleared, allArtifacts:", allArtifacts);

  let filteredArtifacts = allArtifacts;
  if (currentArtifactSearch.trim() !== "") {
    const searchLower = currentArtifactSearch.trim().toLowerCase();
    filteredArtifacts = allArtifacts.filter(
      (art) => art.name && art.name.toLowerCase().includes(searchLower)
    );
  }

  console.log("Filtered artifacts:", filteredArtifacts.length);

  if (filteredArtifacts.length === 0) {
    console.log("No artifacts found, showing message");
    gallery.innerHTML =
      '<div style="color: #ff6f3c; text-align: center; grid-column: 1 / -1;">Nessun artefatto trovato.</div>';
    return;
  }

  console.log("Creating cards for", filteredArtifacts.length, "artifacts");
  filteredArtifacts.forEach((art, index) => {
    console.log(
      "DEBUG ARTIFACT:",
      art.name,
      "| 2pc:",
      art.setBonus?.["2pc"],
      "| 4pc:",
      art.setBonus?.["4pc"]
    );
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
      <img src="${
        art.image ? art.image : "images/characters/placeholder.svg"
      }" alt="${art.name}" 
           class="artifact-image" 
           onerror="this.src='images/characters/placeholder.svg'"
           title="Clicca per vedere la descrizione e l'immagine in grande"
           style="cursor: pointer;">
      <div class="artifact-info">
        <div class="artifact-name">${art.name}</div>
        <div style="margin: 0.3em 0 0.5em 0;">
          <a href="#" class="artifact-desc-link" style="color:#64ffda;font-size:0.95em;text-decoration:underline;cursor:pointer;" onclick="event.stopPropagation(); openMaterialImagePopup('${
            art.image ? art.image : "images/characters/placeholder.svg"
          }', '${art.name}', '${escapeForJs(
      art.setBonus && art.setBonus["2pc"] && art.setBonus["4pc"]
        ? "Bonus 2pz: " +
            art.setBonus["2pc"] +
            ". Bonus 4pz: " +
            art.setBonus["4pc"]
        : "Nessuna descrizione disponibile"
    )}'); return false;">Leggi descrizione</a>
        </div>
      </div>
    `;

    card.addEventListener("click", () => toggleArtifactSelection(art));
    card.addEventListener("mouseenter", function () {
      if (!isSelected) {
        this.style.borderColor = "rgba(100, 255, 218, 0.5)";
        this.style.transform = "translateY(-2px)";
      }
    });

    card.addEventListener("mouseleave", function () {
      if (!isSelected) {
        this.style.borderColor = "transparent";
        this.style.transform = "translateY(0)";
      }
    });

    gallery.appendChild(card);
    console.log("Card added for:", art.name);
  });
  console.log("All cards created, gallery children:", gallery.children.length);
}

// Toggle selezione artefatto
function toggleArtifactSelection(artifact) {
  console.log(
    "🔍 DEBUG: toggleArtifactSelection chiamata con artifact =",
    artifact
  );
  console.log("🔍 DEBUG: selectedArtifacts prima =", selectedArtifacts);

  const index = selectedArtifacts.findIndex(
    (selected) => selected.name === artifact.name
  );

  if (index >= 0) {
    selectedArtifacts.splice(index, 1);
    console.log(
      "🔍 DEBUG: artefatto rimosso, selectedArtifacts dopo =",
      selectedArtifacts
    );
  } else {
    selectedArtifacts.push(artifact);
    console.log(
      "🔍 DEBUG: artefatto aggiunto, selectedArtifacts dopo =",
      selectedArtifacts
    );
  }

  renderArtifactGallery();
  renderSelectedArtifacts();
}

// Renderizza gli artefatti selezionati
function renderSelectedArtifacts() {
  const selectedList = document.getElementById("selectedArtifactsList");
  if (!selectedList) return;

  if (selectedArtifacts.length === 0) {
    selectedList.innerHTML = "";
    return;
  }

  let selectedHTML = "";
  selectedArtifacts.forEach((artifact) => {
    let description =
      artifact.setBonus && artifact.setBonus["2pc"] && artifact.setBonus["4pc"]
        ? `Bonus 2pz: ${artifact.setBonus["2pc"]}. Bonus 4pz: ${artifact.setBonus["4pc"]}`
        : "Nessuna descrizione disponibile";
    selectedHTML += `
      <div class="selected-artifact-chip" style="
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(100, 255, 218, 0.2);
        border: 1px solid rgba(100, 255, 218, 0.5);
        border-radius: 8px;
        padding: 0.5rem;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      ">
        <img src="${artifact.image}" alt="${artifact.name}"
             style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; border: 1px solid rgba(100, 255, 218, 0.3); cursor:pointer;"
             onclick="openMaterialImagePopup('${artifact.image}', '${
      artifact.name
    }', '${description.replace(/'/g, "\\'")}' )">
        <span style="color: #fff; flex: 1;">${artifact.name}</span>
        <button onclick="removeSelectedArtifact('${artifact.name}')" style="
          background: none;
          border: none;
          color: #ff6f3c;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255, 111, 60, 0.2)'" onmouseout="this.style.background='none'">×</button>
      </div>
    `;
  });

  selectedList.innerHTML = selectedHTML;
}

// Rimuove un artefatto dalla selezione
function removeSelectedArtifact(artifactName) {
  selectedArtifacts = selectedArtifacts.filter(
    (artifact) => artifact.name !== artifactName
  );
  renderArtifactGallery();
  renderSelectedArtifacts();
}

// Conferma la selezione degli artefatti
function confirmArtifactSelection() {
  console.log("🔍 DEBUG: confirmArtifactSelection chiamata");
  console.log("🔍 DEBUG: selectedArtifacts =", selectedArtifacts);

  if (selectedArtifacts.length === 0) {
    alert("❌ Seleziona almeno un artefatto da farmare!");
    return;
  }

  // Crea il titolo dell'attività
  const artifactNames = selectedArtifacts.map((a) => a.name).join(", ");
  const title = `Farmare Artefatti: ${artifactNames}`;
  console.log("🔍 DEBUG: title =", title);

  // Crea le note con i dettagli
  const notes = selectedArtifacts
    .map((artifact) => {
      const description = artifact.setBonus
        ? `Bonus 2pz: ${artifact.setBonus["2pc"]}. Bonus 4pz: ${artifact.setBonus["4pc"]}`
        : "Nessuna descrizione disponibile";
      return `• ${artifact.name} - ${description}`;
    })
    .join("\n");
  console.log("🔍 DEBUG: notes =", notes);

  // Associa le immagini selezionate anche a selectedTaskImages (immagini associate)
  selectedTaskImages = selectedArtifacts.map((a) => ({
    name: a.name,
    image: a.image || a.immagine || "images/characters/placeholder.svg",
  }));
  console.log("🔍 DEBUG: selectedTaskImages =", selectedTaskImages);

  // Apri il popup template con i dati precompilati e gli artefatti selezionati
  console.log(
    "🔍 DEBUG: chiamando showTemplateTaskPopup con artifacts =",
    selectedArtifacts
  );
  showTemplateTaskPopup("farming", title, notes, selectedArtifacts);

  // Chiudi il popup artefatti SOLO ORA
  closeArtifactTable();
}

// Setup della ricerca artefatti
function setupArtifactSearch() {
  const searchInput = document.getElementById("artifactSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentArtifactSearch = this.value;
      renderArtifactGallery();
    });
  }
}

// Rendi le funzioni accessibili globalmente per il farming
window.openFarmingPopup = openFarmingPopup;
window.closeFarmingPopup = closeFarmingPopup;
window.confirmFarmingSelection = confirmFarmingSelection;
window.selectMaterial = selectMaterial;
window.removeSelectedMaterial = removeSelectedMaterial;
window.showArtifactTable = showArtifactTable;
window.closeArtifactTable = closeArtifactTable;
window.confirmArtifactSelection = confirmArtifactSelection;
window.removeSelectedArtifact = removeSelectedArtifact;

// All'avvio della pagina, controllo login obbligatorio e aggiorno controlli utente
document.addEventListener("DOMContentLoaded", function () {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  } else {
    renderUserControls();
  }
});

function setupArtifactToCreateSearch() {
  const searchInput = document.getElementById("artifactToCreateSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentArtifactToCreateSearch = this.value;
      renderArtifactToCreateGallery();
    });
  }
}

// Funzione per mostrare il manufatto selezionato nel modal (input e immagine)
function renderSelectedArtifactToCreateDisplay() {
  const input = document.getElementById("artifactToCreateInput");
  const imgContainer = document.getElementById("artifactToCreateImgContainer");
  if (!input || !imgContainer) return;

  if (window.selectedArtifactToCreate) {
    input.value =
      window.selectedArtifactToCreate.name || "Manufatto selezionato";
    imgContainer.innerHTML = window.selectedArtifactToCreate.img
      ? `<img src="${window.selectedArtifactToCreate.img}" alt="${window.selectedArtifactToCreate.name}" style="width:32px;height:32px;border-radius:6px;">`
      : "";
  } else {
    input.value = "";
    imgContainer.innerHTML = "";
    input.placeholder = "Nessun manufatto selezionato";
  }
}

function showCustomConfirm(message, callback) {
  const popup = document.getElementById("customConfirmPopup");
  const msg = document.getElementById("customConfirmMessage");
  const yesBtn = document.getElementById("customConfirmYes");
  const noBtn = document.getElementById("customConfirmNo");

  msg.textContent = message;
  popup.style.display = "flex";
  document.body.style.overflow = "hidden";

  function cleanup(result) {
    popup.style.display = "none";
    document.body.style.overflow = "";
    yesBtn.removeEventListener("click", onYes);
    noBtn.removeEventListener("click", onNo);
    if (callback) callback(result);
  }
  function onYes() {
    cleanup(true);
  }
  function onNo() {
    cleanup(false);
  }

  yesBtn.addEventListener("click", onYes);
  noBtn.addEventListener("click", onNo);
}

// Funzione di escape robusto per JS inline
function escapeForJs(str) {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\b/g, "\\b")
    .replace(/\v/g, "\\v")
    .replace(/\0/g, "\\0")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, function (c) {
      return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
    });
}

function showMaterialTable() {
  console.log("🚀 showMaterialTable chiamata - Apertura popup materiali");

  // Reset della selezione
  selectedMaterialsFarming = [];
  console.log(
    "🔄 Reset lista materiali selezionati:",
    selectedMaterialsFarming
  );

  const popup = document.getElementById("farmingPopup");
  console.log("🔍 Cercando popup farmingPopup...");

  if (!popup) {
    console.log("❌ Popup farmingPopup NON TROVATO!");
    return;
  }

  console.log("✅ Popup farmingPopup trovato!");
  popup.style.display = "flex";
  console.log("📱 Popup visualizzato");

  // Carica i materiali
  console.log("📚 Caricamento materiali...");
  loadMaterials();
  console.log("✅ Materiali caricati");

  // Inizializza la ricerca
  console.log("🔍 Inizializzazione ricerca...");
  const searchInput = document.getElementById("farmingSearchInput");
  if (searchInput) {
    searchInput.value = "";
    console.log("✅ Campo ricerca resettato");
  }

  // Inizializza i filtri
  console.log("🎛️ Inizializzazione filtri...");
  const categoryFilter = document.getElementById("farmingCategoryFilter");
  const rarityFilter = document.getElementById("farmingRarityFilter");

  if (categoryFilter) {
    categoryFilter.value = "";
    console.log("✅ Filtro categoria resettato");
  }
  if (rarityFilter) {
    rarityFilter.value = "";
    console.log("✅ Filtro rarità resettato");
  }

  // Setup event listeners per ricerca e filtri
  console.log("🔗 Setup event listeners...");
  setupMaterialSearch();
  console.log("✅ Event listeners configurati");

  // Renderizza la lista vuota
  console.log("🎨 Rendering lista materiali selezionati (vuota)...");
  renderSelectedMaterialsFarming();
  console.log("✅ Popup materiali completamente inizializzato");
}

// Gestione selezione materiali
let selectedMaterialsFarming = [];

function toggleMaterialSelection(material) {
  console.log("🔄 toggleMaterialSelection chiamata con materiale:", material);
  console.log(
    "📋 Materiali attualmente selezionati:",
    selectedMaterialsFarming
  );

  const index = selectedMaterialsFarming.findIndex(
    (mat) => mat.name === material.name
  );

  if (index === -1) {
    console.log("➕ Aggiungendo materiale alla selezione:", material.name);
    selectedMaterialsFarming.push(material);
    console.log(
      "📋 Nuova lista materiali selezionati:",
      selectedMaterialsFarming
    );
  } else {
    console.log("➖ Rimuovendo materiale dalla selezione:", material.name);
    selectedMaterialsFarming.splice(index, 1);
    console.log(
      "📋 Nuova lista materiali selezionati:",
      selectedMaterialsFarming
    );
  }

  console.log("🎨 Aggiornando visualizzazione materiali selezionati...");
  renderSelectedMaterialsFarming();
  console.log("✅ Visualizzazione aggiornata!");
}

function renderSelectedMaterialsFarming() {
  const selectedList = document.getElementById("selectedMaterialsList");
  console.log("🔍 Cercando elemento selectedMaterialsList...");

  if (!selectedList) {
    console.log("❌ Elemento selectedMaterialsList NON TROVATO!");
    console.log(
      "Elementi con 'selected' nel nome:",
      document.querySelectorAll('[id*="selected"]')
    );
    console.log(
      "Tutti gli elementi con ID:",
      Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
    );
    return;
  }

  console.log("✅ Elemento selectedMaterialsList trovato!");
  console.log(
    "📍 Posizione dell'elemento:",
    selectedList.offsetTop,
    selectedList.offsetLeft
  );
  console.log(
    "📏 Dimensioni dell'elemento:",
    selectedList.offsetWidth,
    selectedList.offsetHeight
  );

  console.log(
    "Rendering materiali selezionati:",
    selectedMaterialsFarming.length
  );
  console.log("Materiali selezionati:", selectedMaterialsFarming);

  if (selectedMaterialsFarming.length === 0) {
    selectedList.innerHTML =
      '<div style="color: #888; font-style: italic; text-align: center; width: 100%;">Nessun materiale selezionato</div>';
    return;
  }

  let html = "";
  selectedMaterialsFarming.forEach((mat, index) => {
    console.log(
      `Materiale ${index + 1}:`,
      mat.name,
      "Immagine:",
      mat.immagine || mat.image
    );

    const imageUrl =
      mat.immagine || mat.image || "images/characters/placeholder.svg";
    const imageId = `material-img-${index}`;

    html += `<div class='selected-material-chip' style='display: flex; align-items: center; gap: 0.5rem; background: rgba(100, 255, 218, 0.2); border: 1px solid rgba(100, 255, 218, 0.5); border-radius: 8px; padding: 0.5rem; color: #64ffda; font-size: 0.85rem; font-weight: 500; transition: all 0.3s ease; min-height: 40px;'>
      <img id="${imageId}" src="${imageUrl}" alt="${mat.name}" 
           style="width:32px;height:32px;border-radius:4px;object-fit:cover;border:1px solid rgba(100,255,218,0.3);background:#222;display:block !important;visibility:visible !important;opacity:1 !important;min-width:32px;min-height:32px;max-width:32px;max-height:32px;flex-shrink:0;position:relative;z-index:1;" 
           onload="console.log('Immagine caricata:', '${
             mat.name
           }', this.src); this.style.display='block'; this.style.visibility='visible'; this.style.opacity='1';" 
           onerror="console.log('Errore caricamento immagine:', '${
             mat.name
           }', this.src); this.src='images/characters/placeholder.svg'; this.style.display='block'; this.style.visibility='visible'; this.style.opacity='1';">
      <span style='color: #e0e0e0; flex: 1;'>${mat.name}</span>
      <button class='remove-material' onclick='removeSelectedMaterialFarming(${JSON.stringify(
        mat.name
      )})' style='background: none; border: none; color: #ff6f3c; cursor: pointer; font-size: 1.2rem; padding: 0.2rem; border-radius: 50%; transition: all 0.3s ease;'>×</button>
    </div>`;
  });

  console.log("📝 HTML generato:", html);
  console.log("📝 Inserendo HTML nell'elemento selectedMaterialsList...");
  selectedList.innerHTML = html;
  console.log(
    "✅ HTML inserito! Contenuto dell'elemento:",
    selectedList.innerHTML
  );

  // DEBUG: Verifica immediata se le immagini sono nel DOM
  console.log(
    "🔍 DEBUG: Verifica immagini nel DOM immediatamente dopo inserimento HTML"
  );
  const immediateImages = selectedList.querySelectorAll("img");
  console.log(
    `📸 Trovate ${immediateImages.length} immagini nel DOM immediatamente`
  );

  immediateImages.forEach((img, index) => {
    console.log(`📸 Immagine ${index + 1} nel DOM:`, {
      id: img.id,
      src: img.src,
      alt: img.alt,
      tagName: img.tagName,
      className: img.className,
      parentElement: img.parentElement ? img.parentElement.tagName : "null",
    });
  });

  // Forza il ridisegno del contenitore
  selectedList.style.display = "flex";
  selectedList.style.visibility = "visible";
  selectedList.style.opacity = "1";
  selectedList.style.overflow = "visible";
  selectedList.offsetHeight;

  // Forza la visualizzazione delle immagini
  setTimeout(() => {
    const images = selectedList.querySelectorAll("img");
    console.log(
      `🔍 Trovate ${images.length} immagini nel selectedMaterialsList dopo timeout`
    );

    images.forEach((img, index) => {
      console.log(`📸 Immagine ${index + 1}:`, {
        src: img.src,
        display: img.style.display,
        visibility: img.style.visibility,
        opacity: img.style.opacity,
        width: img.style.width,
        height: img.style.height,
        offsetWidth: img.offsetWidth,
        offsetHeight: img.offsetHeight,
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight,
      });

      // Forza tutti gli stili
      img.style.display = "block";
      img.style.visibility = "visible";
      img.style.opacity = "1";
      img.style.width = "32px";
      img.style.height = "32px";
      img.style.minWidth = "32px";
      img.style.minHeight = "32px";
      img.style.maxWidth = "32px";
      img.style.maxHeight = "32px";
      img.style.position = "relative";
      img.style.zIndex = "10";
      img.style.background = "#222";
      img.style.border = "1px solid rgba(100, 255, 218, 0.3)";
      img.style.borderRadius = "4px";
      img.style.objectFit = "cover";
      img.style.flexShrink = "0";

      // Forza anche con setAttribute
      img.setAttribute(
        "style",
        img.getAttribute("style") +
          "; display: block !important; visibility: visible !important; opacity: 1 !important;"
      );

      console.log(`✅ Forzata visualizzazione immagine ${index + 1}:`, img.src);
    });

    // Controlla se il contenitore è visibile
    console.log("📦 Stato contenitore selectedMaterialsList:", {
      display: selectedList.style.display,
      visibility: selectedList.style.visibility,
      opacity: selectedList.style.opacity,
      offsetWidth: selectedList.offsetWidth,
      offsetHeight: selectedList.offsetHeight,
      clientWidth: selectedList.clientWidth,
      clientHeight: selectedList.clientHeight,
    });
  }, 100);
}

function removeSelectedMaterialFarming(name) {
  console.log("🗑️ Rimuovendo materiale:", name);
  selectedMaterialsFarming = selectedMaterialsFarming.filter(
    (m) => m.name !== name
  );
  console.log("📋 Materiali rimanenti:", selectedMaterialsFarming);
  renderSelectedMaterialsFarming();
}

function closeFarmingPopup() {
  console.log("❌ Chiusura popup farming");
  const popup = document.getElementById("farmingPopup");
  if (popup) {
    popup.style.display = "none";
    console.log("✅ Popup chiuso");
  }
}

function confirmFarmingSelection() {
  console.log("✅ Conferma selezione farming");
  if (selectedMaterialsFarming.length === 0) {
    alert("Seleziona almeno un materiale!");
    return;
  }

  console.log(
    "📋 Materiali selezionati per conferma:",
    selectedMaterialsFarming
  );

  // Prepara i dati per il modal di personalizzazione
  const materialNames = selectedMaterialsFarming.map((m) => m.name).join(", ");
  const materials = selectedMaterialsFarming.map((m) => ({
    name: m.name,
    image: m.immagine || m.image,
    descrizione: m.descrizione || "",
  }));

  // Salva i materiali selezionati temporaneamente per il modal
  window.templateTaskMaterials = materials;

  // Chiudi il modal di selezione materiali
  closeFarmingPopup();

  // Apri il modal di personalizzazione attività
  showTemplateTaskPopup(
    "farming",
    "Material Farming",
    `Materiali da farmare: ${materialNames}`,
    null, // non artefatti
    window.editingMaterialTaskIndex // passa l'indice se stiamo modificando
  );
}

// Funzione per caricare i materiali
async function loadMaterials() {
  console.log("📚 Inizio caricamento materiali...");

  try {
    // Carica i materiali se non sono già caricati
    if (!window.allMaterials || Object.keys(window.allMaterials).length === 0) {
      console.log("📥 Caricamento materiali da materiali.json...");
      const response = await fetch("materiali.json");
      const data = await response.json();
      window.allMaterials = data.materiali || {};
      console.log(
        "✅ Materiali caricati da file:",
        Object.keys(window.allMaterials)
      );
    } else {
      console.log("✅ Materiali già caricati in memoria");
    }

    // Renderizza la galleria materiali
    console.log("🎨 Rendering galleria materiali...");
    renderMaterialsGallery();
    console.log("✅ Galleria materiali renderizzata");
  } catch (error) {
    console.error("❌ Errore caricamento materiali:", error);
    alert("Errore nel caricamento dei materiali!");
  }
}

// Funzione per renderizzare la galleria materiali
function renderMaterialsGallery() {
  console.log("🎨 renderMaterialsGallery chiamata");
  const gallery = document.getElementById("farmingMaterialsList");

  if (!gallery) {
    console.log("❌ Elemento farmingMaterialsList non trovato!");
    return;
  }

  console.log("✅ Elemento farmingMaterialsList trovato");
  gallery.innerHTML = "";

  // Carica i materiali da window.allMaterials
  let allMaterialsArr = [];
  console.log(
    "📋 Processando materiali da window.allMaterials:",
    window.allMaterials
  );

  for (const cat in window.allMaterials) {
    const group = window.allMaterials[cat];
    console.log(`📂 Processando categoria: ${cat}`, group);

    if (group.elementi) {
      // Gestione materiali_ascensione_personaggi con elementi
      for (const elem in group.elementi) {
        for (const matName in group.elementi[elem]) {
          const mat = group.elementi[elem][matName];
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            elemento: elem,
          });
        }
      }

      // Gestione materiali_comuni per materiali_ascensione_personaggi
      if (group.materiali_comuni) {
        for (const matName in group.materiali_comuni) {
          const mat = group.materiali_comuni[matName];
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            subcategory: "comuni",
          });
        }
      }

      // Gestione materiali_non_comuni per materiali_ascensione_personaggi
      if (group.materiali_non_comuni) {
        for (const matName in group.materiali_non_comuni) {
          const mat = group.materiali_non_comuni[matName];
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            subcategory: "non_comuni",
          });
        }
      }

      // Gestione materiali_rari per materiali_ascensione_personaggi
      if (group.materiali_rari) {
        for (const matName in group.materiali_rari) {
          const mat = group.materiali_rari[matName];
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            subcategory: "rari",
          });
        }
      }

      // Gestione materiali_epici per materiali_ascensione_personaggi
      if (group.materiali_epici) {
        for (const matName in group.materiali_epici) {
          const mat = group.materiali_epici[matName];
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            subcategory: "epici",
          });
        }
      }

      // Gestione materiali_condivisi per materiali_ascensione_personaggi
      if (group.materiali_condivisi) {
        for (const matName in group.materiali_condivisi) {
          const mat = group.materiali_condivisi[matName];
          // Per i materiali condivisi, crea una sola entry con tutti gli elementi
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            subcategory: "condivisi",
            elementi: mat.elementi || [],
            // Aggiungi una proprietà per indicare che è un materiale condiviso
            isShared: true,
          });
        }
      }
    } else if (cat === "materiali_locali") {
      // Gestione speciale per materiali_locali con regioni
      for (const regione in group) {
        for (const matName in group[regione]) {
          const mat = group[regione][matName];
          allMaterialsArr.push({
            name: matName,
            ...mat,
            categoria: cat,
            regione: regione,
          });
        }
      }
    } else {
      // Gestione standard per altre categorie
      for (const matName in group) {
        const mat = group[matName];
        allMaterialsArr.push({
          name: matName,
          ...mat,
          categoria: cat,
        });
      }
    }
  }

  console.log(`📊 Totale materiali trovati: ${allMaterialsArr.length}`);

  // Applica filtri
  let filtered = allMaterialsArr;

  // Filtro ricerca
  const searchInput = document.getElementById("farmingSearchInput");
  if (searchInput && searchInput.value.trim() !== "") {
    const searchLower = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter((mat) =>
      mat.name.toLowerCase().includes(searchLower)
    );
    console.log(`🔍 Dopo filtro ricerca: ${filtered.length} materiali`);
  }

  // Filtro categoria
  const categoryFilter = document.getElementById("farmingCategoryFilter");
  if (categoryFilter && categoryFilter.value !== "") {
    filtered = filtered.filter((mat) => mat.categoria === categoryFilter.value);
    console.log(`📂 Dopo filtro categoria: ${filtered.length} materiali`);
  }

  // Filtro rarità
  const rarityFilter = document.getElementById("farmingRarityFilter");
  console.log("🔍 Controllando filtro rarità:", rarityFilter?.value);
  if (rarityFilter && rarityFilter.value !== "") {
    const rarityValue = parseInt(rarityFilter.value);
    filtered = filtered.filter((mat) => mat.rarita === rarityValue);
    console.log(`⭐ Dopo filtro rarità: ${filtered.length} materiali`);
  }

  // Filtro elementi
  const elementFilter = document.getElementById("farmingElementFilter");
  console.log("🔍 Controllando filtro elementi:", elementFilter);
  if (elementFilter) {
    console.log("📊 Display del filtro elementi:", elementFilter.style.display);
    console.log("📊 Valore del filtro elementi:", elementFilter.value);
  }
  if (elementFilter && elementFilter.value !== "") {
    const selectedElement = elementFilter.value;
    filtered = filtered.filter((mat) => {
      // Per i materiali condivisi, controlla se l'elemento selezionato è nella lista degli elementi
      if (mat.isShared && mat.elementi && Array.isArray(mat.elementi)) {
        return mat.elementi.includes(selectedElement);
      }
      // Per i materiali normali, usa la logica esistente
      return mat.elemento === selectedElement;
    });
    console.log(
      `🔥 Dopo filtro elemento (${selectedElement}): ${filtered.length} materiali`
    );
  }

  if (filtered.length === 0) {
    gallery.innerHTML =
      '<div style="color: #ff6f3c; text-align: center; grid-column: 1 / -1; font-size: 1.1rem; font-weight: 600; padding: 2rem;">Nessun materiale trovato.</div>';
    console.log("❌ Nessun materiale trovato dopo i filtri");
    return;
  }

  console.log(`🎨 Rendering ${filtered.length} materiali...`);

  filtered.forEach((mat, index) => {
    const card = document.createElement("div");
    card.className = "material-item";

    // Evidenzia se selezionato
    if (selectedMaterialsFarming.find((m) => m.name === mat.name)) {
      card.classList.add("selected-artifact-card");
      console.log(`✅ Materiale ${mat.name} già selezionato`);
    }

    card.style.cssText =
      "background: linear-gradient(135deg, rgba(10, 10, 26, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%); border: 2px solid transparent; border-radius: 12px; padding: 1rem; cursor: pointer; text-align: center; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); min-height: 180px; width: 100%;";

    const imageUrl =
      mat.immagine || mat.image || "images/characters/placeholder.svg";
    const escapedName = mat.name.replace(/'/g, "\\'").replace(/"/g, '\\"');

    card.innerHTML = `
      <img src="${imageUrl}" alt="${
      mat.name
    }" class="material-image" style="width:60px;height:60px;border-radius:8px;object-fit:cover;border:2px solid rgba(100,255,218,0.3);cursor:pointer;" onerror="this.src='images/characters/placeholder.svg'">
      <div class="material-info" style="width: 100%;">
        <div class="material-name" style="color: #e0e0e0; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.3rem; text-align: center; word-wrap: break-word; line-height: 1.3; max-width: 100%;">${
          mat.name
        }</div>
        <div style="margin:0.3em 0 0.5em 0;">
          <a href="#" class="material-desc-link" style="color:#64ffda;font-size:0.85em;text-decoration:underline;cursor:pointer;" 
             data-image="${imageUrl}"
             data-name="${escapedName}"
             data-description="${(
               mat.descrizione || "Nessuna descrizione disponibile"
             ).replace(/"/g, '\\"')}"
             onclick="event.stopPropagation(); openMaterialDescFromData(this); return false;">Leggi descrizione</a>
        </div>
        <div class="material-details" style="display: flex; flex-direction: column; gap: 0.2rem; align-items: center;">
          <div class="material-category" style="color: #64ffda; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; background: rgba(100, 255, 218, 0.1); padding: 0.3rem 0.5rem; border-radius: 4px; text-align: center; max-width: 120px; line-height: 1.1; display: flex; flex-direction: column; align-items: center; width: 100%;">
            ${getCategoryDisplayNameFormatted(mat.categoria)}
          </div>
          <span class="material-element" style="color: #b0eaff; font-size: 0.75rem; font-weight: 500;">${
            mat.isShared && mat.elementi
              ? mat.elementi.join(" / ")
              : mat.regione || mat.elemento || ""
          }</span>
          <span class="material-rarity" style="color: #ffd700; font-size: 0.8rem;">${"★".repeat(
            mat.rarita || 1
          )}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", function () {
      console.log("🖱️ Cliccato su materiale:", mat.name);
      toggleMaterialSelection(mat);
      renderMaterialsGallery(); // Aggiorna la galleria per riflettere la selezione
    });

    gallery.appendChild(card);
  });

  console.log(
    `✅ Rendering completato: ${filtered.length} materiali visualizzati`
  );
}

// Funzione per convertire i nomi delle categorie in formato leggibile
function getCategoryDisplayNameFormatted(categoryKey) {
  const categoryNames = {
    materiali_ascensione_personaggi: "Ascensione<br>Personaggi<br>📈",
    materiali_esperienza: "Materiali<br>Esperienza<br>📚",
    materiali_ascensione_armi: "Ascensione<br>Armi<br>⚔️",
    materiali_talenti: "Materiali<br>Talenti<br>🎯",
    materiali_speciali: "Materiali<br>Speciali<br>💎",
    materiali_locali: "Materiali<br>Locali<br>🗺️",
  };

  return categoryNames[categoryKey] || categoryKey;
}

// Funzione per aprire la descrizione materiale usando data attributes
function openMaterialDescFromData(element) {
  try {
    const image =
      element.getAttribute("data-image") || "images/characters/placeholder.svg";
    const name = element.getAttribute("data-name") || "Materiale";
    const description =
      element.getAttribute("data-description") ||
      "Nessuna descrizione disponibile";

    console.log("📖 Apertura descrizione materiale:", name);
    openMaterialImagePopup(image, name, description);
  } catch (e) {
    console.error("❌ Errore apertura descrizione:", e);
    alert("Errore nell'apertura della descrizione");
  }
}

// Setup event listeners per ricerca e filtri
function setupMaterialSearch() {
  console.log("🔍 Setup event listeners per ricerca e filtri...");

  const searchInput = document.getElementById("farmingSearchInput");
  const categoryFilter = document.getElementById("farmingCategoryFilter");
  const rarityFilter = document.getElementById("farmingRarityFilter");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      console.log("🔍 Ricerca cambiata:", this.value);
      renderMaterialsGallery();
    });
    console.log("✅ Event listener ricerca aggiunto");
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", function () {
      console.log("📂 Categoria cambiata:", this.value);
      renderMaterialsGallery();
    });
    console.log("✅ Event listener categoria aggiunto");
  }

  if (rarityFilter) {
    rarityFilter.addEventListener("change", function () {
      console.log("⭐ Rarità cambiata:", this.value);
      renderMaterialsGallery();
    });
    console.log("✅ Event listener rarità aggiunto");
  }
}

// Le funzioni per la gestione delle date sono già definite nel file
// Non aggiungiamo duplicati

// Funzioni per la gestione delle date
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

  const selectedDateElement = document.getElementById("selectedDate");
  if (selectedDateElement) {
    selectedDateElement.textContent = displayText;
  }
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatDateShort(date) {
  const options = { day: "numeric", month: "short" };
  return date.toLocaleDateString("it-IT", options);
}

function getTodayDateOnly() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function expandDailyTasksAuto() {
  const dailyTasksSection = document.querySelector(".daily-tasks");
  if (dailyTasksSection) {
    dailyTasksSection.classList.remove("expanded");
    void dailyTasksSection.offsetWidth;
    dailyTasksSection.classList.add("expanded");
  }
  // Mostra il pulsante 'Comprimi', nascondi 'Espandi'
  const expandBtn = document.getElementById("expandTasksBtn");
  const compressBtn = document.getElementById("compressTasksBtn");
  if (expandBtn) expandBtn.style.display = "none";
  if (compressBtn) compressBtn.style.display = "";
}

// Inizializzazione quando il DOM è caricato
window.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM caricato - Inizializzazione calendario");
  selectedDate = getTodayDateOnly();
  updateSelectedDateDisplay();
  loadTasksForDate(selectedDate);
  updateStats();
  console.log("✅ Calendario inizializzato");
});
