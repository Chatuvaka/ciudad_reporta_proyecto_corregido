import pool from '../../lib/db.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const TOKEN_SECRET = process.env.WORKER_TOKEN_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
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

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      if (!raw) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function verifyPlainOrHashedPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  if (inputPassword === storedPassword) return true;

  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
    return bcrypt.compareSync(inputPassword, storedPassword);
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: true, message: 'Método no permitido.' });
  }

  try {
    let body = {};

    if ('body' in req) {
      try {
        body = req.body || {};
      } catch (err) {
        body = {};
      }
    }

    const parsedBody = Object.keys(body).length ? body : await parseJsonBody(req);
    const correo = cleanText(parsedBody.correo || parsedBody.email, 150).toLowerCase();
    const password = cleanText(parsedBody.password || parsedBody.contrasena || parsedBody.contraseña, 200);

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

    return res.json({
      message: 'Inicio de sesión correcto.',
      token,
      trabajador: {
        id: trabajador.id,
        nombre: trabajador.nombre,
        correo: trabajador.correo,
      },
    });
  } catch (error) {
    console.error('trabajadores/login error:', error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: true, message: 'JSON inválido en la petición.' });
    }

    return res.status(500).json({ error: true, message: 'Error interno al iniciar sesión.' });
  }
}
