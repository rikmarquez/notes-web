# Protocolo de Inicio — Claude Code
## Notes Web App

Al iniciar cada sesión, leer EN ORDEN:
1. `docs/project-status.md`
2. `docs/technical-specs.md`
3. `docs/session-learnings.md`

Después de leer, resumir estado y preguntar: **"¿En qué vamos a trabajar hoy?"**

Consultar `docs/protocolo_base.md` para la estrategia de documentación entre sesiones.

> **Alcance del protocolo en este proyecto:** esta app es anterior al protocolo base y usa otro stack
> (Create React App + Express + `pg`, en JavaScript). Del protocolo aplican el inicio de sesión, los
> 3 archivos de documentación y el despliegue en Railway. **No aplican** las secciones de Next.js,
> Server Actions, Prisma, NextAuth, Tailwind, shadcn/ui ni React Hook Form + Zod.

## Reglas del Proyecto

- **IDs son UUID**, nunca enteros. No usar `parseInt` sobre ellos.
- **Privacidad:** toda consulta de notas debe filtrar con
  `(is_private = false OR is_private IS NULL OR user_id = $usuario)`.
- **Estilos:** una sola hoja, `frontend/src/index.css`. No usar clases de Tailwind (no está instalado
  y se ignoran en silencio), ni estilos inline, ni CSS por componente.
- **Diseño:** un solo `.btn-primary` por pantalla; iconos con `components/UI/Icon.js`, sin emojis.
- **SQL:** siempre consultas parametrizadas (`$1`, `$2`…).
- **Despliegue:** un push a `main` redespliega producción en Railway. No hacer push sin que se pida.
- **Al cerrar sesión:** actualizar `docs/project-status.md`; `technical-specs.md` solo si hubo cambios
  estructurales; `session-learnings.md` solo con lo no obvio.
