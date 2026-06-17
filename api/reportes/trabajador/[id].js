import pool from '../../../lib/db.js';
import { verificarTrabajador } from '../../../lib/auth.js';
import { publicReportSelect, validTypesWhereClause, VALID_REPORT_TYPES, normalizeReportStatus, parsePositiveId } from '../../../lib/helpers.js';

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
    const reporteId = parsePositiveId(req.query.id);
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
}
