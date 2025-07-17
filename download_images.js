// Script per scaricare le immagini dei personaggi
// Esegui questo script nel browser per scaricare tutte le immagini

async function downloadCharacterImages() {
  console.log("🚀 Iniziando il download delle immagini...");

  try {
    // Carica il JSON dei personaggi
    const response = await fetch("character.json");
    const data = await response.json();
    const characters = data.characters;

    console.log(`📋 Trovati ${characters.length} personaggi`);

    // Crea la cartella se non esiste (il browser non può farlo, ma almeno prepariamo i nomi)
    console.log("📁 Preparando i nomi file per la cartella images/characters/");

    const downloadPromises = characters.map(async (character) => {
      try {
        // Estrai il nome del personaggio dall'URL
        const urlParts = character.image.split("/");
        const characterSlug = urlParts[urlParts.length - 2]; // Prende la parte prima di /image.png

        // Crea il nome file locale
        const localFileName = `${characterSlug}.png`;

        console.log(`⬇️ Scaricando ${character.name} -> ${localFileName}`);

        // Scarica l'immagine
        const imgResponse = await fetch(character.image);
        if (!imgResponse.ok) {
          throw new Error(
            `HTTP ${imgResponse.status}: ${imgResponse.statusText}`
          );
        }

        const blob = await imgResponse.blob();

        // Crea un link per il download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = localFileName;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log(`✅ ${character.name} scaricato come ${localFileName}`);

        return {
          character: character.name,
          fileName: localFileName,
          success: true,
        };
      } catch (error) {
        console.error(`❌ Errore nel download di ${character.name}:`, error);
        return {
          character: character.name,
          error: error.message,
          success: false,
        };
      }
    });

    const results = await Promise.all(downloadPromises);

    // Mostra i risultati
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log("\n📊 RISULTATI DOWNLOAD:");
    console.log(`✅ Scaricati con successo: ${successful.length}`);
    console.log(`❌ Falliti: ${failed.length}`);

    if (successful.length > 0) {
      console.log("\n📁 File scaricati:");
      successful.forEach((result) => {
        console.log(`   - ${result.fileName} (${result.character})`);
      });
    }

    if (failed.length > 0) {
      console.log("\n❌ Download falliti:");
      failed.forEach((result) => {
        console.log(`   - ${result.character}: ${result.error}`);
      });
    }

    console.log("\n📋 ISTRUZIONI:");
    console.log(
      "1. I file sono stati scaricati nella cartella Downloads del browser"
    );
    console.log(
      "2. Sposta tutti i file .png nella cartella images/characters/ del tuo progetto"
    );
    console.log(
      '3. Aggiorna il campo "image" nel character.json da URL a nome file (es: "albedo.png")'
    );
  } catch (error) {
    console.error("❌ Errore generale:", error);
  }
}

// Funzione per aggiornare il JSON con i nomi file locali
function updateJSONWithLocalImages() {
  console.log("🔄 Aggiornamento JSON con nomi file locali...");

  fetch("character.json")
    .then((response) => response.json())
    .then((data) => {
      const updatedCharacters = data.characters.map((character) => {
        // Estrai il nome del personaggio dall'URL
        const urlParts = character.image.split("/");
        const characterSlug = urlParts[urlParts.length - 2];
        const localFileName = `${characterSlug}.png`;

        return {
          ...character,
          image: localFileName,
        };
      });

      const updatedData = {
        ...data,
        characters: updatedCharacters,
      };

      // Crea il file JSON aggiornato per il download
      const jsonBlob = new Blob([JSON.stringify(updatedData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "character_updated.json";
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log("✅ JSON aggiornato scaricato come character_updated.json");
      console.log(
        "📋 Sostituisci il tuo character.json con questo file aggiornato"
      );
    })
    .catch((error) => {
      console.error("❌ Errore nell'aggiornamento JSON:", error);
    });
}

// Aggiungi i pulsanti alla pagina
function addDownloadButtons() {
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: rgba(32, 40, 58, 0.95);
    padding: 15px;
    border-radius: 10px;
    border: 2px solid #64ffda;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  `;

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "⬇️ Scarica Immagini";
  downloadBtn.style.cssText = `
    background: linear-gradient(135deg, #64ffda, #00d4aa);
    color: #16213e;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    margin-right: 10px;
  `;
  downloadBtn.onclick = downloadCharacterImages;

  const updateJSONBtn = document.createElement("button");
  updateJSONBtn.textContent = "🔄 Aggiorna JSON";
  updateJSONBtn.style.cssText = `
    background: linear-gradient(135deg, #ffd700, #ffb347);
    color: #16213e;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  `;
  updateJSONBtn.onclick = updateJSONWithLocalImages;

  buttonContainer.appendChild(downloadBtn);
  buttonContainer.appendChild(updateJSONBtn);
  document.body.appendChild(buttonContainer);

  console.log("🎛️ Pulsanti di download aggiunti in alto a destra");
}

// Esegui quando la pagina è caricata
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addDownloadButtons);
} else {
  addDownloadButtons();
}

console.log("🚀 Script di download immagini caricato!");
console.log("📋 Usa i pulsanti in alto a destra per:");
console.log("   1. Scaricare tutte le immagini");
console.log("   2. Aggiornare il JSON con i nomi file locali");
