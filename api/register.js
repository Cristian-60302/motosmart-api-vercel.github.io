import bcrypt from 'bcryptjs';
import { handleOptions, publicUser, sendError, setCors, sql } from './_utils.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Metodo no permitido.');
  }

  try {
    const db = sql();
    const {
      nombre = '',
      email = '',
      password = '',
      marca = '',
      modelo = '',
      anio = null,
      kilometraje = 0
    } = req.body || {};

    const cleanName = String(nombre).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanName || !cleanEmail.includes('@') || String(password).length < 6) {
      return sendError(res, 422, 'Completa nombre, correo valido y contrasena minima de 6 caracteres.');
    }

    const existing = await db`
      SELECT id FROM usuarios WHERE email = ${cleanEmail} LIMIT 1
    `;

    if (existing.length > 0) {
      return sendError(res, 409, 'Ya existe un usuario con este correo.');
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const users = await db`
      INSERT INTO usuarios (nombre, email, password_hash, marca, modelo, anio, kilometraje)
      VALUES (
        ${cleanName},
        ${cleanEmail},
        ${passwordHash},
        ${String(marca || '').trim() || null},
        ${String(modelo || '').trim() || null},
        ${anio ? Number(anio) : null},
        ${kilometraje ? Number(kilometraje) : 0}
      )
      RETURNING id, nombre, email, marca, modelo, anio, kilometraje
    `;

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente.',
      user: publicUser(users[0])
    });
  } catch (error) {
    return sendError(res, 500, 'Error al registrar usuario.');
  }
}
