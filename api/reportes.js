import { query as dbQuery } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [rows] = await dbQuery('SELECT * FROM reportes ORDER BY fecha_creacion DESC', []);
      res.status(200).json(rows);
      return;
    }

    if (req.method === 'POST') {
      const { tipo, ubicacion, senas_lugar, descripcion, ciudadano, estado } = req.body || {};

      if (!tipo || !ubicacion || !descripcion) {
        res.status(400).json({ error: 'validation_error', message: 'Campos obligatorios: tipo, ubicacion, descripcion' });
        return;
      }

      const user = ciudadano || 'Anónimo';
      const st = estado || 'pendiente';

      const sql = 'INSERT INTO reportes (tipo, ubicacion, senas_lugar, descripcion, ciudadano, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      const params = [tipo, ubicacion, senas_lugar || null, descripcion, user, st];

      const [result] = await dbQuery(sql, params);
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
