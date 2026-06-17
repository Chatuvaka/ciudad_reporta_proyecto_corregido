const crypto = require('crypto');
const pool = require('../config/db');
const { validarUbicacionReporteBackend } = require('../services/locationValidator');

const TOKEN_SECRET = process.env.WORKER_TOKEN_SECRET
  || process.env.JWT_SECRET
  || crypto.randomBytes(32).toString('hex');

if (!process.env.WORKER_TOKEN_SECRET && !process.env.JWT_SECRET) {
  console.warn('WORKER_TOKEN_SECRET no esta configurado. Se usara una clave temporal para esta ejecucion.');
}

const publicReportSelect = `
  SELECT
    id,
    tipo,
    ubicacion,
    senas_lugar,
    descripcion,
    ciudadano,
    estado,
    fecha_creacion,
    fecha_creacion AS fecha,
    trabajador_id,
    motivo_cancelacion
  FROM reportes
`;

const VALID_REPORT_TYPES = [
  'Bache',
  'Luminaria dañada',
  'Fuga de agua',
  'Basura acumulada',
  'Señalización dañada',
  'Árbol caído',
];

function validTypesWhereClause() {
  return `tipo IN (${VALID_REPORT_TYPES.map(() => '?').join(', ')})`;
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
}

function safeCompare(a, b) {
  const aBuffer = Buffer.from(String(a || ''));
  const bBuffer = Buffer.from(String(b || ''));

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function createWorkerToken(trabajador) {
  const payload = base64UrlEncode({
    id: trabajador.id,
    nombre: trabajador.nombre,
    correo: trabajador.correo,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  });

  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function verifyWorkerToken(token) {
  if (!token || !token.includes('.')) return null;

  try {
    const [payload, signature] = token.split('.');
    const expectedSignature = signPayload(payload);

    if (!safeCompare(signature, expectedSignature)) return null;

    const data = base64UrlDecode(payload);

    if (!data.exp || Date.now() > data.exp) return null;

    return data;
  } catch (error) {
    return null;
  }
}

function normalizeReportStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'pendiente') return 'recibido';
  if (normalized === 'en proceso') return 'en_atencion';
  if (normalized === 'resuelto') return 'completado';
  if (normalized === 'cancelado') return 'cancelado';

  return status || 'recibido';
}

function verifyPlainOrHashedPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;

  // Compatibilidad con bases de datos creadas antes de migrar a bcrypt.
  if (inputPassword === storedPassword) return true;

  try {
    // eslint-disable-next-line global-require
    const bcrypt = require('bcryptjs');
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
      return bcrypt.compareSync(inputPassword, storedPassword);
    }
  } catch (error) {
    return false;
  }

  return false;
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function parsePositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const verificarTrabajador = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  const trabajador = verifyWorkerToken(token);

  if (!trabajador) {
    return res.status(401).json({ error: true, message: 'Acceso no autorizado. Inicia sesión nuevamente.' });
  }

  req.trabajador = trabajador;
  next();
};

// GET /api/reportes — Obtener reportes públicos
const getReportes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `${publicReportSelect} WHERE ${validTypesWhereClause()} AND estado <> 'cancelado' ORDER BY fecha_creacion DESC`,
      VALID_REPORT_TYPES
    );
    res.json(rows);
  } catch (error) {
    console.error('getReportes error:', error);
    res.status(500).json({ error: 'Error al obtener los reportes' });
  }
};

// POST /api/reportes — Crear un reporte ciudadano
const createReporte = async (req, res) => {
  const body = req.body || {};
  const tipo = cleanText(body.tipo, 100);
  const ubicacion = cleanText(body.ubicacion, 255);
  const descripcion = cleanText(body.descripcion, 1200);
  const ciudadano = cleanText(body.ciudadano, 150);
  const senasLugar = cleanText(body.senas_lugar || body.senasLugar || body.referencia, 255);

  if (!tipo) return res.status(400).json({ error: 'El campo "tipo" es obligatorio' });
  if (!descripcion) return res.status(400).json({ error: 'El campo "descripcion" es obligatorio' });
  if (descripcion.length < 10) return res.status(400).json({ error: 'La descripcion debe tener al menos 10 caracteres' });

  const structured = {
    direccion: cleanText(ubicacion || body.direccion, 255),
    numeroExterior: cleanText(body.numeroExterior || body.noExterior, 30),
    noNumero: body.noNumero === true || body.noNumero === 'true',
    estado: cleanText(body.estado, 100),
    municipio: cleanText(body.municipio, 100),
    localidad: cleanText(body.localidad, 100),
    colonia: cleanText(body.colonia, 150),
    referencia: senasLugar,
    lat: body.lat,
    lng: body.lng,
    ubicacion,
  };

  const ubicValidation = validarUbicacionReporteBackend(structured);
  if (!ubicValidation.valid) {
    return res.status(400).json({ error: true, message: ubicValidation.message });
  }

  if (!VALID_REPORT_TYPES.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de incidencia no válido' });
  }

  try {
    const [duplicados] = await pool.query(
      `SELECT id
       FROM reportes
       WHERE tipo = ?
       AND ubicacion = ?
       AND COALESCE(senas_lugar, '') = ?
       AND descripcion = ?
       LIMIT 1`,
      [tipo, ubicacion, senasLugar, descripcion]
    );

    if (duplicados.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'Este reporte ya fue registrado. Revisa la pestaña de seguimiento para consultar su estado.',
        id: duplicados[0].id,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO reportes (tipo, ubicacion, senas_lugar, descripcion, ciudadano, estado)
       VALUES (?, ?, ?, ?, ?, 'recibido')`,
      [tipo, ubicacion, senasLugar || null, descripcion, ciudadano || 'Anónimo']
    );

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      id: result.insertId,
    });
  } catch (error) {
    console.error('createReporte error:', error);
    res.status(500).json({ error: 'Error al crear el reporte' });
  }
};

// POST /api/trabajadores/login — Login de trabajadores contra MySQL
const loginTrabajador = async (req, res) => {
  try {
    const body = req.body || {};
    const correo = cleanText(body.correo || body.email, 150).toLowerCase();
    const password = cleanText(body.password || body.contrasena || body.contraseña, 200);

    if (!correo || !password) {
      return res.status(400).json({ error: true, message: 'Correo y contraseña son obligatorios.' });
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, correo, password_hash, activo
       FROM trabajadores
       WHERE LOWER(correo) = ?
       LIMIT 1`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: true, message: 'Credenciales incorrectas.' });
    }

    const trabajador = rows[0];

    if (!trabajador.activo) {
      return res.status(403).json({ error: true, message: 'Este trabajador está inactivo.' });
    }

    const passwordValida = verifyPlainOrHashedPassword(password, trabajador.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: true, message: 'Credenciales incorrectas.' });
    }

    const token = createWorkerToken(trabajador);

    res.json({
      message: 'Inicio de sesión correcto.',
      token,
      trabajador: {
        id: trabajador.id,
        nombre: trabajador.nombre,
        correo: trabajador.correo,
      },
    });
  } catch (error) {
    console.error('loginTrabajador error:', error);
    res.status(500).json({ error: true, message: 'Error interno al iniciar sesión.' });
  }
};

// GET /api/trabajadores/reportes — Reportes para panel interno
const getReportesTrabajador = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `${publicReportSelect} WHERE ${validTypesWhereClause()} ORDER BY fecha_creacion DESC`,
      VALID_REPORT_TYPES
    );
    res.json(rows.map((report) => ({ ...report, estado: normalizeReportStatus(report.estado) })));
  } catch (error) {
    console.error('getReportesTrabajador error:', error);
    res.status(500).json({ error: true, message: 'Error al obtener reportes de trabajadores.' });
  }
};

// GET /api/trabajadores/reportes/:id — Detalle de reporte interno
const getReporteTrabajadorById = async (req, res) => {
  try {
    const reporteId = parsePositiveId(req.params.id);
    if (!reporteId) {
      return res.status(400).json({ error: true, message: 'ID de reporte invalido.' });
    }

    const [rows] = await pool.query(
      `${publicReportSelect} WHERE id = ? AND ${validTypesWhereClause()} LIMIT 1`,
      [reporteId, ...VALID_REPORT_TYPES]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Reporte no encontrado.' });
    }

    res.json({ ...rows[0], estado: normalizeReportStatus(rows[0].estado) });
  } catch (error) {
    console.error('getReporteTrabajadorById error:', error);
    res.status(500).json({ error: true, message: 'Error al obtener detalle del reporte.' });
  }
};

// PATCH /api/trabajadores/reportes/:id/tomar — Tomar reporte disponible
const tomarReporte = async (req, res) => {
  try {
    const reporteId = parsePositiveId(req.params.id);
    if (!reporteId) {
      return res.status(400).json({ error: true, message: 'ID de reporte invalido.' });
    }

    const trabajadorId = req.trabajador.id;

    const [result] = await pool.query(
      `UPDATE reportes
       SET estado = 'en_atencion',
           trabajador_id = ?
       WHERE id = ?
       AND tipo IN (${VALID_REPORT_TYPES.map(() => '?').join(', ')})
       AND estado = 'recibido'`,
      [trabajadorId, reporteId, ...VALID_REPORT_TYPES]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        error: true,
        message: 'Este reporte ya fue tomado o no está disponible.',
      });
    }

    const [rows] = await pool.query(`${publicReportSelect} WHERE id = ? LIMIT 1`, [reporteId]);
    res.json({ message: 'Reporte tomado correctamente.', reporte: rows[0] });
  } catch (error) {
    console.error('tomarReporte error:', error);
    res.status(500).json({ error: true, message: 'Error al tomar el reporte.' });
  }
};

// PATCH /api/trabajadores/reportes/:id/completar — Marcar reporte como completado
const completarReporte = async (req, res) => {
  try {
    const reporteId = parsePositiveId(req.params.id);
    if (!reporteId) {
      return res.status(400).json({ error: true, message: 'ID de reporte invalido.' });
    }

    const trabajadorId = req.trabajador.id;

    const [result] = await pool.query(
      `UPDATE reportes
       SET estado = 'completado'
       WHERE id = ?
       AND tipo IN (${VALID_REPORT_TYPES.map(() => '?').join(', ')})
       AND trabajador_id = ?
       AND estado = 'en_atencion'`,
      [reporteId, ...VALID_REPORT_TYPES, trabajadorId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error: true,
        message: 'No puedes completar este reporte. Debes tomarlo primero.',
      });
    }

    const [rows] = await pool.query(`${publicReportSelect} WHERE id = ? LIMIT 1`, [reporteId]);
    res.json({ message: 'Reporte completado correctamente.', reporte: rows[0] });
  } catch (error) {
    console.error('completarReporte error:', error);
    res.status(500).json({ error: true, message: 'Error al completar el reporte.' });
  }
};

// PATCH /api/trabajadores/reportes/:id/cancelar — Cancelar reporte con motivo
const cancelarReporte = async (req, res) => {
  try {
    const reporteId = parsePositiveId(req.params.id);
    if (!reporteId) {
      return res.status(400).json({ error: true, message: 'ID de reporte invalido.' });
    }

    const motivo = cleanText(req.body?.motivo, 500);
    if (!motivo || motivo.length < 10) {
      return res.status(400).json({
        error: true,
        message: 'Escribe un motivo de cancelacion de al menos 10 caracteres.',
      });
    }

    const trabajadorId = req.trabajador.id;

    const [result] = await pool.query(
      `UPDATE reportes
       SET estado = 'cancelado',
           trabajador_id = COALESCE(trabajador_id, ?),
           motivo_cancelacion = ?
       WHERE id = ?
       AND tipo IN (${VALID_REPORT_TYPES.map(() => '?').join(', ')})
       AND estado IN ('recibido', 'en_atencion')`,
      [trabajadorId, motivo, reporteId, ...VALID_REPORT_TYPES]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        error: true,
        message: 'Este reporte ya fue completado, cancelado o no esta disponible para cancelar.',
      });
    }

    const [rows] = await pool.query(`${publicReportSelect} WHERE id = ? LIMIT 1`, [reporteId]);
    res.json({ message: 'Reporte cancelado correctamente.', reporte: rows[0] });
  } catch (error) {
    console.error('cancelarReporte error:', error);
    res.status(500).json({ error: true, message: 'Error al cancelar el reporte.' });
  }
};

module.exports = {
  getReportes,
  createReporte,
  loginTrabajador,
  getReportesTrabajador,
  getReporteTrabajadorById,
  tomarReporte,
  completarReporte,
  cancelarReporte,
  verificarTrabajador,
};
