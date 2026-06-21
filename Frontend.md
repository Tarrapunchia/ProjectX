### Pagina di login

* Nome utente
* Password
* Google login
* Creazione account
* Password dimenticata





### Pagina dei progetti

* New/in progress/completed/stand by
* Lista dei progetti ai quali sono iscritto
* Progetti divisi per riquadri (?)
* Barra progressione progetto
* data iscrizione
* data fine termine
* Nome del capo progetto




### Pagina del progetto

* Dashboard
* Task
* Chat
* File download/upload


* OVERLAY PROGETTO
- Specifiche tecniche
- prerequisiti (best practices, tools)
- referente progetto

* CREAZIONE PROGETTO
- modifiche del testo (font-size, colori, ...)
- immagini(?)



### Pagina del profilo

* Foto profilo
* Descrizione
* progetti completati
* dati personali (email, cognome, nome etc...)
* lista amici


### Barra di ricerca

* Ricerca di utenti e organizzazioni (eventualmente progetti)


### Pagina utente ricercato

* Simile alla pagina profilo personale ma con meno informazioni
* Tasti: richiesta amicizia/rimuovi amicizia, blocca utente


### Settings

* cancellare utente




## Chat

* chat a "pallini"

// to do: dashboard alla jira

. calendario: deadline task (colore unico, con finestra al hover), eventi (meeting, codereview) in alto a sinistra

. grafico a torta sulla priorità delle task in basso a sinistra

. tutte le nitifiche elencate tutto a destra



## Fixes
* sistemare team chat: quando si riceve un messaggio non printa la mail del sender

## Per Fabio

* avatarUrl sui gruppi per personalizzare l'immagine del gruppo

* capire quale id utilizzare per mandare un messaggio e scaricare la history di una chat di gruppo

* aggiungere nel messaggio, che viene mandato ad entrambi gli utenti quando viene accettata la richiesta di amicizia, i dati degli utenti sotto forma di:

export interface Friend {
	id: number;
	name: string;
	surname: string;
	email: string;
	jobQualifier: string;
	isLoggedIn: boolean;
	avatarUrl: string;
}

* Task e progetti dovrebbero ritornare i seguenti valori dalla chiamata API

export type Project = {
	id: string,
	name: string,
	status: 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'TODO',
	description: string,
	createdAt: Date,
	closedAt: Date | null,
	tasks: Task[]
}

export type Task = {
	id: string,
	name: string,
	status: 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'TODO',
	description: string,
	priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
	createdAt: Date,
	dueDate: Date | null,
	closedAt: Date | null,
	projectId: string,
}






* le API groups/joined e groups/{id} ritornano 2 valori diversi

	- groups/joined:

	{
	"success": true,
	"groups": [
		{
		"userId": 0,
		"groupId": 0,
		"createdAt": "2026-06-21T17:26:41.536Z",
		"group": {
			"id": 0,
			"name": "string",
			"description": "Unknown Type: null,string",
			"createdAt": "2026-06-21T17:26:41.536Z",
			"closedAt": "Unknown Type: null,string",
			"participants": [
			{
				"userId": 0,
				"groupId": 0,
				"createdAt": "2026-06-21T17:26:41.536Z",
				"user": {
				"id": 0,
				"name": "string",
				"surname": "string",
				"email": "user@example.com",
				"avatarUrl": "string",
				"isLoggedIn": true
				}
			}
			]
		}
		}
	]
	}



	- groups/{id}:

	{
	"id": 0,
	"name": "string",
	"participants": [
		{
		"id": 0,
		"name": "string",
		"surname": "string",
		"email": "string",
		"joinedAt": "2026-06-21T17:28:45.618Z"
		}
	],
	"chatRoom": {
		"id": "string",
		"key": "string",
		"type": "string"
	}
	}



	- Cosa dovrebbero ritornare entrambe

	{
	"success": true,
	"groups": [
		{
		"group": {
			"id": 0,
			"name": "string",
			"description": "Unknown Type: null,string",
			"createdAt": "2026-06-21T17:26:41.536Z",
			"participants": [
			{
				"joinedAt": "2026-06-21T17:26:41.536Z",
				"user": {
				"id": 0,
				"name": "string",
				"surname": "string",
				"email": "user@example.com",
				"avatarUrl": "string",
				"isLoggedIn": true
				}
			}
			]
		}
		}
	]
	}