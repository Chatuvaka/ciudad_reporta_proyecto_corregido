import pool from '../../../lib/db.js';
import { verificarTrabajador } from '../../../lib/auth.js';
import { publicReportSelect, validTypesWhereClause, VALID_REPORT_TYPES, normalizeReportStatus } from '../../../lib/helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: true, message: 'Método no permitido.' });
  }

  const trabajador = verificarTrabajador(req);
  if (!trabajador) {
    return res.status(401).json({ error: true, message: 'Acceso no autorizado. Inicia sesión nuevamente.' });
  }

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
}
