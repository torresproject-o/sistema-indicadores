import pool from '../config/db.js';

export const getKPIs = async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(total_linea), 0) AS total_ingresos,
        COUNT(id) AS total_transacciones,
        COALESCE(AVG(total_linea), 0) AS ticket_promedio
      FROM registros_datos
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ message: 'Error fetching KPIs' });
  }
};

export const getSalesOverTime = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(fecha_registro, 'YYYY-MM-DD') AS date,
        SUM(total_linea) AS total
      FROM registros_datos
      GROUP BY fecha_registro
      ORDER BY fecha_registro ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching Sales Over Time:', error);
    res.status(500).json({ message: 'Error fetching Sales Over Time' });
  }
};

export const getSalesByCategory = async (req, res) => {
  try {
    const query = `
      SELECT 
        categoria AS name,
        SUM(total_linea) AS value
      FROM registros_datos
      GROUP BY categoria
      ORDER BY value DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching Sales By Category:', error);
    res.status(500).json({ message: 'Error fetching Sales By Category' });
  }
};
