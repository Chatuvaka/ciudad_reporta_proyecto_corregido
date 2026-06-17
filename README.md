# 🏙️ Ciudad Reporta — Guía Completa del Proyecto

Aplicación web de reporte de incidencias urbanas con arquitectura **Breadcrumb (Wizard de 3 pasos)**.

---

## ESTRUCTURA GENERAL DEL PROYECTO

```
ciudad-reporta/
├── database.sql                  ← Script SQL completo
│
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js                 ← Punto de entrada
│   └── src/
│       ├── config/
│       │   └── db.js             ← Pool de conexión MySQL
│       ├── controllers/
│       │   └── reporteController.js
│       └── routes/
│           └── reporteRoutes.js
│
└── frontend/
    ├── package.json
    ├── .env
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/
        │   └── api.js            ← Axios configurado
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Breadcrumb.jsx    ← Indicador de pasos
        │   ├── StepOne.jsx       ← Paso 1: Tipo
        │   ├── StepTwo.jsx       ← Paso 2: Información
        │   ├── StepThree.jsx     ← Paso 3: Confirmación + envío
        │   └── ReportCard.jsx
        └── pages/
            ├── Home.jsx          ← Wizard completo
            └── Dashboard.jsx     ← Seguimiento por estado
```

---

## API REST

| Método | Endpoint        | Descripción             |
|--------|-----------------|-------------------------|
| GET    | /api/reportes   | Obtener todos los reportes |
| POST   | /api/reportes   | Crear un nuevo reporte  |

### POST /api/reportes — Body esperado

```json
{
  "tipo":        "Bache",
  "ubicacion":   "Calle Juárez #45",
  "descripcion": "Bache de gran tamaño",
  "ciudadano":   "Carlos Ramírez"
}
```

### Respuesta exitosa (201)

```json
{
  "message": "Reporte creado exitosamente",
  "id": 1
}
```

---

## INSTRUCCIONES DE INSTALACIÓN

### Requisitos previos

- Node.js `^20.19.0` o `>=22.12.0`
- MySQL 8+
- npm

---

### 1. Base de datos

1. Abre MySQL Workbench o tu cliente favorito.
2. Ejecuta el archivo `ciudad_reporta.sql`.

```sql
-- Esto crea la BD, las tablas y registros de ejemplo
SOURCE /ruta/a/ciudad-reporta/ciudad_reporta.sql;
```

---

### 2. Backend

```bash
# Entrar a la carpeta
cd ciudad-reporta/backend

# Instalar dependencias
npm install

# Crear archivo de entorno (ya incluido, solo edita si es necesario)
# Edita .env con tu usuario/contraseña de MySQL

# Iniciar en desarrollo
npm run dev

# El servidor quedará en: http://localhost:3001
```

**Verificar que funciona:**
```
GET http://localhost:3001/
→ { "status": "ok", "message": "Ciudad Reporta API ✅" }

GET http://localhost:3001/api/reportes
→ [ ...array de reportes... ]
```

---

### 3. Frontend

```bash
# En otra terminal, entrar a la carpeta
cd ciudad-reporta/frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# La app quedará en: http://localhost:5173
```

---

## VARIABLES DE ENTORNO

### backend/.env

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=ciudad_reporta
CORS_ORIGIN=http://localhost:5173,http://localhost:4173
WORKER_TOKEN_SECRET=cambia_esto_por_una_clave_larga_aleatoria
```

### frontend/.env

```env
VITE_API_URL=http://localhost:3001/api
```

> En producción, cambia `VITE_API_URL` a la URL de tu backend en Render.

---

## INSTRUCCIONES DE DESPLIEGUE

---

### BACKEND → Render

1. Sube la carpeta `backend/` a un repositorio en GitHub.
2. Ve a [render.com](https://render.com) → **New Web Service**.
3. Conecta tu repositorio de GitHub.
4. Configura:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En **Environment Variables**, agrega:
   - `DB_HOST` → host de tu BD en Render o PlanetScale
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
6. Render te dará una URL pública tipo:
   `https://ciudad-reporta-api.onrender.com`

> **Recomendación para BD en producción:** Usa [PlanetScale](https://planetscale.com) o [Railway MySQL](https://railway.app) (ambos tienen tier gratuito).

---

### FRONTEND → Vercel

1. Sube la carpeta `frontend/` a un repositorio en GitHub.
2. Ve a [vercel.com](https://vercel.com) → **New Project**.
3. Importa el repositorio.
4. Configuración (Vercel la detecta automáticamente):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. En **Environment Variables**, agrega:
   - `VITE_API_URL` = `https://ciudad-reporta-api.onrender.com/api`
6. Haz clic en **Deploy**.

> ⚠️ Importante: La variable `VITE_API_URL` se inyecta en tiempo de **build**. Si cambias la URL del backend, debes hacer un nuevo deploy del frontend.

---

### NGINX → Producción propia

Se agregó la configuración `nginx/ciudad-reporta.conf` para servir el frontend compilado, reenviar `/api` al backend en `localhost:3001`, limitar peticiones y aplicar cabeceras de seguridad.

Pasos generales:

```bash
cd frontend
npm run build
```

Después copia `frontend/dist` al servidor en `/var/www/ciudad-reporta/frontend/dist`, ajusta `server_name` en `nginx/ciudad-reporta.conf` y habilita el sitio en NGINX.

---

## FLUJO DE LA APLICACIÓN

```
/  (Home)
├── Paso 1 → Seleccionar tipo de incidencia
├── Paso 2 → Ingresar ubicación, descripción y nombre
├── Paso 3 → Confirmar datos
└── POST /api/reportes → Pantalla de éxito

/dashboard
├── GET /api/reportes → Casos ciudadanos permitidos
├── Pestaña En proceso
├── Pestaña En atención
└── Pestaña Completados

/trabajadores/login
├── Login del trabajador
└── Redirección al panel interno

/trabajadores/panel
├── Resumen de reportes
├── Toma de reportes recibidos
└── Marcado de reportes completados
```

---

## COMANDOS RÁPIDOS

```bash
# Backend desarrollo
cd backend && npm run dev

# Frontend desarrollo
cd frontend && npm run dev

# Build producción frontend
cd frontend && npm run build
```

---

## NOTAS PARA EL EQUIPO

- El campo `ciudadano` es **opcional**; si se deja vacío se guarda como `"Anónimo"`.
- El campo `estado` se crea automáticamente como `"recibido"`.
- El campo `fecha` se genera automáticamente en la BD.
- El módulo ciudadano no requiere cuenta; el módulo de trabajadores usa token temporal protegido por `WORKER_TOKEN_SECRET`.
- Los datos de ejemplo del SQL son solo para desarrollo; en producción la tabla empieza vacía.
