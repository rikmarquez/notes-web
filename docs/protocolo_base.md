# Protocolo Base — Richard Marsol
## Estándar para todos los proyectos

> Coloca este archivo en `docs/` junto a `project-status.md` y `technical-specs.md` al iniciar cada proyecto nuevo.
> Referencia este archivo desde el `CLAUDE.md` del proyecto.

---

## Stack Tecnológico Base

### Frontend
- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS v4 + shadcn/ui v4 (`@base-ui/react`, NO Radix UI)
- **Tablas:** TanStack React Table
- **Formularios:** React Hook Form + Zod
- **Utilidades:** date-fns, lucide-react, xlsx

### Backend
- **Mutations:** Next.js Server Actions (no API Routes para escrituras)
- **Auth:** NextAuth.js v4 (JWT + credentials provider)
- **ORM:** Prisma 7 con `@prisma/adapter-pg`

### Base de Datos
- **Motor:** PostgreSQL
- **Hosting DB + App:** Railway

---

## Protocolo de Inicio de Sesión

Al iniciar cada sesión de Claude Code, leer EN ORDEN:

1. `docs/project-status.md` — estado actual, funcionalidades completadas, bugs conocidos
2. `docs/technical-specs.md` — arquitectura, schema de BD, endpoints, reglas de negocio
3. `docs/session-learnings.md` — decisiones técnicas, bugs resueltos, aprendizajes clave

Después de leer:
1. Confirmar comprensión del estado actual
2. Resumir brevemente: qué está completo, qué está en progreso, problemas conocidos
3. Preguntar: **"¿En qué vamos a trabajar hoy?"**

---

## Estrategia de Documentación Entre Sesiones

### Los 3 archivos de documentación

| Archivo | Propósito | Cuándo actualizar |
|---|---|---|
| `project-status.md` | Estado actual, versión, funcionalidades, bugs | Al final de cada sesión |
| `technical-specs.md` | Arquitectura, BD, endpoints, reglas de negocio | Solo si hubo cambios estructurales |
| `session-learnings.md` | Decisiones técnicas, bugs complejos, aprendizajes | Solo lo no obvio |

### Qué documentar en `session-learnings.md`

**✅ SÍ documentar:**
- Decisiones arquitectónicas con trade-offs evaluados
- Bugs complejos o no obvios con solución en código
- Workarounds a comportamientos inesperados de librerías
- Aprendizajes que eviten repetir el mismo error

**❌ NO documentar:**
- CRUD básico o endpoints REST estándar
- Configuraciones obvias
- Contexto excesivo o repetitivo
- Código que ya está en el repo y es autoexplicativo

### Formato de `session-learnings.md`

```markdown
## Decisiones Técnicas Importantes
### [Título de la decisión]
- **Contexto:** por qué se tomó la decisión
- **Opción elegida:** qué se hizo
- **Justificación:** por qué esta opción
- **Trade-offs:** qué se sacrifica

## Bugs Resueltos
### [Descripción del bug]
- **Síntoma:** qué se veía
- **Causa:** por qué pasaba
- **Solución:** cómo se resolvió
- **Código:** snippet antes/después si aplica

## Historial de Versiones
### vX.Y.Z (YYYY-MM-DD)
- bullet con lo completado
```

---

## Estrategia de Despliegue

### Railway (DB + App en el mismo proyecto)
1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Agregar servicio desde GitHub repo
4. Variables de entorno mínimas:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="secret_seguro"
NEXTAUTH_URL="https://tu-app.railway.app"
```

### Prisma en Railway
- `prisma.config.ts` contiene la URL (no `schema.prisma` — Prisma 7)
- Migración inicial: `npx prisma migrate dev --name init`
- En producción Railway ejecuta `npx prisma migrate deploy` en el build command

### Build command recomendado
```
npx prisma generate && npx prisma migrate deploy && next build
```

---

## Convenciones de Código

### Server Actions
- Todas las mutaciones van en `actions/` como Server Actions
- Operaciones que tocan múltiples tablas SIEMPRE dentro de `prisma.$transaction`
- Patrón estándar:

```ts
"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function crearEntidad(data: FormData) {
  // validar con Zod
  // ejecutar en transacción si hay múltiples escrituras
  // revalidar TODAS las rutas afectadas
  revalidatePath("/ruta-principal")
  revalidatePath("/ruta-consumidora-1")
}
```

### revalidatePath — Regla crítica
Al crear/editar/eliminar cualquier entidad, invalidar **todas** las rutas de Server Components que la consumen, no solo la ruta de origen. Si no se invalida una ruta, Next.js sirve HTML cacheado aunque la BD tenga datos nuevos.

### Soft delete vs Hard delete
- **Soft delete** (campo `deletedAt` o `activo: false`): para entidades con dependencias (usuarios, proveedores, productos)
- **Hard delete**: solo si se valida que no hay dependencias antes de eliminar

### Folios automáticos
Generar dentro de la transacción con `findFirst({ orderBy: { folio: 'desc' } })` + parseo + incremento. Suficientemente seguro para volumen normal; para alta concurrencia usar secuencia de BD.

```ts
// Patrón de folio
const ultimo = await tx.movimiento.findFirst({
  where: { folio: { startsWith: `ENT-${year}-` } },
  orderBy: { folio: "desc" },
})
const seq = ultimo ? parseInt(ultimo.folio.split("-")[2]) + 1 : 1
const folio = `ENT-${year}-${String(seq).padStart(4, "0")}`
```

### DataTable genérico
Usar TanStack Table con búsqueda client-side + paginación. Pasar datos como props desde Server Component (page.tsx → ClientTable).

### Formularios con líneas dinámicas
Usar `useFieldArray` de React Hook Form. `append({})` agrega línea, `remove(index)` la quita.

---

## Reglas shadcn/ui v4 (con @base-ui/react)

Estos son bugs/incompatibilidades ya conocidas — no perder tiempo redescubriéndolas:

| Problema | Solución |
|---|---|
| No existe `asChild` | Usar `render` prop o `buttonVariants` directamente en `<Link>` |
| `DropdownMenuLabel` fuera de `DropdownMenuGroup` lanza error de contexto | Cambiar implementación a `<div>` plano con `data-slot="dropdown-menu-label"` |
| `<Link>` con estilo de botón en Server Component | Aplicar clases Tailwind directo, NO llamar `buttonVariants()` desde Server Component |

---

## Reglas React Hook Form + Zod

| Problema | Solución |
|---|---|
| `z.coerce.number()` genera tipo `unknown` en RHF | Usar `z.number().min(0)` + `{ valueAsNumber: true }` en `register()` |
| `.default(0)` en Zod hace el campo opcional | Eliminar `.default()`, poner el default en `defaultValues` del `useForm` |
| `setValue` sobre `<select>` nativo tras `setState` no funciona (race condition) | Guardar ID en estado `pendingId`, aplicar `setValue` dentro de `useEffect([pendingId])` |

---

## Reglas Next.js

| Problema | Solución |
|---|---|
| `export { default } from "next-auth/middleware"` falla en Next.js 16 | Reescribir como función explícita con `getToken` de `next-auth/jwt` |
| SQL directo en Railway no actualiza la app (Full Route Cache) | Usar Configuración → Utilidades → Limpiar caché (`revalidatePath("/", "layout")`) |
| Lista que crece con quick-add no actualiza UI | Siempre usar `useState` inicializado con props del servidor; nunca usar la prop directamente si hay setter |

---

## Estructura de Directorios Recomendada

```
proyecto/
├── app/
│   ├── (auth)/login/
│   └── (dashboard)/
│       ├── layout.tsx           # sidebar + header
│       └── [modulos]/
├── components/
│   ├── ui/                      # shadcn/ui
│   └── layout/                  # Sidebar, Header
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── actions/                     # Server Actions (una por módulo)
├── prisma/
│   ├── schema.prisma
│   └── prisma.config.ts         # datasource url (Prisma 7)
├── docs/
│   ├── project-status.md
│   ├── technical-specs.md
│   ├── session-learnings.md
│   └── protocolo_base.md        # este archivo
├── CLAUDE.md                    # referencia a este protocolo
└── .env
```

---

## CLAUDE.md mínimo para proyectos nuevos

Copiar y adaptar en cada proyecto nuevo:

```markdown
# Protocolo de Inicio — Claude Code
## [Nombre del Proyecto]

Al iniciar cada sesión, leer EN ORDEN:
1. `docs/project-status.md`
2. `docs/technical-specs.md`
3. `docs/session-learnings.md`

Después de leer, resumir estado y preguntar: **"¿En qué vamos a trabajar hoy?"**

Consultar `docs/protocolo_base.md` para convenciones de código, stack, reglas de shadcn/ui v4,
patrones de Server Actions, y estrategia de documentación.

## Reglas del Proyecto
[Agregar aquí reglas específicas del proyecto]
```

---

**Versión del protocolo:** 1.0
**Fecha:** 2026-04-16
**Autor:** Richard Marsol
