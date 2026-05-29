-- 1. Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Cargas de Archivos
CREATE TABLE cargas_archivos (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    registros_cargados INT DEFAULT 0,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Datos (Contenido del CSV/Excel)
CREATE TABLE registros_datos (
    id SERIAL PRIMARY KEY,
    carga_id INT REFERENCES cargas_archivos(id) ON DELETE CASCADE,
    fecha_registro DATE NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    producto_servicio VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    total_linea NUMERIC(12, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registros_fecha ON registros_datos(fecha_registro);
CREATE INDEX idx_registros_categoria ON registros_datos(categoria);

-- Seed de usuario por defecto (Contraseña: admin123)
-- Hash de 'admin123' usando bcrypt
INSERT INTO usuarios (nombre, email, password_hash)
VALUES ('Administrador', 'admin@sistema.com', '$2b$10$zS39L33.Y4Fh2hJToJ8gEuN4w.65Z/g.Q4rOaW4u49P3L2/k4pSDe');
