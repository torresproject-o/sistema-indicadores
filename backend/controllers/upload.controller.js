import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import pool from '../config/db.js';
import path from 'path';
import stream from 'stream';

// Setup multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

const processData = async (data, filename, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create entry in cargas_archivos
    const cargaResult = await client.query(
      'INSERT INTO cargas_archivos (nombre_archivo, usuario_id, registros_cargados) VALUES ($1, $2, $3) RETURNING id',
      [filename, userId, data.length]
    );
    const cargaId = cargaResult.rows[0].id;

    // 2. Insert data into registros_datos
    for (const row of data) {
      // Map columns: Fecha, Categoría, Producto/Servicio, Cantidad, Precio Unitario
      const fechaRaw = row['Fecha'] || row['fecha'] || row['fecha_registro'];
      const categoria = row['Categoría'] || row['Categoria'] || row['categoria'];
      const productoServicio = row['Producto/Servicio'] || row['Producto'] || row['producto_servicio'];
      const cantidad = row['Cantidad'] || row['cantidad'];
      const precioUnitario = row['Precio Unitario'] || row['Precio'] || row['precio_unitario'];

      if (!fechaRaw || !categoria || !productoServicio || !cantidad || !precioUnitario) {
         console.warn(`Skipping row due to missing data: ${JSON.stringify(row)}`);
         continue; // skip invalid rows
      }

      let fecha = fechaRaw;
      if (fechaRaw instanceof Date) {
        // Handle JS Date from xlsx
        const offset = fechaRaw.getTimezoneOffset() * 60000;
        fecha = new Date(fechaRaw.getTime() - offset).toISOString().split('T')[0];
      } else if (typeof fechaRaw === 'string') {
        // Handle DD-MM-YYYY or DD/MM/YYYY
        const matchDDMMYYYY = fechaRaw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
        if (matchDDMMYYYY) {
          fecha = `${matchDDMMYYYY[3]}-${matchDDMMYYYY[2]}-${matchDDMMYYYY[1]}`;
        } else {
          // Handle M/D/YY or D/M/YY
          const matchMDYY = fechaRaw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
          if (matchMDYY) {
            let year = parseInt(matchMDYY[3]);
            if (year < 100) year += year < 50 ? 2000 : 1900;
            let p1 = parseInt(matchMDYY[1]);
            let p2 = parseInt(matchMDYY[2]);
            let month = p1;
            let day = p2;
            if (p1 > 12) {
               month = p2;
               day = p1;
            }
            fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        }
      }

      await client.query(
        `INSERT INTO registros_datos (carga_id, fecha_registro, categoria, producto_servicio, cantidad, precio_unitario) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cargaId, fecha, categoria, productoServicio, cantidad, precioUnitario]
      );
    }

    await client.query('COMMIT');
    return { success: true, count: data.length, cargaId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const handleUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileExt = path.extname(req.file.originalname).toLowerCase();
  const userId = req.userId; // Provided by authMiddleware

  let data = [];

  try {
    if (fileExt === '.csv') {
      // Parse CSV from buffer
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      
      bufferStream
        .pipe(csvParser())
        .on('data', (row) => data.push(row))
        .on('end', async () => {
          try {
            const result = await processData(data, req.file.originalname, userId);
            res.status(200).json({ message: 'CSV File processed successfully', data: result });
          } catch (err) {
            console.error('Error processing CSV to DB', err);
            res.status(500).json({ message: 'Database error processing file' });
          }
        });

    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // Parse Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true });
      
      const result = await processData(data, req.file.originalname, userId);
      res.status(200).json({ message: 'Excel File processed successfully', data: result });

    } else {
      return res.status(400).json({ message: 'Unsupported file format. Use .csv or .xlsx' });
    }
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ message: 'Error processing file' });
  }
};
