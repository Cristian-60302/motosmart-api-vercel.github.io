import { handleOptions, setCors } from './_utils.js';

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  return res.status(200).json({
    ok: true,
    message: 'API MotoSmart activa.'
  });
}
