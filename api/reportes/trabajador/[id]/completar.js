import pool from '../../../../lib/db.js';
import { verificarTrabajador } from '../../../../lib/auth.js';
import { publicReportSelect, validTypesWhereClause, VALID_REPORT_TYPES, parsePositiveId } from '../../../../lib/helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'POST, PATCH');
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

    const trabajadorId = trabajador.id;

    const [result] = await pool.query(
      `UPDATE reportes
       SET estado = 'completado'
       WHERE id = ?
       AND ${validTypesWhereClause()}
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
}
