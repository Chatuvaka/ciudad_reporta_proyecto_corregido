export const publicReportSelect = `
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

export const VALID_REPORT_TYPES = [
  'Bache',
  'Luminaria dañada',
  'Fuga de agua',
  'Basura acumulada',
  'Señalización dañada',
  'Árbol caído',
];

export function validTypesWhereClause() {
  return `tipo IN (${VALID_REPORT_TYPES.map(() => '?').join(', ')})`;
}

export function normalizeReportStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'pendiente') return 'recibido';
  if (normalized === 'en proceso') return 'en_atencion';
  if (normalized === 'resuelto') return 'completado';
  if (normalized === 'cancelado') return 'cancelado';

  return status || 'recibido';
}

export function parsePositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function parseJsonBody(req) {
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
