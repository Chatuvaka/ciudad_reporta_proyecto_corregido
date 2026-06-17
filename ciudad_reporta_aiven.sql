CREATE TABLE IF NOT EXISTS trabajadores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  correo          VARCHAR(150) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  activo          BOOLEAN DEFAULT TRUE,
  fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reportes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  tipo                VARCHAR(100) NOT NULL,
  ubicacion           VARCHAR(255) NOT NULL,
  senas_lugar         VARCHAR(255) DEFAULT NULL,
  descripcion         TEXT NOT NULL,
  ciudadano           VARCHAR(150) DEFAULT 'Anónimo',
  estado              ENUM('recibido', 'en_atencion', 'completado', 'cancelado') DEFAULT 'recibido',
  trabajador_id       INT NULL,
  fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
  motivo_cancelacion  TEXT NULL,

  CONSTRAINT chk_reportes_tipo_permitido
    CHECK (tipo IN (
      'Bache',
      'Luminaria dañada',
      'Fuga de agua',
      'Basura acumulada',
      'Señalización dañada',
      'Árbol caído'
    )),

  CONSTRAINT fk_reportes_trabajador
    FOREIGN KEY (trabajador_id)
    REFERENCES trabajadores(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_reportes_tipo ON reportes(tipo);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_creacion);
CREATE INDEX idx_reportes_trabajador ON reportes(trabajador_id);

INSERT INTO trabajadores (nombre, correo, password_hash) VALUES
  ('Trabajador Demo', 'trabajador@sonora.gob.mx', '$2b$10$K/aDqpx.ZRBkzWRriz5pN.wXtKc.01Gg3ZppxCs0LeNE6/QHykdMS'),
  ('Luis Martínez', 'luis.martinez@sonora.gob.mx', '$2b$10$K/aDqpx.ZRBkzWRriz5pN.wXtKc.01Gg3ZppxCs0LeNE6/QHykdMS'),
  ('Fernanda Ruiz', 'fernanda.ruiz@sonora.gob.mx', '$2b$10$K/aDqpx.ZRBkzWRriz5pN.wXtKc.01Gg3ZppxCs0LeNE6/QHykdMS')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  password_hash = VALUES(password_hash),
  activo = TRUE;

INSERT INTO reportes
  (tipo, ubicacion, senas_lugar, descripcion, ciudadano, estado, trabajador_id, motivo_cancelacion)
VALUES
  (
    'Bache',
    'Av. Reforma #120, Colonia Centro, San Luis Río Colorado, Sonora',
    'Frente a la farmacia de la esquina',
    'Bache de gran tamaño que dificulta el paso de vehículos.',
    'Carlos Ramírez',
    'recibido',
    NULL,
    NULL
  ),
  (
    'Luminaria dañada',
    'Calle Hidalgo y Av. Morelos, San Luis Río Colorado, Sonora',
    'Poste ubicado frente al parque',
    'Lámpara apagada desde hace dos semanas.',
    'Ana López',
    'en_atencion',
    1,
    NULL
  ),
  (
    'Fuga de agua',
    'Blvd. Juárez #45, Colonia Las Palmas, San Luis Río Colorado, Sonora',
    'Junto a la toma pública',
    'Fuga visible en la toma pública de agua potable.',
    'Anónimo',
    'completado',
    2,
    NULL
  ),
  (
    'Basura acumulada',
    'Parque Municipal, entrada principal, San Luis Río Colorado, Sonora',
    'Contenedores de la entrada norte',
    'Contenedores desbordados sin recolección en varios días.',
    'Jorge Medina',
    'cancelado',
    3,
    'El reporte fue duplicado por una solicitud interna previamente atendida.'
  ),
  (
    'Señalización dañada',
    'Calle 5 de Mayo y Av. Independencia, San Luis Río Colorado, Sonora',
    'Señal ubicada en el cruce principal',
    'Señal de alto caída y con riesgo de accidente.',
    'María Torres',
    'recibido',
    NULL,
    NULL
  ),
  (
    'Árbol caído',
    'Calle 8 y Av. Kino, San Luis Río Colorado, Sonora',
    'Árbol junto a la banqueta del lado poniente',
    'Árbol caído obstruyendo la banqueta y parte de la calle.',
    'Anónimo',
    'en_atencion',
    1,
    NULL
  );
