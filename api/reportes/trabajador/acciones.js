import pool from '../../../lib/db.js';
import { verificarTrabajador } from '../../../lib/auth.js';
import { publicReportSelect, validTypesWhereClause, VALID_REPORT_TYPES, parsePositiveId, cleanText, parseJsonBody } from '../../../lib/helpers.js';

export default async function handler(req, res) {
  const trabajador = verificarTrabajador(req);
  if (!trabajador) {
    return res.status(401).json({ error: true, message: 'Acceso no autorizado. Inicia sesión nuevamente.' });
  }

  try {
    if (req.method === 'GET') {
      if (req.query.action === 'getById') {
        const reporteId = parsePositiveId(req.query.id);
        if (!reporteId) return res.status(400).json({ error: true, message: 'ID invalido.' });

        const [rows] = await pool.query(`${publicReportSelect} WHERE id = ? AND ${validTypesWhereClause()} LIMIT 1`, [reporteId, ...VALID_REPORT_TYPES]);
        if (rows.length === 0) return res.status(404).json({ error: true, message: 'Reporte no encontrado.' });

        return res.json(rows[0]);
      }
    }

    if (req.method === 'POST') {
      const body = req.body || await parseJsonBody(req);
      const { action, id } = body;
      const reporteId = parsePositiveId(id);
      if (!reporteId) return res.status(400).json({ error: true, message: 'ID invalido.' });

      if (action === 'tomar') {
        const [result] = await pool.query(`UPDATE reportes SET estado = 'en_atencion', trabajador_id = ? WHERE id = ? AND ${validTypesWhereClause()} AND estado = 'recibido'`, [trabajador.id, reporteId, ...VALID_REPORT_TYPES]);
        if (result.affectedRows === 0) return res.status(409).json({ error: true, message: 'No se pudo tomar.' });
        return res.json({ message: 'OK' });
      }

      if (action === 'completar') {
        const [result] = await pool.query(`UPDATE reportes SET estado = 'completado' WHERE id = ? AND ${validTypesWhereClause()} AND trabajador_id = ? AND estado = 'en_atencion'`, [reporteId, ...VALID_REPORT_TYPES, trabajador.id]);
        if (result.affectedRows === 0) return res.status(403).json({ error: true, message: 'No se pudo completar.' });
        return res.json({ message: 'OK' });
      }

      if (action === 'cancelar') {
        const motivo = cleanText(body.motivo, 500);
        if (!motivo || motivo.length < 10) return res.status(400).json({ error: true, message: 'Escribe un motivo de cancelacion de al menos 10 caracteres.' });
        const [result] = await pool.query(`UPDATE reportes SET estado = 'cancelado', trabajador_id = COALESCE(trabajador_id, ?), motivo_cancelacion = ? WHERE id = ? AND ${validTypesWhereClause()} AND estado IN ('recibido', 'en_atencion')`, [trabajador.id, motivo, reporteId, ...VALID_REPORT_TYPES]);
        if (result.affectedRows === 0) return res.status(409).json({ error: true, message: 'No se pudo cancelar.' });
        return res.json({ message: 'OK' });
      }
    }

    res.status(405).json({ error: true, message: 'Método no permitido' });
  } catch (error) {
    console.error('acciones error:', error);
    res.status(500).json({ error: true, message: 'Error interno.' });
  }
}
