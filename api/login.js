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
    const { email = '', password = '' } = req.body || {};
    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanEmail.includes('@') || !password) {
      return sendError(res, 422, 'Correo o contrasena invalidos.');
    }

    const users = await db`
      SELECT id, nombre, email, password_hash, marca, modelo, anio, kilometraje
      FROM usuarios
      WHERE email = ${cleanEmail}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return sendError(res, 401, 'El usuario no existe o la contrasena es incorrecta.');
    }

    const validPassword = await bcrypt.compare(String(password), user.password_hash);

    if (!validPassword) {
      return sendError(res, 401, 'El usuario no existe o la contrasena es incorrecta.');
    }

    return res.status(200).json({
      ok: true,
      message: 'Sesion iniciada.',
      user: publicUser(user)
    });
  } catch (error) {
    return sendError(res, 500, 'Error al iniciar sesion.');
  }
}
