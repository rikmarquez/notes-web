# Aprendizajes de Sesión — Notes Web App

Solo lo no obvio: decisiones con trade-offs, bugs complejos y workarounds.

---

## Decisiones Técnicas Importantes

### Hoja de estilos única en lugar de Tailwind
- **Contexto:** el código estaba lleno de clases de Tailwind (`grid`, `md:grid-cols-2`,
  `fixed inset-0`), pero Tailwind nunca se instaló, así que no hacían nada. Los arreglos de layout
  se iban parcheando con estilos inline.
- **Opción elegida:** un solo archivo, `frontend/src/index.css`, con variables en `:root` y clases
  semánticas por componente.
- **Justificación:** deja el sistema de diseño en un solo lugar y evita depender de clases que
  fallan en silencio.
- **Trade-offs:** se aparta del stack del protocolo base (Tailwind + shadcn/ui) y el archivo crece
  con cada componente.

### Notas públicas por defecto
- **Contexto:** la app se pensó como base de conocimiento compartida entre sus usuarios.
- **Opción elegida:** `is_private` por nota, con valor `false` por defecto.
- **Justificación:** las notas existentes siguieron visibles sin migrar datos.
- **Trade-offs:** cada consulta nueva debe incluir el filtro de privacidad a mano; olvidarlo expone
  notas privadas. Además, hoy "pública" también significa editable y borrable por cualquiera.

### Adjuntos de cualquier tipo
- **Contexto:** la lista blanca de tipos MIME solo admitía PDF, Office, imágenes y texto.
- **Opción elegida:** aceptar todo; validar solo nombre y tamaño (10 MB).
- **Justificación:** poder adjuntar cualquier archivo de trabajo (SQL, comprimidos, etc.).
- **Trade-offs:** no hay ninguna barrera sobre el contenido de lo que se sube.

### Formulario de conexión en línea en lugar de modal
- **Contexto:** el modal tenía problemas de scroll en notas largas.
- **Opción elegida:** `InlineConnectionForm.js` sustituye al botón al activarse.
- **Trade-offs:** ocupa espacio en la página mientras está abierto.

---

## Bugs Resueltos

### `parseInt` sobre IDs UUID
- **Síntoma:** errores de "ID inválido" al abrir o editar notas.
- **Causa:** la validación convertía el ID a entero y obtenía `NaN`.
- **Solución:** validar como cadena y dejar que PostgreSQL convierta el tipo.
- **Código:**
  ```js
  // Antes
  const id = parseInt(req.params.id, 10);
  // Después
  const id = req.params.id.toString().trim();
  ```

### Clic en un resultado de búsqueda no abría la nota
- **Síntoma:** al hacer clic en un resultado se volvía al listado de notas recientes.
- **Causa:** `mousedown` se dispara antes que `click`. El manejador de "clic fuera" cerraba la
  búsqueda en `mousedown` y el resultado desaparecía antes de recibir el `click`.
- **Solución:** el manejador ignora los clics dentro de `.search-result-note`, y el clic en un
  resultado ya no llama a `onClose()`.

### Líneas en blanco de más al insertar HTML en Quill
- **Síntoma:** al pegar Markdown aparecían párrafos vacíos entre bloques.
- **Causa:** el portapapeles de Quill 1 añade un párrafo vacío donde los bloques pegados tienen
  margen visual (por ejemplo `<p>` seguido de `<ul>`), y el resultado depende del CSS de la página.
- **Solución:** convertir con `quill.clipboard.convert()` y colapsar los `\n` consecutivos sin
  atributos (`collapseBlankLines`). Los saltos dentro de bloques de código llevan atributos y se
  conservan.

### Falsos positivos al detectar Markdown
- **Síntoma:** un texto como "2025. Fue un buen año" se convertía en lista y perdía el año.
- **Causa:** el patrón de lista ordenada aceptaba cualquier número.
- **Solución:** aceptar solo números de 1 a 3 dígitos: `/^\s*\d{1,3}[.)]\s+\S/m`.

### El contenido con formato se veía plano en la vista de nota
- **Síntoma:** títulos sin margen y listas sin sangría.
- **Causa:** el reset global `* { margin: 0; padding: 0 }`, y la clase `prose` no tenía estilos.
- **Solución:** reglas `.prose` propias al final de `index.css`.

---

## Aprendizajes y Trampas

### `NODE_ENV=production cd backend && npm start` no fija `NODE_ENV`
El script `start` de la raíz antepone la variable a `cd`, así que solo aplica a ese comando y no
llega a `npm start`. Producción funciona porque `NODE_ENV=production` está definida como variable en
Railway. Si esa variable falta, Express no sirve el build de React y la conexión a la BD va sin SSL.
En Windows, además, esa sintaxis no funciona en `cmd`.

### `react-quill` necesita su CSS
Hay que importar `react-quill/dist/quill.snow.css` o la barra de herramientas sale sin estilo.

### Deshacer en un solo paso
Insertar en Quill con origen `'user'` hace que un solo Ctrl+Z revierta toda la conversión.

### Las listas anidadas de Quill no son `<ul>` anidados
Quill las representa con clases `ql-indent-N`; hay que habilitar el formato `indent` en el editor y
dar estilo a esas clases en la vista.

### El build de CRA falla con warnings en CI
Por eso el comando de build usa `CI=false`.

### La documentación antigua tenía fechas y cifras erróneas
Las fechas de este archivo salen del historial de git. El límite de peticiones real es 500 cada
15 minutos, no 100.

---

## Historial de Versiones

### v2.3.0 (2026-10-06)
- Rediseño visual con sistema de diseño propio, Manrope, iconos SVG y logo.
- Iconos de instalación para Android e iOS.
- Vista y editor de nota a todo el ancho del contenedor.

### 2026-10-01
- Pegado de Markdown con conversión a texto con formato.
- Citas y bloques de código en la barra del editor; estilos `.prose`.

### 2025-10-11 / 2025-10-12
- Botón de editar bajo el contenido de la nota.
- Botones de guardar y cancelar bajo el editor.

### 2025-08-15
- Botón flotante para volver al dashboard.

### 2025-08-11
- Adjuntos de cualquier tipo.
- Paginación del dashboard reducida a 10 notas.

### 2025-08-10
- Notas privadas.

### 2025-08-09
- Archivos adjuntos.
- Copia al portapapeles.
- Formulario de conexión en línea.
- Logo y favicon.

### 2025-08-06 a 2025-08-08
- Despliegue automático en Railway.
- Búsqueda en tiempo real, botón de limpiar y búsqueda sin distinguir mayúsculas.
- Corrección de la validación de UUID.
- Importación masiva desde JSON.

### 2025-08-03
- Primer commit.
