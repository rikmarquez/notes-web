# 🚀 Guía de Despliegue - Notes Web App

## Estado Actual del Proyecto

✅ **Proyecto configurado en Railway**
- Repositorio GitHub: `rikmarquez/notes-web`
- Railway Project: Conectado y configurado para auto-deploy
- Despliegue automático: Activado en branch `main`

## 🔄 Proceso de Despliegue Automático

El proyecto está configurado para **despliegue automático** en Railway:

1. **Push a GitHub** → Railway detecta cambios automáticamente
2. **Build Process** → Railway ejecuta `railway.json` build command
3. **Deploy** → Aplicación actualizada en producción

### Comando para Despliegue Manual
```bash
# Solo si necesitas forzar un redespliegue
git push origin main
```

## 📝 Configuración de Railway

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:all && CI=false npm run build:frontend"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔧 Variables de Entorno Requeridas

**En Railway Dashboard configurar:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave secreta para JWT tokens | `mi-super-clave-secreta-2024` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto del servidor (Railway auto-asigna) | `3001` |

## 📋 Scripts de Producción

### package.json (root)
```json
{
  "scripts": {
    "build": "npm run install:all && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "start": "NODE_ENV=production cd backend && npm start",
    "heroku-postbuild": "npm run build"
  }
}
```

## 🔍 Verificación Post-Despliegue

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

### 2. Funcionalidades a Probar
- [ ] Registro de usuario + auto-login
- [ ] Login manual
- [ ] Creación de notas
- [ ] Búsqueda de notas
- [ ] Conexiones entre notas

## 🐛 Troubleshooting

### Build Failures
```bash
# Ver logs en Railway Dashboard o CLI
railway logs

# Verificar build localmente
npm run build
```

### Variables de Entorno
```bash
# Verificar variables en Railway
railway variables

# Setear nueva variable
railway variables set KEY=value
```

### Database Issues
- Verificar `DATABASE_URL` en Railway variables
- Confirmar que la base de datos está accesible
- Revisar logs para errores de conexión

## 📈 Monitoreo

### Logs en Tiempo Real
```bash
railway logs --follow
```

### Métricas
- CPU/RAM usage en Railway Dashboard
- Response times en Railway Analytics
- Error rates en logs

## 🔄 Proceso de Desarrollo → Producción

1. **Desarrollo Local**
   ```bash
   npm run dev
   ```

2. **Testing**
   ```bash
   npm run build:frontend  # Verificar que build sea exitoso
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Feature: descripción del cambio"
   git push origin main  # ✨ Auto-deploy triggered!
   ```

4. **Verificación**
   - Esperar build en Railway (2-3 minutos)
   - Verificar funcionalidad en producción
   - Revisar logs si hay issues

## ⚡ Tips para Despliegues Efectivos

### Antes de Hacer Push
- [ ] Build local exitoso: `npm run build:frontend`
- [ ] No hay errores de linting críticos
- [ ] Variables de entorno actualizadas si es necesario
- [ ] Commit message descriptivo

### Rollback si es Necesario
```bash
# Revertir al commit anterior
git revert HEAD
git push origin main
```

### Deploy de Branches Específicas
```bash
# Si necesitas deployear otra branch
git push origin feature-branch:main
```

---

## 🏗️ Arquitectura de Despliegue

```
GitHub Repository (main)
         ↓ (Auto-trigger on push)
    Railway Platform
         ↓ (Build Process)
    1. npm run install:all
    2. npm run build:frontend
         ↓ (Start Process)
    NODE_ENV=production npm start
         ↓ (Serve)
    Backend API + Static React Files
```

## 📚 Referencias

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Deployment Best Practices](https://docs.railway.app/deploy/best-practices)

---

**Última actualización:** $(date)
**Versión:** 1.0.0
**Maintainer:** Claude Code Assistant

> 💡 **Nota:** Este archivo se actualizará automáticamente con cada cambio significativo en la configuración de deployment.