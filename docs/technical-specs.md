# Especificaciones Técnicas — Notes Web App

**Última actualización:** 2026-10-10

---

## Arquitectura

Monorepo con dos paquetes y un `package.json` raíz que los orquesta.

```
notes-web/
├── backend/src/
│   ├── app.js            # Express: middleware, rutas, estáticos en producción
│   ├── config/           # Pool de pg + scripts SQL
│   ├── controllers/      # Lógica por recurso
│   ├── middleware/       # auth (JWT) y validation (express-validator)
│   ├── models/           # SQL directo con pg (sin ORM)
│   └── routes/
├── frontend/src/
│   ├── components/       # Auth, Notes, Editor, Connections, Attachments, Search, Tags, Layout, UI
│   ├── pages/            # AuthPage, DashboardPage, NoteViewPage, NoteEditPage
│   ├── hooks/            # useAuth, useDebounce
│   ├── services/         # Axios + un servicio por recurso
│   ├── utils/            # helpers, markdownPaste
│   └── index.css         # Todo el sistema de diseño
├── docs/
├── railway.json
└── setup-database.js     # Ejecuta database-init.sql
```

En producción un solo proceso Express sirve la API y el build de React. En desarrollo el frontend
(puerto 3000) usa el `proxy` de `frontend/package.json` hacia el backend (puerto 3001).

### Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Express 4, `pg`, `jsonwebtoken`, `bcryptjs`, `express-validator`, `express-rate-limit`, `helmet`, `multer` |
| Frontend | React 18 (Create React App), React Router v6, `react-quill` 2 (Quill 1.3.7), `marked`, `dompurify`, Axios |
| Base de datos | PostgreSQL |
| Hosting | Railway (app + BD) |

Lenguaje: JavaScript, sin TypeScript.

---

## Base de Datos

Scripts en `backend/src/config/`, a ejecutar en orden: `database-init.sql` y luego
`migration-privacy.sql`. Todas las claves primarias son `UUID` con `gen_random_uuid()`.

### `users`
| Columna | Tipo |
|---|---|
| `id` | UUID PK |
| `email` | VARCHAR(255) UNIQUE NOT NULL |
| `password_hash` | VARCHAR(255) NOT NULL |
| `name` | VARCHAR(255) |
| `created_at`, `updated_at` | TIMESTAMP |

### `notes`
| Columna | Tipo |
|---|---|
| `id` | UUID PK |
| `user_id` | UUID → `users` ON DELETE CASCADE |
| `title` | VARCHAR(500) NOT NULL |
| `summary` | TEXT |
| `content` | TEXT (HTML del editor) |
| `tags` | TEXT[] |
| `images` | JSONB |
| `is_private` | BOOLEAN DEFAULT false |
| `created_at`, `updated_at` | TIMESTAMP |

### `connections`
| Columna | Tipo |
|---|---|
| `id` | UUID PK |
| `source_note_id`, `target_note_id` | UUID → `notes` ON DELETE CASCADE |
| `connection_type` | VARCHAR(50), CHECK: `relacionado`, `contradice`, `ejemplifica`, `inspira`, `causa_efecto`, `parte_de` |
| `created_at` | TIMESTAMP |

`UNIQUE(source_note_id, target_note_id, connection_type)`.

### `attachments`
| Columna | Tipo |
|---|---|
| `id` | UUID PK |
| `note_id` | UUID → `notes` ON DELETE CASCADE |
| `filename` | VARCHAR(255) — nombre único en disco |
| `original_filename` | VARCHAR(255) |
| `file_path` | VARCHAR(500) |
| `file_size` | INTEGER |
| `mime_type` | VARCHAR(100) |
| `uploaded_by` | UUID → `users` |
| `created_at` | TIMESTAMP |

### Índices y triggers
- GIN de texto completo (`spanish`) sobre `title`, `content` y `summary`; GIN sobre `tags`.
- `idx_notes_user_id`, `idx_notes_is_private`, `idx_notes_user_private (user_id, is_private)`.
- `idx_connections_source`, `idx_connections_target`, `idx_attachments_note_id`,
  `idx_attachments_uploaded_by`.
- Trigger `update_updated_at_column` en `users` y `notes`.

---

## API

Base `/api`. Todas las rutas requieren `Authorization: Bearer <token>` salvo registro y login.
Las respuestas de auth, notas y conexiones usan `{ success, message, data }`; las de adjuntos usan
`{ error }` en los fallos.

### Auth — `/api/auth`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Crea usuario y devuelve token |
| POST | `/login` | Devuelve token |
| GET | `/profile` | Perfil del usuario |
| PUT | `/profile` | Actualiza perfil |

### Notas — `/api/notes`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista paginada (`page`, `limit`; por defecto 20) |
| POST | `/` | Crea nota |
| POST | `/import` | Importa `{ notes: [{ title, summary, content, isPrivate }] }` |
| GET | `/search?q=` | Búsqueda (`limit`, por defecto 20) |
| GET | `/tags` | Tags de todas las notas visibles para el usuario |
| GET | `/tag/:tag` | Notas por tag, paginadas |
| GET | `/:id` | Detalle |
| PUT | `/:id` | Actualiza |
| DELETE | `/:id` | Elimina |

### Conexiones — `/api/connections`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/types` | Tipos de conexión |
| GET | `/note/:noteId` | Conexiones de la nota, agrupadas por tipo, con dirección |
| POST | `/note/:noteId` | Crea conexión (`targetNoteId`, `connectionType`) |
| DELETE | `/:connectionId` | Elimina conexión |

### Adjuntos — `/api/attachments`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/notes/:noteId/upload` | Sube un archivo (campo `file`, multipart) |
| GET | `/notes/:noteId` | Lista adjuntos |
| GET | `/:attachmentId/download` | Descarga |
| DELETE | `/:attachmentId` | Elimina |

### Otros
`GET /health` — estado del servidor, sin autenticación.

### Rutas del frontend
`/auth`, `/dashboard`, `/note/new`, `/note/:id`, `/note/:id/edit`. `/` redirige según la sesión.

---

## Reglas de Negocio

Describen el comportamiento **actual** del código.

### Notas y privacidad
- Las notas son públicas por defecto: las ve cualquier usuario autenticado.
- Una nota privada solo la ve, edita y borra su dueño.
- Una nota pública la puede **editar y borrar cualquier usuario autenticado** (pendiente de
  confirmar; ver `project-status.md`).
- Los tags se guardan en minúsculas y sin espacios sobrantes.

### Validaciones
| Campo | Regla |
|---|---|
| `email` | Formato válido |
| `password` | Mínimo 6 caracteres |
| `title` | Obligatorio, máximo 500 |
| `summary` | Máximo 2000 |
| tag | Máximo 50 caracteres; máximo 10 por nota (solo en el frontend) |
| Cuerpo JSON | Máximo 10 MB |

### Búsqueda
Coincide si el término aparece por texto completo en español en título, resumen o contenido, si es
igual a un tag (sin distinguir mayúsculas), o por `ILIKE` en título, resumen o contenido. Ordena por
`ts_rank` y después por fecha de actualización.

### Conexiones
- Solo se crean entre dos notas del propio usuario, y no de una nota consigo misma.
- Solo las borra el dueño de la nota de origen.
- Una conexión duplicada (mismo origen, destino y tipo) responde 409.

### Adjuntos
- Cualquier tipo de archivo; máximo 10 MB; el nombre no puede estar vacío.
- Subir, listar, descargar y borrar: solo el dueño de la nota, también en notas públicas.
- Se guardan en `backend/uploads/` como `file-<timestamp>-<aleatorio><ext>`.

### Importación
- Cada nota se inserta por separado; un fallo no detiene las demás.
- Respuesta: `{ total, imported, failed, errors }`.
- No importa tags.

### Paginación
El backend usa 20 por defecto; el frontend siempre pide 10 y carga más con "Cargar más".

---

## Seguridad

- Contraseñas con `bcryptjs`, 12 rondas.
- JWT con `{ userId }`, expiración `JWT_EXPIRES_IN` (7 días por defecto); se guarda en
  `localStorage` y Axios lo añade a cada petición. Un 401 cierra la sesión.
- Límite de 500 peticiones por IP cada 15 minutos en `/api/`.
- Consultas SQL parametrizadas.
- `DOMPurify` sanitiza solo el HTML generado al pegar Markdown.
- Helmet activo con la CSP desactivada; CORS abierto a cualquier origen.

---

## Frontend: Sistema de Diseño

Todo vive en `frontend/src/index.css`: variables en `:root` y una clase por componente.

| Token | Valor | Uso |
|---|---|---|
| Charcoal | `#1F2937` | Texto |
| Slate Blue | `#647CA3` | Acento de marca: anillos de foco y decoración (`--accent-brand`) |
| Acento oscurecido | `#556C93` | Botones y enlaces (`--accent`), cumple contraste AA con texto blanco |
| Warm Gray | `#D9D6CE` | Líneas |
| Light | `#F4F5F7` | Fondo |

- **Botones:** `.btn-primary` (uno por pantalla), `.btn-secondary`, `.btn-ghost`, `.btn-danger`.
- **Tipografía:** Manrope, pesos 400–800, cargada en `public/index.html`.
- **Iconos:** `<Icon name="..." />` en `components/UI/Icon.js`.
- **Logo:** `components/UI/Logo.js`; favicon e iconos de instalación en `public/assets/`.
- **Contenido de notas:** reglas `.prose` al final de `index.css`.
- **Breakpoints:** `1023px` (se pliegan la columna de tags y el panel de marca del login) y `719px`
  (móvil).

### Pegado de Markdown
`utils/markdownPaste.js` exporta `attachMarkdownPaste(quill)`, que devuelve una función de limpieza.
`NoteEditor.js` lo conecta en un `useEffect`.

Flujo: evento `paste` en fase de captura → `looksLikeMarkdown` → `marked` → `DOMPurify` →
`quill.clipboard.convert()` → `collapseBlankLines()` → `updateContents(..., 'user')`.

Si el texto no parece Markdown, el pegado lo gestiona Quill sin cambios. Las tablas quedan como
texto y las casillas de tareas como viñetas.

---

## Variables de Entorno

Archivo `backend/.env` (plantilla en `backend/.env.example`).

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens |
| `JWT_EXPIRES_IN` | Expiración del token (por defecto `7d`) |
| `PORT` | Puerto (por defecto 3001; Railway lo asigna) |
| `NODE_ENV` | `production` activa SSL hacia la BD y el servido del build de React |
| `CORS_ORIGINS` | Se lee, pero hoy no restringe |

`FRONTEND_URL` aparece en las plantillas pero el código no la usa.

---

## Despliegue (Railway)

- Repositorio `rikmarquez/notes-web`; cada push a `main` despliega.
- `railway.json`: builder Nixpacks.
  - Build: `npm run install:all && CI=false npm run build:frontend`
  - Start: `npm start` → `cd backend && npm start` → `node src/app.js`
  - Reinicio: `ON_FAILURE`, hasta 10 intentos.
- Variables mínimas en Railway: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
- No hay migraciones automáticas: los scripts SQL se ejecutan a mano.

### Comandos
```bash
npm run install:all      # dependencias de raíz, backend y frontend
npm run dev              # backend + frontend en paralelo
npm run build:frontend   # comprobar el build antes de un push
railway logs --follow    # logs de producción
```

**Rollback:** `git revert HEAD` y push a `main`.

**Verificación tras desplegar:** `GET /health`, registro con auto-login, crear nota, buscar, crear
conexión, subir y descargar un adjunto.
