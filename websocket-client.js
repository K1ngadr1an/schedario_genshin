// Client WebSocket per sincronizzazione in tempo reale
class WebSocketSync {
  constructor(serverUrl = "ws://192.168.1.12:8765") {
    this.serverUrl = serverUrl;
    this.websocket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // 2 secondi
    this.pingInterval = null;
    this.deviceId = this.generateDeviceId();

    // Callbacks per gli eventi
    this.onDataReceived = null;
    this.onConnectionChange = null;
    this.onError = null;

    console.log("🔌 WebSocket Sync inizializzato per:", serverUrl);
  }

  // Genera un ID univoco per il dispositivo
  generateDeviceId() {
    return (
      "device_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // Connette al server WebSocket
  connect() {
    try {
      console.log("🔌 Tentativo di connessione WebSocket...");
      this.websocket = new WebSocket(this.serverUrl);

      this.websocket.onopen = (event) => {
        console.log("✅ WebSocket connesso!");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Avvia il ping per mantenere la connessione attiva
        this.startPing();

        // Richiedi sincronizzazione iniziale
        this.requestSync();

        if (this.onConnectionChange) {
          this.onConnectionChange(true);
        }
      };

      this.websocket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.websocket.onclose = (event) => {
        console.log("❌ WebSocket disconnesso:", event.code, event.reason);
        this.isConnected = false;
        this.stopPing();

        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }

        // Tentativo di riconnessione automatica
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error("❌ Errore WebSocket:", error);
        if (this.onError) {
          this.onError(error);
        }
      };
    } catch (error) {
      console.error("❌ Errore nella connessione WebSocket:", error);
      this.attemptReconnect();
    }
  }

  // Gestisce i messaggi ricevuti dal server
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log("📨 Messaggio ricevuto:", message.type);

      switch (message.type) {
        case "sync_data":
          this.handleSyncData(message.data);
          break;

        case "character_updated":
          this.handleCharacterUpdate(message.character, message.data);
          break;

        case "pong":
          console.log("🏓 Pong ricevuto");
          break;

        default:
          console.log("❓ Tipo messaggio sconosciuto:", message.type);
      }
    } catch (error) {
      console.error("❌ Errore nel parsing del messaggio:", error);
    }
  }

  // Gestisce i dati di sincronizzazione ricevuti
  handleSyncData(data) {
    console.log("🔄 Dati di sincronizzazione ricevuti:", Object.keys(data));

    // Applica i dati ricevuti al localStorage
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value && typeof value === "object") {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`💾 Dato sincronizzato: ${key}`);
      }
    });

    // Notifica l'applicazione
    if (this.onDataReceived) {
      this.onDataReceived(data);
    }

    // Ricarica i dati se siamo in una pagina di dettaglio
    this.reloadCharacterData();
  }

  // Gestisce l'aggiornamento di un personaggio
  handleCharacterUpdate(characterName, characterData) {
    console.log(`🔄 Aggiornamento personaggio ricevuto: ${characterName}`);

    // Salva i dati nel localStorage
    const key = `character_detail_${characterName}`;
    localStorage.setItem(key, JSON.stringify(characterData));

    // Ricarica i dati se siamo nella pagina del personaggio aggiornato
    this.reloadCharacterData(characterName);
  }

  // Ricarica i dati del personaggio se necessario
  reloadCharacterData(characterName = null) {
    // Se siamo in una pagina di dettaglio, ricarica i dati
    if (window.location.pathname.includes("dettaglio.html")) {
      const urlParams = new URLSearchParams(window.location.search);
      const currentCharacter = urlParams.get("character");

      if (!characterName || currentCharacter === characterName) {
        console.log("🔄 Ricaricamento dati personaggio...");

        // Ricarica i dati se la funzione esiste
        if (typeof loadCharacterDetailData === "function") {
          loadCharacterDetailData(currentCharacter);
        }

        // Mostra notifica di sincronizzazione
        if (typeof showToast === "function") {
          showToast("🔄 Dati sincronizzati in tempo reale!", "success");
        }
      }
    }
  }

  // Invia aggiornamento di un personaggio
  sendCharacterUpdate(characterName, characterData) {
    if (!this.isConnected) {
      console.warn(
        "⚠️ WebSocket non connesso, impossibile inviare aggiornamento"
      );
      return false;
    }

    const message = {
      type: "character_update",
      character: characterName,
      data: characterData,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.websocket.send(JSON.stringify(message));
      console.log(`📤 Aggiornamento inviato per: ${characterName}`);
      return true;
    } catch (error) {
      console.error("❌ Errore nell'invio dell'aggiornamento:", error);
      return false;
    }
  }

  // Richiede sincronizzazione al server
  requestSync() {
    if (!this.isConnected) {
      console.warn(
        "⚠️ WebSocket non connesso, impossibile richiedere sincronizzazione"
      );
      return;
    }

    const message = {
      type: "request_sync",
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.websocket.send(JSON.stringify(message));
      console.log("📤 Richiesta sincronizzazione inviata");
    } catch (error) {
      console.error("❌ Errore nella richiesta di sincronizzazione:", error);
    }
  }

  // Avvia il ping per mantenere la connessione attiva
  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        const message = {
          type: "ping",
          deviceId: this.deviceId,
          timestamp: new Date().toISOString(),
        };

        try {
          this.websocket.send(JSON.stringify(message));
        } catch (error) {
          console.error("❌ Errore nel ping:", error);
        }
      }
    }, 30000); // Ping ogni 30 secondi
  }

  // Ferma il ping
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Tentativo di riconnessione automatica
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Tentativo di riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error(
        "❌ Numero massimo di tentativi di riconnessione raggiunto"
      );
    }
  }

  // Disconnette dal server
  disconnect() {
    if (this.websocket) {
      this.stopPing();
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
      console.log("🔌 WebSocket disconnesso manualmente");
    }
  }

  // Ottiene lo stato della connessione
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      deviceId: this.deviceId,
    };
  }
}

// Istanza globale del client WebSocket
let webSocketSync = null;

// Funzione per inizializzare la sincronizzazione WebSocket
function initializeWebSocketSync() {
  if (window.webSocketSync) {
    window.webSocketSync.disconnect();
  }

  window.webSocketSync = new WebSocketSync();

  // Configura i callback
  window.webSocketSync.onConnectionChange = (isConnected) => {
    console.log(
      isConnected ? "✅ WebSocket connesso" : "❌ WebSocket disconnesso"
    );
    updateSyncStatus(isConnected);

    // Se si disconnette, riprova automaticamente dopo 5 secondi
    if (!isConnected) {
      console.log("🔄 Riprovo connessione tra 5 secondi...");
      setTimeout(() => {
        if (window.webSocketSync && !window.webSocketSync.isConnected) {
          console.log("🔄 Tentativo di riconnessione automatica...");
          window.webSocketSync.connect();
        }
      }, 5000);
    }
  };

  window.webSocketSync.onDataReceived = (data) => {
    console.log("📨 Dati ricevuti via WebSocket");
  };

  window.webSocketSync.onError = (error) => {
    console.error("❌ Errore WebSocket:", error);
    // Riprova automaticamente dopo 10secondi in caso di errore
    setTimeout(() => {
      if (window.webSocketSync && !window.webSocketSync.isConnected) {
        console.log("🔄 Riprovo dopo errore...");
        window.webSocketSync.connect();
      }
    }, 10000);
  };

  // Connette al server
  window.webSocketSync.connect();
}

// Funzione per aggiornare lo stato di sincronizzazione nell'interfaccia
function updateSyncStatus(isConnected) {
  const statusElement = document.getElementById("syncStatus");
  if (statusElement) {
    statusElement.textContent = isConnected
      ? "🟢 Sincronizzato"
      : "🔴 Disconnesso";
    statusElement.className = isConnected
      ? "sync-connected"
      : "sync-disconnected";
  }
}

// Funzione per inviare aggiornamento di un personaggio
function syncCharacterData(characterName, characterData) {
  if (window.webSocketSync && window.webSocketSync.isConnected) {
    return window.webSocketSync.sendCharacterUpdate(
      characterName,
      characterData
    );
  }
  return false;
}

// Esporta le funzioni globalmente
window.WebSocketSync = WebSocketSync;
window.initializeWebSocketSync = initializeWebSocketSync;
window.syncCharacterData = syncCharacterData;
window.webSocketSync = webSocketSync;

// Avvia la sincronizzazione WebSocket automaticamente all'avvio della pagina
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Avvio automatico WebSocket...");
  initializeWebSocketSync();

  // Se dopo 3 secondi non è connesso, riprova
  setTimeout(() => {
    if (window.webSocketSync && !window.webSocketSync.isConnected) {
      console.log("🔄 Prima connessione fallita, riprovo...");
      window.webSocketSync.connect();
    }
  }, 3000);
});
