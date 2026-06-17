import pool from "../lib/db.js";

function limpiarTexto(valor) {
  if (typeof valor !== "string") return "";
  return valor.trim().replace(/\s+/g, " ");
}

function validarReporte(data) {
  const tipo = limpiarTexto(data.tipo);
  const ubicacion = limpiarTexto(data.ubicacion);
  const senas_lugar = limpiarTexto(data.senas_lugar);
  const descripcion = limpiarTexto(data.descripcion);
  const ciudadano = limpiarTexto(data.ciudadano) || "Anónimo";
  const estado = limpiarTexto(data.estado) || "pendiente";

  if (!tipo) {
    return { error: "Selecciona el tipo de incidencia." };
  }

  if (!ubicacion || ubicacion.length < 8) {
    return { error: "La ubicación es obligatoria y debe ser más específica." };
  }

  if (!senas_lugar || senas_lugar.length < 10) {
    return { error: "Agrega señas del lugar más claras." };
  }

  if (!descripcion || descripcion.length < 15) {
    return { error: "Describe mejor el problema reportado." };
  }

  return {
    reporte: {
      tipo,
      ubicacion,
      senas_lugar,
      descripcion,
      ciudadano,
      estado,
    },
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const [rows] = await pool.query(`
        SELECT 
          id,
          tipo,
          ubicacion,
          senas_lugar,
          descripcion,
          ciudadano,
          estado,
          fecha_creacion,
          fecha_atencion,
          trabajador_id,
          motivo_cancelacion
        FROM reportes
        ORDER BY fecha_creacion DESC
      `);

      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const validacion = validarReporte(req.body);

      if (validacion.error) {
        return res.status(400).json({
          error: validacion.error,
        });
      }

      const {
        tipo,
        ubicacion,
        senas_lugar,
        descripcion,
        ciudadano,
        estado,
      } = validacion.reporte;

      const [result] = await pool.query(
        `
        INSERT INTO reportes
        (
          tipo,
          ubicacion,
          senas_lugar,
          descripcion,
          ciudadano,
          estado
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          tipo,
          ubicacion,
          senas_lugar,
          descripcion,
          ciudadano,
          estado,
        ]
      );

      return res.status(201).json({
        mensaje: "Reporte creado correctamente.",
        id: result.insertId,
      });
    }

    return res.status(405).json({
      error: "Método no permitido.",
    });
  } catch (error) {
    console.error("Error en /api/reportes:", error);

    return res.status(500).json({
      error: "Error interno del servidor.",
      detalle: error.message,
    });
  }
}