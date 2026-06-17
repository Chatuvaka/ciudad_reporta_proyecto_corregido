import pool from '../lib/db.js';

const ALLOWED_ESTADOS = ['recibido', 'en_atencion', 'completado', 'cancelado'];

function limpiarTexto(v) {
  if (typeof v !== 'string') return '';
  return v.trim().replace(/\s+/g, ' ');
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT * FROM reportes ORDER BY fecha_creacion DESC');
      res.status(200).json(rows);
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const tipo = limpiarTexto(body.tipo);
      const ubicacion = limpiarTexto(body.ubicacion);
      const senas_lugar = limpiarTexto(body.senas_lugar || body.referencia || '');
      const descripcion = limpiarTexto(body.descripcion);
      const ciudadano = limpiarTexto(body.ciudadano) || 'Anónimo';
      const estado = limpiarTexto(body.estado);

      if (!tipo || !ubicacion || !descripcion) {
        res.status(400).json({ error: 'validation_error', message: 'Campos obligatorios: tipo, ubicacion, descripcion' });
        return;
      }

      const st = ALLOWED_ESTADOS.includes(estado) ? estado : 'recibido';

      const sql = 'INSERT INTO reportes (tipo, ubicacion, senas_lugar, descripcion, ciudadano, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      const params = [tipo, ubicacion, senas_lugar || null, descripcion, ciudadano, st];

      const [result] = await pool.query(sql, params);
      res.status(201).json({ insertedId: result.insertId });
      return;
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('api/reportes error', err);
    res.status(500).json({ error: 'server_error', message: err.message });
  }
}
