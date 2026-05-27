import { neon } from '@neondatabase/serverless';

const allowedOrigins = [
  'https://cristian-60302.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

export function setCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleOptions(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

export function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta configurar DATABASE_URL en Vercel.');
  }

  return neon(process.env.DATABASE_URL);
}

export function publicUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    marca: user.marca,
    modelo: user.modelo,
    anio: user.anio,
    kilometraje: user.kilometraje
  };
}

export function sendError(res, status, message) {
  return res.status(status).json({ ok: false, message });
}
