import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecretkey', {
      expiresIn: 86400, // 24 horas
    });

    res.status(200).json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      accessToken: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, passwordHash]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
