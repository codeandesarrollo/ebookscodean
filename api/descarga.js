import jwt from 'jsonwebtoken';

// Clave secreta para firmar/verificar tokens (debes configurarla en tus Variables de Entorno en Vercel)
const JWT_SECRET = process.env.JWT_SECRET;

// Para fines de demostración, se almacenan tokens usados en memoria.
// En producción, deberías usar una base de datos (Mongo, PostgreSQL, Redis, etc.)
let usedTokens = [];

export default async function handler(req, res) {
  // Extraer el token de la query string, ej: /api/descarga?token=XYZ
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Falta el token');
  }

  try {
    // Verificar que el token sea válido y no esté expirado
    const payload = jwt.verify(token, JWT_SECRET);

    // Revisar si el token ya se usó
    if (usedTokens.includes(token)) {
      return res.status(403).send('Este enlace ya ha sido utilizado.');
    }

    // Marcar el token como usado
    usedTokens.push(token);

    // Aquí podrías implementar lógica adicional, como registrar la descarga en una BD

    // Redirigir al usuario al PDF (o servirlo directamente)
    // Ejemplo: redirección a un archivo estático
    return res.redirect('https://tusitio.com/ebooks/mi-ebook.pdf');
  } catch (error) {
    // Si la verificación falla o el token está expirado, se rechaza la petición
    return res.status(403).send('Token inválido o expirado');
  }
}
