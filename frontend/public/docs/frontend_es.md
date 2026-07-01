# README del Frontend

## Descripción general

El frontend es una aplicación de página única **React + TypeScript + Vite** construida alrededor de un espacio de trabajo colaborativo con estilo de panel.

Proporciona la experiencia de usuario para:

- flujos de autenticación
- visualización del perfil
- organizaciones
- proyectos y tareas
- documentos y biblioteca de archivos
- calendario y alertas
- ajustes
- chat directo y chat flotante
- páginas de documentación orientadas a desarrolladores

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
- nginx (ruta de servido en contenedor)

---

## Puntos de entrada principales

```text
frontend/src/main.tsx
frontend/src/App.tsx
```

La aplicación del panel monta distintas áreas como:

- perfil
- proyectos
- tareas
- chat
- documentos
- biblioteca de archivos
- ajustes
- páginas docs / how-to-use

---

## Principales áreas de UI

### Dashboard
El dashboard agrega las páginas principales de la aplicación y mantiene el estado del espacio de trabajo conectado mediante almacenamiento local y el proveedor WebSocket.

### Perfil
Muestra la información del perfil del usuario, avatar y amigos.

### Proyectos / Tareas
Muestra la estructura de los proyectos, sus estados y el contenido relacionado con las tareas.

### Chat
Usa el contexto compartido de WebSocket para gestionar interacciones en tiempo real, ventanas de chat flotantes y carga del historial.

### Biblioteca de archivos
Gestiona los flujos de interfaz para carga, acceso y navegación de archivos con alcance de organización/proyecto.

### Páginas de documentación
El frontend incluye páginas de documentación interna para la guía del proyecto y la visualización de documentación basada en markdown.

---

## Integración en tiempo real

El frontend utiliza un contexto WebSocket dedicado:

```text
frontend/src/utilities/WebSocketContext.tsx
```

Este contexto gestiona:

- ciclo de vida de la conexión
- actualizaciones de presencia de amigos
- mensajes directos
- solicitudes pendientes
- carga de grupos
- eventos de refresco del calendario
- estado de las ventanas de chat

---

## Desarrollo local

### Instalación

```bash
cd frontend
npm install
```

### Iniciar servidor de desarrollo

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Vista previa de la build de producción

```bash
npm run preview
```

---

## Enrutado

Las rutas principales incluyen actualmente:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/docs`
- `/docs/:slug`
- `/how-to-use`

---

## Estilo

La interfaz se apoya en Tailwind CSS además de hojas de estilo específicas del proyecto.

Objetivos del sistema visual:

- diseño de dashboard adaptable
- navegación del espacio de trabajo limpia
- componentes reutilizables
- densidad de información legible para gestión de proyectos/tareas
- integración de gráficos, calendarios y superposiciones de chat

---

## Notas sobre contenedores

El frontend tiene su propio Dockerfile multi-stage:

```text
frontend/Dockerfile
```

La imagen de producción:

1. instala dependencias
2. construye la aplicación Vite
3. copia la salida compilada a nginx
4. sirve la app como sitio estático

Configuración de nginx:

```text
frontend/default.conf
```

---

## Responsabilidades conocidas del frontend por miembro del equipo

Implementación principal del frontend:
- **Manuel Chiaramello (`mchiaram`)**
- **Ansi Osmenaj (`aosmenaj`)**

Énfasis específico:
- **Ansi Osmenaj** se centró especialmente en las secciones relacionadas con carga/descarga de archivos y en detalles de la arquitectura frontend.
- **Manuel Chiaramello** combinó el desarrollo frontend con la coordinación del proyecto y el trabajo de sincronización.

---

## Notas

Este frontend está diseñado como la capa orientada al usuario de un espacio de trabajo colaborativo y no como una interfaz orientada a juegos. Su estructura refleja el enfoque del proyecto en:

- organizaciones
- proyectos
- tareas
- archivos
- chat
- notificaciones
- flujos de productividad centrados en dashboard
