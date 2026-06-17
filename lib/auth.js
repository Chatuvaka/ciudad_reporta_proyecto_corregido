import crypto from 'crypto';

const TOKEN_SECRET = process.env.WORKER_TOKEN_SECRET || process.env.JWT_SECRET || 'ciudad_reporta_default_secret_key_123';

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

export function createWorkerToken(trabajador) {
  const payload = base64UrlEncode({
    id: trabajador.id,
    nombre: trabajador.nombre,
    correo: trabajador.correo,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  });

  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyWorkerToken(token) {
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

export function verificarTrabajador(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  return verifyWorkerToken(token);
}
