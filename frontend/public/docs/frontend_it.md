# README Frontend

## Panoramica

Il frontend è una single-page application **React + TypeScript + Vite** costruita attorno a un workspace collaborativo in stile dashboard.

Fornisce l'esperienza utente per:

- flussi di autenticazione
- visualizzazione del profilo
- organizzazioni
- progetti e task
- documenti e libreria file
- calendario e avvisi
- impostazioni
- chat diretta e floating chat
- pagine di documentazione rivolte agli sviluppatori

---

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Chart.js
- FullCalendar / react-big-calendar
- lucide-react
- react-markdown
- nginx (percorso di serving nel container)

---

## Punti di ingresso principali

```text
frontend/src/main.tsx
frontend/src/App.tsx
```

L'applicazione dashboard monta diverse aree, come:

- profilo
- progetti
- task
- chat
- documenti
- libreria file
- impostazioni
- pagine docs / how-to-use

---

## Principali aree UI

### Dashboard
La dashboard aggrega le pagine principali dell'applicazione e mantiene lo stato del workspace collegato tramite local storage e il provider WebSocket.

### Profilo
Mostra informazioni profilo utente, avatar e amici.

### Progetti / Task
Mostra la struttura dei progetti, gli stati e i contenuti legati ai task.

### Chat
Usa il WebSocket context condiviso per gestire interazioni realtime, finestre di chat floating e caricamento della cronologia.

### Libreria file
Gestisce i flussi UI per upload, accesso e navigazione dei file in ambito organizzazione/progetto.

### Pagine di documentazione
Il frontend include pagine di documentazione interna per la guida del progetto e la visualizzazione di documenti markdown.

---

## Integrazione realtime

Il frontend usa un WebSocket context dedicato:

```text
frontend/src/utilities/WebSocketContext.tsx
```

Questo context gestisce:

- ciclo di vita della connessione
- aggiornamenti di presenza degli amici
- messaggi diretti
- richieste pendenti
- caricamento gruppi
- eventi di refresh del calendario
- stato delle finestre chat

---

## Sviluppo locale

### Installazione

```bash
cd frontend
npm install
```

### Avvio server di sviluppo

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview della build di produzione

```bash
npm run preview
```

---

## Routing

Le route principali attualmente includono:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/docs`
- `/docs/:slug`
- `/how-to-use`

---

## Stile

L'interfaccia si basa su Tailwind CSS più stylesheet specifici del progetto.

Obiettivi del sistema visivo:

- layout dashboard responsive
- navigazione workspace pulita
- componenti riutilizzabili
- densità informativa leggibile per la gestione di progetti/task
- integrazione di grafici, calendari e overlay chat

---

## Note sui container

Il frontend ha un proprio Dockerfile multi-stage:

```text
frontend/Dockerfile
```

L'immagine di produzione:

1. installa le dipendenze
2. esegue la build dell'app Vite
3. copia l'output compilato in nginx
4. serve l'app come sito statico

Configurazione nginx:

```text
frontend/default.conf
```

---

## Responsabilità frontend note per membro del team

Implementazione frontend principale:
- **Manuel Chiaramello (`mchiaram`)**
- **Ansi Osmenaj (`aosmenaj`)**

Focus specifico:
- **Ansi Osmenaj** si è concentrato in particolare sulle sezioni legate a upload/download file e sui dettagli dell'architettura frontend.
- **Manuel Chiaramello** ha combinato sviluppo frontend con coordinamento del progetto e lavoro di sincronizzazione.

---

## Note

Questo frontend è progettato come livello user-facing di un workspace collaborativo piuttosto che come interfaccia orientata al gioco. La sua struttura riflette il focus del progetto su:

- organizzazioni
- progetti
- task
- file
- chat
- notifiche
- flussi dashboard orientati alla produttività
