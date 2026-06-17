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
       SET estado = 'en_atencion',
           trabajador_id = ?
       WHERE id = ?
       AND ${validTypesWhereClause()}
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
}
