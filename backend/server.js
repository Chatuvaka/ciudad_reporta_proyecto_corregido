require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const reporteRoutes = require('./src/routes/reporteRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── Middlewares ────────────────────────────────────────────
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self)');
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '25kb' }));

// ── Rutas ─────────────────────────────────────────────────
app.use('/api', reporteRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Ciudad Reporta API ✅' });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: true, message: 'El JSON enviado no es valido.' });
  }

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: true, message: 'Origen no permitido.' });
  }

  console.error('server error:', err);
  return res.status(500).json({ error: true, message: 'Error interno del servidor.' });
});

// ── Arranque ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
