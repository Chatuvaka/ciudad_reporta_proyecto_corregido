import pool from '../../../../lib/db.js';
import { verificarTrabajador } from '../../../../lib/auth.js';
import { publicReportSelect, validTypesWhereClause, VALID_REPORT_TYPES, parsePositiveId, cleanText, parseJsonBody } from '../../../../lib/helpers.js';

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

    const body = req.body || await parseJsonBody(req);
    const motivo = cleanText(body.motivo, 500);
    
    if (!motivo || motivo.length < 10) {
      return res.status(400).json({
        error: true,
        message: 'Escribe un motivo de cancelacion de al menos 10 caracteres.',
      });
    }

    const trabajadorId = trabajador.id;

    const [result] = await pool.query(
      `UPDATE reportes
       SET estado = 'cancelado',
           trabajador_id = COALESCE(trabajador_id, ?),
           motivo_cancelacion = ?
       WHERE id = ?
       AND ${validTypesWhereClause()}
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
}
