# Estado del Proyecto — Notes Web App

**Versión:** 2.3.0 (los `package.json` siguen en `1.0.0`)
**Última actualización:** 2026-10-10
**Estado:** en producción en Railway, con auto-deploy desde `main`

Sistema personal de gestión de conocimiento: notas con editor enriquecido, tags, conexiones entre
notas, búsqueda en español, adjuntos e importación masiva.

---

## Funcionalidades Completadas

| Funcionalidad | Notas |
|---|---|
| Registro y login con JWT | Auto-login tras el registro |
| CRUD de notas | Título, resumen (reflexión), contenido HTML, tags |
| Editor WYSIWYG | ReactQuill; auto-guardado cada 30 s |
| Pegado de Markdown | Se convierte a texto con formato; Ctrl+Z lo revierte |
| Búsqueda en tiempo real | Debounce de 300 ms, resaltado, texto completo en español + `ILIKE` |
| Tags | Autocompletado, máximo 10 por nota, filtro por tag |
| Conexiones entre notas | 6 tipos; formulario en línea |
| Notas privadas | Públicas por defecto; `is_private` por nota |
| Importación masiva | JSON `{ notes: [{ title, summary, content }] }` |
| Archivos adjuntos | Cualquier tipo, hasta 10 MB, drag & drop |
| Copia al portapapeles | Conserva saltos de línea |
| Sistema de diseño | Paleta de marca, Manrope, iconos SVG, logo |
| Instalable en móvil | Iconos en `manifest.json` e `index.html` |

## En Progreso

Nada en curso.

---

## Problemas Conocidos

Verificados en el código el 2026-10-10.

### Seguridad

| # | Problema | Dónde |
|---|---|---|
| 1 | **Cualquier usuario autenticado puede editar y borrar notas públicas ajenas.** `canUserAccess` devuelve `true` para toda nota pública y es la única comprobación en `updateNote` y `deleteNote`. Falta confirmar si es intencional ("colaborativo por defecto"). | `backend/src/models/Note.js:93`, `notesController.js:133,179` |
| 2 | **Las conexiones filtran títulos de notas privadas.** `getNoteConnections` no comprueba acceso a la nota ni a las notas conectadas. | `connectionsController.js:49` |
| 3 | **XSS almacenado.** El contenido de la nota se renderiza con `dangerouslySetInnerHTML` sin sanitizar, y las notas públicas las ven todos los usuarios. | `frontend/src/pages/NoteViewPage.js:194` |
| 4 | El resaltado de búsqueda inserta HTML sin escapar. | `frontend/src/utils/helpers.js:146` |
| 5 | CORS acepta cualquier origen; `CORS_ORIGINS` no restringe. | `backend/src/app.js:45` |
| 6 | La Content Security Policy de Helmet está desactivada. | `backend/src/app.js:17` |
| 7 | El JWT se guarda en `localStorage` (expuesto ante el XSS del punto 3). | `frontend/src/services/authService.js` |

### Bugs

| # | Problema | Dónde |
|---|---|---|
| 8 | Buscar un texto con caracteres de regex (por ejemplo `(`) lanza una excepción al resaltar: el término se pasa sin escapar a `new RegExp`. | `frontend/src/utils/helpers.js:149` |
| 9 | La importación descarta los tags (siempre guarda `[]`) y no aplica los límites de validación de las notas. | `notesController.js:292` |
| 10 | `setup-database.js` solo ejecuta `database-init.sql`; no aplica `migration-privacy.sql`. | `setup-database.js` |

### Por verificar

- **Persistencia de adjuntos:** se guardan en disco local (`backend/uploads/`). Si el servicio de
  Railway no tiene un volumen montado en esa ruta, los archivos se pierden en cada despliegue.
- **`NODE_ENV` en producción:** depende de la variable definida en Railway (ver
  `session-learnings.md`).

### Deuda técnica

- No hay pruebas automatizadas (`backend` no tiene script de test).
- Límite de peticiones "relajado para desarrollo": 500 cada 15 min, también en producción.
- Los adjuntos de una nota pública solo los puede listar y descargar su dueño.
- Licencias inconsistentes: `MIT` en la raíz, `ISC` en `backend/package.json`.

---

## Próximos Pasos Sugeridos

1. Decidir la regla de edición de notas públicas (punto 1) y corregir los puntos 2, 3, 4 y 8.
2. Confirmar el volumen de Railway para `backend/uploads/`.
3. Roadmap pendiente: importar CSV/Markdown, vista de grafo, exportar a PDF/Markdown, carpetas,
   compartir públicamente, estadísticas, backup automático, modo oscuro, vista previa de imágenes,
   cuotas de almacenamiento, almacenamiento en la nube.
