# Notes Web App

Sistema web de gestión de conocimiento personal que permite capturar, organizar y conectar ideas de manera intuitiva, creando una red de conocimiento personal.

## ✅ Características Principales

- **📝 Editor WYSIWYG**: Editor rico para crear contenido con formato
- **⬇️ Pegado de Markdown**: Pega texto en Markdown y se convierte automáticamente en texto con formato
- **🔍 Búsqueda Inteligente**: Búsqueda en tiempo real por título, contenido y tags
- **🏷️ Sistema de Tags**: Organización con tags y autocompletado
- **🔗 Conexiones**: Crea relaciones tipificadas entre tus notas
- **💭 Reflexiones Personales**: Espacio dedicado para tus insights personales
- **🔐 Autenticación Segura**: Sistema JWT con email/password + **auto-login tras registro**
- **📎 Archivos Adjuntos**: Sistema completo de gestión de archivos (PDF, Word, Excel, imágenes)
- **📋 Copia al Portapapeles**: Función para copiar contenido de notas con preservación de formato

## 🔧 Stack Tecnológico

### Backend
- **Node.js** con Express
- **PostgreSQL** (Railway)
- **JWT** para autenticación
- **bcryptjs** para hash de passwords
- **Multer** para manejo de archivos

### Frontend
- **React 18**
- **React Router** para navegación
- **ReactQuill** para editor WYSIWYG
- **marked** + **DOMPurify** para convertir y sanitizar Markdown pegado
- **Axios** para llamadas HTTP

## 📁 Estructura del Proyecto

```
notes-web/
├── backend/
│   ├── src/
│   │   ├── controllers/                   # Lógica de negocio
│   │   ├── middleware/                     # Middleware de auth y validación
│   │   ├── models/                         # Modelos de datos
│   │   ├── routes/                         # Definición de rutas
│   │   ├── config/                         # Configuración de BD
│   │   └── app.js                          # Aplicación principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                     # Componentes React
│   │   ├── pages/                          # Páginas principales
│   │   ├── hooks/                          # Hooks personalizados
│   │   ├── services/                       # Servicios de API
│   │   └── utils/                          # Utilidades
│   └── package.json
├── railway.json                            # Configuración de Railway
├── DEPLOYMENT.md                           # 🚀 Guía completa de despliegue
├── ATTACHMENTS_FEATURE.md                  # 📎 Documentación de archivos adjuntos
└── README.md
```

## 🛠️ Configuración e Instalación

### Prerrequisitos
- Node.js 16+
- PostgreSQL (o cuenta en Railway)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd notes-web
```

### 2. Instalación Rápida (Monorepo)
```bash
# Instalar todas las dependencias
npm run install:all

# Configurar variables de entorno
cp .env.example backend/.env
# Editar backend/.env con tu configuración

# Ejecutar en desarrollo
npm run dev
```

### 3. Configuración Manual

**Backend:**
```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Configurar Base de Datos

Ejecutar el script SQL en `backend/src/config/database-init.sql` en tu base de datos PostgreSQL.

### 5. Ejecutar en Desarrollo

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**O usar el comando integrado:**
```bash
# Desde la raíz del proyecto
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🚀 Despliegue

**Estado Actual: ✅ Configurado para auto-deploy en Railway**

El proyecto está conectado a Railway y se redesplega automáticamente cuando haces push a `main`.

### Deploy Automático
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main     # ✅ Auto-deploy triggered!
```

### Variables de Entorno para Producción
En Railway Dashboard configurar:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret-key
NODE_ENV=production
PORT=3001
```

**📚 Para más detalles:** Ver [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario (+ auto-login)
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Notas
- `GET /api/notes` - Listar notas
- `POST /api/notes` - Crear nota
- `GET /api/notes/:id` - Obtener nota
- `PUT /api/notes/:id` - Actualizar nota
- `DELETE /api/notes/:id` - Eliminar nota
- `GET /api/notes/search?q=query` - Buscar notas
- `GET /api/notes/tags` - Obtener tags del usuario

### Conexiones
- `GET /api/connections/note/:noteId` - Obtener conexiones de una nota
- `POST /api/connections/note/:noteId` - Crear conexión
- `DELETE /api/connections/:connectionId` - Eliminar conexión

### Archivos Adjuntos
- `POST /api/attachments/notes/:noteId/upload` - Subir archivo
- `GET /api/attachments/notes/:noteId` - Listar archivos de nota
- `GET /api/attachments/:attachmentId/download` - Descargar archivo
- `DELETE /api/attachments/:attachmentId` - Eliminar archivo

## 🎨 Características de UX/UI

### Diseño Responsivo
- Diseño adaptativo para mobile y desktop
- Componentes optimizados para touch
- Espaciado consistente en todas las páginas

### Búsqueda en Tiempo Real
- Búsqueda con debounce de 300ms
- Resultados instantáneos con highlighting
- Búsqueda por texto completo en español

### Editor Avanzado
- Toolbar completa con formato de texto
- Soporte para listas, citas, bloques de código, enlaces e imágenes
- Pegado de Markdown con conversión automática a formato (Ctrl+Z para deshacer)
- Auto-guardado cada 30 segundos

### Sistema de Tags
- Autocompletado con tags existentes
- Límite de 10 tags por nota
- Filtrado por tags en sidebar

### Funciones de Productividad
- **📋 Copia al Portapapeles**: Copia contenido de notas preservando saltos de línea
- **📎 Gestión de Archivos**: Drag & drop, descarga y eliminación de attachments
- **🔍 Búsqueda Avanzada**: Resultados en tiempo real con highlighting

## 🔒 Seguridad

- Hash de passwords con bcryptjs
- Tokens JWT con expiración
- Validación de datos en frontend y backend
- Rate limiting en API
- Sanitización de HTML
- CORS configurado para producción
- Validación de tipos MIME en uploads
- Storage seguro fuera del directorio público

## 🆕 Nuevas Características (Implementadas)

### ✅ Auto-Login tras Registro
- Los usuarios se logean automáticamente después del registro exitoso
- Redirección inmediata al dashboard
- Experiencia de usuario mejorada sin pasos adicionales

### ✅ Sistema de Archivos Adjuntos
- **Tipos soportados**: PDF, Word, Excel, imágenes (hasta 10MB)
- **Funcionalidades**: Upload, descarga, eliminación
- **Seguridad**: Solo el propietario de la nota puede gestionar archivos
- **UX**: Drag & drop funcional con feedback visual
- **Estado**: Producción ready

### ✅ Copia al Portapapeles
- **Funcionalidad**: Botón para copiar contenido de notas
- **Formato**: Preserva saltos de línea del contenido original
- **Compatibilidad**: Navegadores modernos con fallback para legacy
- **UX**: Feedback visual con tooltips de confirmación

### ✅ Pegado de Markdown
- **Funcionalidad**: Al pegar texto en Markdown en el editor (crear o editar nota), se convierte automáticamente en texto con formato
- **Soporta**: Títulos, negritas, cursivas, código en línea, enlaces, listas (incluidas sub-viñetas), citas y bloques de código
- **Detección**: Solo se convierte si el texto tiene sintaxis Markdown; el pegado normal (Word, webs, texto plano) no cambia
- **Deshacer**: Ctrl+Z revierte la conversión en un solo paso
- **Seguridad**: El HTML generado se sanitiza con DOMPurify
- **Limitaciones**: Las tablas quedan como texto y las casillas de tareas (`- [ ]`) como viñetas normales

## 🔧 Aprendizajes Técnicos

### Layout y Espaciado
- **Problema identificado**: `h-screen` con `overflow-auto` limitaba el scroll natural
- **Solución aplicada**: Cambio a `min-h-screen` permitiendo scroll natural
- **Técnica utilizada**: Estilos inline para máxima especificidad CSS
- **Resultado**: Espaciado consistente de 96px en todas las páginas

### Gestión de Archivos
- **Multer**: Configuración para manejo seguro de uploads
- **Validaciones**: Doble validación (frontend + backend) para tipos y tamaños
- **Storage**: Implementación local con nombres únicos para evitar colisiones
- **Limpieza**: Auto-cleanup de archivos huérfanos en caso de errores

### Copia al Portapapeles
- **API moderna**: Clipboard API para navegadores compatibles
- **Fallback**: document.execCommand para navegadores legacy
- **Preservación de formato**: Conversión inteligente de HTML a texto plano
- **UX**: Estados de carga y feedback inmediato

## 📊 Monitoreo y Logs

```bash
# Logs en tiempo real (Railway)
railway logs --follow

# Health check
curl https://your-app.railway.app/health
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Desarrollo

Desarrollado como sistema personal de gestión de conocimiento con enfoque en productividad y experiencia de usuario.

## 🗺️ Roadmap Futuras Funcionalidades

- [ ] Sistema de importación (JSON, CSV, Markdown)
- [ ] Vista de grafo de conexiones
- [ ] Exportación a PDF/Markdown
- [ ] Categorías/carpetas
- [ ] Compartir notas públicamente
- [ ] Estadísticas de uso
- [ ] Backup automático
- [ ] Modo oscuro
- [ ] **Vista previa de imágenes** inline
- [ ] **Cuotas de almacenamiento** por usuario
- [ ] **Integración con cloud storage** (AWS S3, Google Drive)

---

**🚀 Status de Deployment:**
- ✅ Configuración de producción
- ✅ Auto-deploy desde GitHub  
- ✅ Variables de entorno configuradas
- ✅ Railway integrado

**📅 Última actualización:** 2026-10-01

**🔧 Versión actual:** 2.2.0 (con pegado de Markdown)