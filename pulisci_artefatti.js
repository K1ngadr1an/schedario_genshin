const fs = require("fs");

const file = "artefatti.json";

function cleanString(str) {
  if (!str) return "";
  // Rimuove caratteri di controllo, spazi all'inizio/fine, caratteri non stampabili
  return str
    .replace(/[^\x20-\x7EÀ-ÿ’“”°·–—…]/g, "") // solo caratteri leggibili + accenti
    .replace(/\s+/g, " ") // sostituisce spazi multipli con uno solo
    .trim();
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));

data.artifacts.forEach((art) => {
  if (art.setBonus) {
    if (art.setBonus["2pc"])
      art.setBonus["2pc"] = cleanString(art.setBonus["2pc"]);
    if (art.setBonus["4pc"])
      art.setBonus["4pc"] = cleanString(art.setBonus["4pc"]);
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), { encoding: "utf8" });

console.log("Pulizia completata! Tutti i bonus 2pc/4pc sono ora puliti.");
