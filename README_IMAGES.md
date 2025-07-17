# 🖼️ Sistema Immagini Personaggi Genshin Impact

## ✨ Funzionalità

Il sistema ora supporta immagini personalizzate per ogni personaggio di Genshin Impact, con:

- **Immagini predefinite**: Caricate automaticamente dal file `character.json`
- **Immagini personalizzate**: Caricabili dall'utente tramite interfaccia
- **Fallback automatico**: Emoji dell'elemento se l'immagine non è disponibile
- **Gestione completa**: Carica, rimuovi e modifica immagini

## 🎯 Come Usare

### 1. Caricare un'Immagine Personalizzata

1. Vai alla **Galleria Personaggi**
2. Passa il mouse sopra l'immagine di un personaggio
3. Clicca sul pulsante **📷** (Carica immagine)
4. Seleziona un'immagine dal tuo computer
5. L'immagine verrà salvata automaticamente

### 2. Rimuovere un'Immagine Personalizzata

1. Passa il mouse sopra l'immagine del personaggio
2. Clicca sul pulsante **🗑️** (Rimuovi immagine)
3. L'immagine verrà rimossa e tornerà l'emoji di fallback

### 3. Aggiungere Immagini Predefinite

Per aggiungere immagini predefinite per tutti gli utenti:

1. Aggiungi le immagini nella cartella `images/characters/`
2. Usa il formato: `nome-personaggio.png` (es: `albedo.png`, `hu-tao.png`)
3. Aggiorna il file `character.json` con il percorso dell'immagine

## 📁 Struttura File

```
web-app genshin.me/
├── images/
│   └── characters/
│       ├── albedo.png
│       ├── amber.png
│       ├── barbara.png
│       ├── diluc.png
│       ├── fischl.png
│       ├── ganyu.png
│       ├── hu-tao.png
│       ├── jean.png
│       ├── kaeya.png
│       ├── klee.png
│       ├── lisa.png
│       ├── mona.png
│       ├── noelle.png
│       ├── qiqi.png
│       ├── razor.png
│       ├── sucrose.png
│       ├── venti.png
│       ├── xiangling.png
│       ├── xingqiu.png
│       └── zhongli.png
├── character.json
├── index.html
├── script.js
└── style.css
```

## 🎨 Specifiche Immagini

### Formato Consigliato

- **Estensione**: PNG o JPG
- **Sfondo**: Trasparente (preferibilmente)
- **Dimensioni**: 200x200 pixel o più grandi
- **Qualità**: Alta risoluzione

### Naming Convention

- **Formato**: `nome-personaggio.png`
- **Esempi**:
  - `albedo.png`
  - `hu-tao.png`
  - `raiden-shogun.png`
  - `kamisato-ayaka.png`

## 💾 Salvataggio Dati

### Immagini Personalizzate

- Salvate in `localStorage` come base64
- Chiave: `character_image_nome_personaggio`
- Persistono tra le sessioni del browser

### Fallback Automatico

Se un'immagine non viene trovata:

1. Prova l'immagine personalizzata
2. Prova l'immagine predefinita
3. Mostra l'emoji dell'elemento

## 🔧 Personalizzazione CSS

### Stili Principali

```css
.character-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--genshin-gold);
  box-shadow: var(--shadow-medium);
  transition: all 0.3s ease;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.character-image-container:hover .image-actions {
  opacity: 1;
}
```

### Animazioni

- **Hover**: Scale 1.1 e glow effect
- **Caricamento**: Fade in
- **Pulsanti**: Appaiono al hover

## 🚀 Funzionalità Avanzate

### Gestione Errori

- Fallback automatico se l'immagine non carica
- Notifiche per successo/errore
- Validazione formato file

### Performance

- Immagini ottimizzate
- Lazy loading
- Cache in localStorage

### Responsive Design

- Immagini scalabili
- Layout adattivo
- Touch-friendly su mobile

## 🎮 Integrazione con il Sistema

### Galleria Personaggi

- Visualizzazione con immagini
- Filtri funzionanti
- Ordinamento mantenuto

### Selezione Personaggio

- Dropdown con immagini
- Selezione rapida
- Dettagli completi

### Gestione Dati

- Salvataggio automatico
- Sincronizzazione
- Backup locale

## 🔄 Aggiornamenti Futuri

- [ ] Supporto per GIF animate
- [ ] Editor immagini integrato
- [ ] Galleria immagini predefinite
- [ ] Esportazione/importazione batch
- [ ] Ottimizzazione automatica immagini
- [ ] Supporto per temi personalizzati

## 📝 Note Tecniche

### Browser Support

- Chrome/Edge: ✅ Completo
- Firefox: ✅ Completo
- Safari: ✅ Completo
- Mobile: ✅ Responsive

### Limitazioni

- Dimensioni localStorage (~5-10MB)
- Formati supportati: PNG, JPG, GIF
- Dimensioni massime: 5MB per immagine

### Sicurezza

- Validazione file lato client
- Sanitizzazione nomi file
- Controllo dimensioni

---

**🎉 Il sistema è ora completamente funzionale! Prova a caricare le tue immagini personalizzate!**
